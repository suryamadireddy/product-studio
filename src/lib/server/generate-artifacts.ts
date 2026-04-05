import "server-only";

import { openai } from "@/lib/openai/server";
import { createArtifact } from "@/lib/server/artifacts";
import type { Response } from "openai/resources/responses/responses";

type GeneratedArtifacts = {
  brief: string;
  synthesis: string;
  prd: string;
  directions: string;
};

function extractTextFromResponse(response: Response): string {
    const output = response.output ?? [];
  
    const texts: string[] = [];
  
    for (const item of output) {
      if (item.type !== "message") continue;
  
      for (const content of item.content ?? []) {
        if (content.type === "output_text" && typeof content.text === "string") {
          texts.push(content.text);
        }
      }
    }
  
    return texts.join("\n").trim();
  }

function parseArtifactsJson(rawText: string): GeneratedArtifacts {
  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Model returned invalid JSON");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("brief" in parsed) ||
    !("synthesis" in parsed) ||
    !("prd" in parsed) ||
    !("directions" in parsed)
  ) {
    throw new Error("Model JSON missing required artifact fields");
  }

  const obj = parsed as Record<string, unknown>;

  for (const key of ["brief", "synthesis", "prd", "directions"]) {
    if (typeof obj[key] !== "string" || !obj[key].trim()) {
      throw new Error(`Model JSON field "${key}" must be a non-empty string`);
    }
  }

  return {
    brief: obj.brief as string,
    synthesis: obj.synthesis as string,
    prd: obj.prd as string,
    directions: obj.directions as string,
  };
}

export async function generateInitialArtifactsForProject(input: {
    projectId: string;
    projectTitle: string;
    ideaInput: string;
  }) {
    console.log("generateInitialArtifactsForProject: start", {
      projectId: input.projectId,
      projectTitle: input.projectTitle,
    });
  
    console.log("generateInitialArtifactsForProject: before openai call");
  
    const response = await openai.responses.create({
      model: "gpt-5",
      instructions: [
        "You are a senior product strategist helping generate first-draft product artifacts.",
        "Return valid JSON only.",
        "Do not wrap the JSON in markdown fences.",
        "The JSON object must contain exactly these keys: brief, synthesis, prd, directions.",
        "Each value must be a markdown string.",
        "Make the writing concrete, product-oriented, and portfolio-quality.",
        "Do not mention that this is AI-generated.",
      ].join(" "),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Project title: ${input.projectTitle}`,
                "",
                "Raw idea input:",
                input.ideaInput,
                "",
                "Generate four markdown artifacts:",
                "1. brief",
                "2. synthesis",
                "3. prd",
                "4. directions",
                "",
                "Requirements:",
                "- brief: short framing of the product concept, user, problem, and value",
                "- synthesis: key observations, assumptions, risks, and opportunities",
                "- prd: a strong first-draft PRD with goals, users, problem, solution, scope, UX, risks, and success measures",
                "- directions: 2 to 4 prototype/build directions with tradeoffs and when each is appropriate",
                "",
                "Return JSON only.",
              ].join("\n"),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "text",
        },
      },
    });
  
    console.log("generateInitialArtifactsForProject: after openai call");
  
    const rawText = extractTextFromResponse(response);
    console.log("generateInitialArtifactsForProject: extracted text", rawText);
  
    const generated = parseArtifactsJson(rawText);
    console.log("generateInitialArtifactsForProject: parsed json");
  
    const [brief, synthesis, prd, directions] = await Promise.all([
      createArtifact({
        projectId: input.projectId,
        artifactType: "brief",
        contentMd: generated.brief,
        generationMethod: "initial",
      }),
      createArtifact({
        projectId: input.projectId,
        artifactType: "synthesis",
        contentMd: generated.synthesis,
        generationMethod: "initial",
      }),
      createArtifact({
        projectId: input.projectId,
        artifactType: "prd",
        contentMd: generated.prd,
        generationMethod: "initial",
      }),
      createArtifact({
        projectId: input.projectId,
        artifactType: "directions",
        contentMd: generated.directions,
        generationMethod: "initial",
      }),
    ]);
  
    console.log("generateInitialArtifactsForProject: artifacts saved");
  
    return {
      responseId: response.id,
      artifacts: {
        brief,
        synthesis,
        prd,
        directions,
      },
    };
  }
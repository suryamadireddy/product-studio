import "server-only";

import { openai } from "@/lib/openai/server";
import { createArtifact, getCurrentArtifactByType } from "@/lib/server/artifacts";
import type { ArtifactType } from "@/lib/types";
import type { Response } from "openai/resources/responses/responses";


type ProjectInput = {
  id: string;
  title: string;
  raw_idea: string;
  domain?: string | null;
  intended_audience?: string | null;
};

function extractTextFromResponse(response: Response): string {
  const output = response?.output ?? [];
  const texts: string[] = [];

  for (const item of output) {
    if (item?.type !== "message") continue;

    for (const content of item.content ?? []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        texts.push(content.text);
      }
    }
  }

  return texts.join("\n").trim();
}

function getBriefPrompt(project: ProjectInput): string {
  return [
    `Project title: ${project.title}`,
    "",
    "Raw idea:",
    project.raw_idea,
    "",
    project.domain ? `Domain: ${project.domain}` : "",
    project.intended_audience
      ? `Intended audience: ${project.intended_audience}`
      : "",
    "",
    "Write a strong first-draft product brief in markdown.",
    "",
    "Include these sections:",
    "- Overview",
    "- User / Audience",
    "- Core Problem",
    "- Why This Matters",
    "- Proposed Product Idea",
    "- Key Assumptions",
    "- Open Questions",
    "",
    "Keep it concrete, concise, and product-oriented.",
    "Do not mention that this was AI-generated.",
  ]
    .filter(Boolean)
    .join("\n");
}

function getSynthesisPrompt(project: ProjectInput, briefContent: string): string {
  return [
    `Project title: ${project.title}`,
    "",
    "Raw idea:",
    project.raw_idea,
    "",
    project.domain ? `Domain: ${project.domain}` : "",
    project.intended_audience
      ? `Intended audience: ${project.intended_audience}`
      : "",
    "",
    "Current brief:",
    briefContent,
    "",
    "Write a structured product synthesis in markdown.",
    "",
    "Purpose:",
    "Synthesize the brief into sharper product thinking, highlighting what matters most before writing the PRD.",
    "",
    "Include these sections:",
    "- Key Insights",
    "- User Patterns and Behaviors",
    "- Main Constraints",
    "- Risks and Unknowns",
    "- Opportunity Areas",
    "- Product Implications",
    "- Questions to Resolve Before PRD",
    "",
    "Keep it strategic, concrete, and product-oriented.",
    "Do not repeat the brief verbatim.",
    "Do not mention that this was AI-generated.",
  ]
    .filter(Boolean)
    .join("\n");
}

function getPrdPrompt(
  project: ProjectInput,
  briefContent: string,
  synthesisContent: string
): string {
  return [
    `Project title: ${project.title}`,
    "",
    "Raw idea:",
    project.raw_idea,
    "",
    project.domain ? `Domain: ${project.domain}` : "",
    project.intended_audience
      ? `Intended audience: ${project.intended_audience}`
      : "",
    "",
    "Current brief:",
    briefContent,
    "",
    "Current synthesis:",
    synthesisContent,
    "",
    "Write a strong first-draft PRD in markdown.",
    "",
    "Include these sections:",
    "- Product Overview",
    "- Problem Statement",
    "- Target Users",
    "- Goals",
    "- Non-Goals",
    "- Product Approach",
    "- Core User Experience",
    "- Functional Requirements",
    "- Risks and Open Questions",
    "- Success Metrics",
    "",
    "Keep it concrete, structured, and product-oriented.",
    "Do not repeat the brief or synthesis verbatim.",
    "Do not mention that this was AI-generated.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function getPromptForArtifact(
  project: ProjectInput,
  artifactType: ArtifactType
): Promise<string> {
  if (artifactType === "brief") {
    return getBriefPrompt(project);
  }

  if (artifactType === "synthesis") {
    const currentBrief = await getCurrentArtifactByType(project.id, "brief");

    if (!currentBrief) {
      throw new Error("Cannot generate synthesis without a current brief");
    }

    return getSynthesisPrompt(project, currentBrief.content_md);
  }

  if (artifactType === "prd") {
    const currentBrief = await getCurrentArtifactByType(project.id, "brief");
    const currentSynthesis = await getCurrentArtifactByType(project.id, "synthesis");

    if (!currentBrief) {
      throw new Error("Cannot generate PRD without a current brief");
    }

    if (!currentSynthesis) {
      throw new Error("Cannot generate PRD without a current synthesis");
    }

    return getPrdPrompt(project, currentBrief.content_md, currentSynthesis.content_md);
  }

  throw new Error(`Unsupported artifact type: ${artifactType}`);
}

export async function generateSingleArtifactForProject(input: {
  project: ProjectInput;
  artifactType: ArtifactType;
}) {
  const prompt = await getPromptForArtifact(input.project, input.artifactType);

  const response = await openai.responses.create({
    model: "gpt-5",
    instructions:
      "You are a senior product strategist. Return only the requested artifact as markdown.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: prompt,
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

  const contentMd = extractTextFromResponse(response);

  if (!contentMd) {
    throw new Error("Model returned empty artifact content");
  }

  const artifact = await createArtifact({
    projectId: input.project.id,
    artifactType: input.artifactType,
    contentMd,
    generationMethod: "initial",
  });

  return {
    responseId: response.id,
    artifact,
  };
}

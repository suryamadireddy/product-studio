import "server-only";

import { openai } from "@/lib/openai/server";
import {
  createArtifact,
  getCurrentArtifactByType,
} from "@/lib/server/artifacts";
import type { ArtifactType } from "@/lib/types";
import type { Response } from "openai/resources/responses/responses";

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

function artifactLabel(type: ArtifactType): string {
  switch (type) {
    case "brief":
      return "product brief";
    case "synthesis":
      return "research synthesis";
    case "prd":
      return "product requirements document";
    case "directions":
      return "prototype directions";
    default:
      return type;
  }
}

export async function refineArtifactForProject(input: {
  projectId: string;
  projectTitle: string;
  artifactType: ArtifactType;
  refinementPrompt: string;
}) {
  const currentArtifact = await getCurrentArtifactByType(
    input.projectId,
    input.artifactType,
  );

  if (!currentArtifact) {
    throw new Error(
      `No current ${input.artifactType} artifact exists to refine`,
    );
  }

  const response = await openai.responses.create({
    model: "gpt-5",
    instructions: [
      "You are a senior product strategist revising an existing product artifact.",
      "Return only the revised artifact as markdown.",
      "Do not explain what changed.",
      "Do not wrap the answer in code fences.",
      "Preserve the artifact's purpose, but improve it based on the refinement request.",
      "Make the output concrete, well-structured, and portfolio-quality.",
    ].join(" "),
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: [
              `Project title: ${input.projectTitle}`,
              `Artifact type: ${input.artifactType} (${artifactLabel(input.artifactType)})`,
              "",
              "Current artifact:",
              currentArtifact.content_md,
              "",
              "Refinement request:",
              input.refinementPrompt,
              "",
              "Return the fully revised artifact as markdown only.",
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

  const revisedMarkdown = extractTextFromResponse(response);

  if (!revisedMarkdown) {
    throw new Error("Model returned empty refined artifact");
  }

  const newArtifact = await createArtifact({
    projectId: input.projectId,
    artifactType: input.artifactType,
    contentMd: revisedMarkdown,
    generationMethod: "refinement",
    refinementPrompt: input.refinementPrompt,
    sourceArtifactId: currentArtifact.id,
  });

  return {
    responseId: response.id,
    previousArtifactId: currentArtifact.id,
    artifact: newArtifact,
  };
}

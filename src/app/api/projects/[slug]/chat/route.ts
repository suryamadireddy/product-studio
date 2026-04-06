import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { openai } from "@/lib/openai/server";
import type { Response } from "openai/resources/responses/responses";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function extractText(response: Response): string {
  const output = response.output ?? [];

  const texts: string[] = [];

  for (const item of output) {
    if (item.type !== "message") continue;

    for (const content of item.content ?? []) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }

  return texts.join("\n").trim();
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const userMessage = body?.message;

    if (!userMessage || typeof userMessage !== "string") {
      return NextResponse.json(
        { error: "message is required" },
        { status: 400 },
      );
    }

    // 1. Get project (only if public)
    const { data: project, error: projectError } = await supabaseAdmin
      .from("projects")
      .select("id, title")
      .eq("slug", slug)
      .eq("is_public", true)
      .eq("status", "published")
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Get current artifacts
    const { data: artifacts, error: artifactsError } = await supabaseAdmin
      .from("artifacts")
      .select("artifact_type, content_md")
      .eq("project_id", project.id)
      .eq("is_current", true);

    if (artifactsError) {
      throw new Error("Failed to fetch artifacts");
    }

    // 3. Build context (STRICTLY from artifacts)
    const contextText = artifacts
      .map(
        (a) => `### ${a.artifact_type.toUpperCase()} (source)\n${a.content_md}`,
      )
      .join("\n\n");

    // 4. Call OpenAI
    const response: Response = await openai.responses.create({
      model: "gpt-5",
      instructions: [
        "You are a product expert explaining a specific project.",
        "You MUST answer ONLY using the provided project artifacts.",

        "When you answer:",
        "- Clearly reference which artifact(s) your answer comes from (e.g., 'Based on the PRD...', 'From the synthesis...')",
        "- Be structured and clear (use short paragraphs or bullets when helpful)",
        "- Be concise but informative",

        "If the answer is not explicitly contained in the artifacts, you MUST respond with exactly:",
        '"I don’t have enough information in the project artifacts to answer that."',

        "Do NOT provide guesses, assumptions, or inferred ideas.",
        "Do NOT elaborate after saying you don't have enough information.",
        "Do NOT infer beyond the artifacts.",
      ].join(" "),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: [
                `Project: ${project.title}`,
                "",
                "Artifacts:",
                contextText,
                "",
                "User question:",
                userMessage,
              ].join("\n"),
            },
          ],
        },
      ],
    });

    const answer = extractText(response);

    // 5. (Optional but important) store chat
    const { data: chat } = await supabaseAdmin
      .from("chats")
      .insert({
        project_id: project.id,
        chat_scope: "public",
      })
      .select()
      .single();

    await supabaseAdmin.from("chat_messages").insert([
      {
        chat_id: chat.id,
        role: "user",
        content: userMessage,
      },
      {
        chat_id: chat.id,
        role: "assistant",
        content: answer,
      },
    ]);

    return NextResponse.json({
      ok: true,
      answer,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

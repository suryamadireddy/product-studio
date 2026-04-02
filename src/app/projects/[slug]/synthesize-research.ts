"use server";

import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function synthesizeResearch(projectId: string) {
  const { data: sources, error: sourcesError } = await supabaseAdmin
    .from("research_sources")
    .select("title, url, extracted_summary")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (sourcesError) {
    throw new Error(sourcesError.message);
  }

  if (!sources || sources.length === 0) {
    throw new Error("No research sources found for this project.");
  }

  const sourceText = sources
    .map(
      (source, index) => `
Source ${index + 1}
Title: ${source.title ?? ""}
URL: ${source.url ?? ""}
Summary: ${source.extracted_summary ?? ""}
`,
    )
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a strong product researcher.

Read the research source summaries and synthesize them into a structured research artifact.

Return ONLY valid JSON. No markdown. No explanation.

Use this exact shape:
{
  "target_users": [],
  "current_workflow": [],
  "pain_points": [],
  "existing_alternatives": [],
  "opportunities": [],
  "unknowns": []
}

Rules:
- Keep outputs concise but meaningful
- Do not invent highly specific facts not supported by the sources
- Prefer clear product insight over generic wording
- Arrays should contain short strings
`,
      },
      {
        role: "user",
        content: sourceText,
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "{}";

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse research synthesis output.");
  }

  const { data: latestSynthesis, error: latestSynthesisError } =
    await supabaseAdmin
      .from("research_syntheses")
      .select("version")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (latestSynthesisError) {
    throw new Error(latestSynthesisError.message);
  }

  const nextVersion = latestSynthesis ? latestSynthesis.version + 1 : 1;

  const { error: insertError } = await supabaseAdmin
    .from("research_syntheses")
    .insert({
      project_id: projectId,
      synthesis_json: parsed,
      version: nextVersion,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { success: true };
}

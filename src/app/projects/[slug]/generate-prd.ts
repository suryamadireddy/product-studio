"use server";

import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function generatePrd(projectId: string) {
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("title, raw_idea, domain, intended_audience")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message || "Project not found.");
  }

  const { data: briefs, error: briefsError } = await supabaseAdmin
    .from("project_briefs")
    .select("structured_brief_json, version")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1);

  if (briefsError) {
    throw new Error(briefsError.message);
  }

  const latestBrief = briefs?.[0];

  if (!latestBrief) {
    throw new Error("No project brief found. Generate a brief first.");
  }

  const { data: syntheses, error: synthesesError } = await supabaseAdmin
    .from("research_syntheses")
    .select("synthesis_json, version")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1);

  if (synthesesError) {
    throw new Error(synthesesError.message);
  }

  const latestSynthesis = syntheses?.[0];

  if (!latestSynthesis) {
    throw new Error("No research synthesis found. Synthesize research first.");
  }

  const promptInput = {
    project: {
      title: project.title,
      raw_idea: project.raw_idea,
      domain: project.domain,
      intended_audience: project.intended_audience,
    },
    latest_brief: latestBrief.structured_brief_json,
    latest_research_synthesis: latestSynthesis.synthesis_json,
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a strong senior product manager.

Generate a concise, grounded PRD from the provided project context, brief, and research synthesis.

Return ONLY valid JSON. No markdown. No explanation.

Use this exact shape:
{
  "title": "",
  "project_summary": "",
  "core_problem": "",
  "target_users": [],
  "pain_points": [],
  "existing_alternatives": [],
  "product_wedge": "",
  "mvp_goal": "",
  "must_have_capabilities": [],
  "key_risks": [],
  "open_questions": []
}

Rules:
- Be specific, concise, and decision-useful
- Ground the PRD in the supplied research synthesis
- Do not invent detailed facts not supported by the context
- Arrays should contain short strings
- product_wedge should reflect a real differentiator, not generic value language
`,
      },
      {
        role: "user",
        content: JSON.stringify(promptInput, null, 2),
      },
    ],
  });

  const content = response.choices[0]?.message?.content || "{}";

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse PRD output.");
  }

  const { data: latestPrd, error: latestPrdError } = await supabaseAdmin
    .from("prds")
    .select("version")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestPrdError) {
    throw new Error(latestPrdError.message);
  }

  const nextVersion = latestPrd ? latestPrd.version + 1 : 1;

  const { error: insertError } = await supabaseAdmin.from("prds").insert({
    project_id: projectId,
    prd_json: parsed,
    version: nextVersion,
    markdown_snapshot: null,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { success: true };
}

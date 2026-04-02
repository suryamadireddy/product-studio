"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { openai } from "@/lib/openai";

export async function generateBrief(projectId: string, rawIdea: string) {
  // 1. Call OpenAI
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a strong senior product manager.

Turn the user's raw product idea into a concise, structured product brief.

Return ONLY valid JSON. No markdown. No explanation.

Use this exact shape:
{
  "problem": "",
  "target_users": [],
  "current_solutions": [],
  "opportunity": "",
  "key_features": [],
  "risks": []
}

Rules:
- Be specific, not generic
- Infer likely user pain points carefully from the idea
- Keep each field concise but useful
- key_features should be concrete product capabilities, not vague goals
- risks should be real execution or market risks
`,
      },
      {
        role: "user",
        content: rawIdea,
      },
    ],
    temperature: 0.3,
  });

  const content = response.choices[0].message.content || "{}";

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse AI response");
  }

  // 2. Store in Supabase
  const { data: latestBrief, error: latestBriefError } = await supabaseAdmin
    .from("project_briefs")
    .select("version")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestBriefError) {
    throw new Error(latestBriefError.message);
  }
  const nextVersion = latestBrief ? latestBrief.version + 1 : 1;

  const { error } = await supabaseAdmin.from("project_briefs").insert({
    project_id: projectId,
    structured_brief_json: parsed,
    version: nextVersion,
  });

  if (error) {
    throw new Error(error.message);
  }

  return parsed;
}

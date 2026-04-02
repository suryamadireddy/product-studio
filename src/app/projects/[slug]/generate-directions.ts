"use server";

import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function generateDirections(projectId: string) {
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("title, raw_idea, domain, intended_audience")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message || "Project not found.");
  }

  const { data: prds, error: prdsError } = await supabaseAdmin
    .from("prds")
    .select("prd_json, version")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1);

  if (prdsError) {
    throw new Error(prdsError.message);
  }

  const latestPrd = prds?.[0];

  if (!latestPrd) {
    throw new Error("No PRD found. Generate a PRD first.");
  }

  const promptInput = {
    project: {
      title: project.title,
      raw_idea: project.raw_idea,
      domain: project.domain,
      intended_audience: project.intended_audience,
    },
    latest_prd: latestPrd.prd_json,
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content: `
You are a strong product strategist.

Generate 2 to 4 distinct prototype directions from the provided PRD.

Return ONLY valid JSON. No markdown. No explanation.

Use this exact shape:
{
  "directions": [
    {
      "name": "",
      "concept_summary": "",
      "core_user_flow": [],
      "key_screens": [],
      "why_this_direction_might_win": "",
      "complexity": "low"
    }
  ],
  "recommended_direction": {
    "name": "",
    "reason": ""
  }
}

Rules:
- Directions should be meaningfully different from each other
- Each direction should represent a different product approach, not minor UI variations
- Keep text concise, specific, and decision-useful
- complexity must be one of: low, medium, high
- key_screens should be concrete screens or interactions
- recommended_direction.name must match one of the generated directions exactly
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
    throw new Error("Failed to parse prototype directions output.");
  }

  const { data: latestDirections, error: latestDirectionsError } =
    await supabaseAdmin
      .from("prototype_directions")
      .select("version")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (latestDirectionsError) {
    throw new Error(latestDirectionsError.message);
  }

  const nextVersion = latestDirections ? latestDirections.version + 1 : 1;

  const { error: insertError } = await supabaseAdmin
    .from("prototype_directions")
    .insert({
      project_id: projectId,
      directions_json: parsed,
      version: nextVersion,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { success: true };
}

"use server";

import { openai } from "@/lib/openai";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function generateBuildPack(projectId: string) {
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

  const { data: directionArtifacts, error: directionsError } =
    await supabaseAdmin
      .from("prototype_directions")
      .select("directions_json, version")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1);

  if (directionsError) {
    throw new Error(directionsError.message);
  }

  const latestDirectionsArtifact = directionArtifacts?.[0];

  if (!latestDirectionsArtifact) {
    throw new Error(
      "No prototype directions found. Generate directions first.",
    );
  }

  const directionsJson = latestDirectionsArtifact.directions_json as {
    directions?: Array<{
      name: string;
      concept_summary: string;
      core_user_flow?: string[];
      key_screens?: string[];
      why_this_direction_might_win?: string;
      complexity?: string;
    }>;
    recommended_direction?: {
      name: string;
      reason: string;
    };
  };

  const recommendedName = directionsJson?.recommended_direction?.name;

  if (!recommendedName) {
    throw new Error(
      "No recommended direction found in the latest directions artifact.",
    );
  }

  const chosenDirection = Array.isArray(directionsJson?.directions)
    ? directionsJson.directions.find((d) => d.name === recommendedName)
    : undefined;

  if (!chosenDirection) {
    throw new Error(
      "Recommended direction did not match any generated direction.",
    );
  }

  const promptInput = {
    project: {
      title: project.title,
      raw_idea: project.raw_idea,
      domain: project.domain,
      intended_audience: project.intended_audience,
    },
    latest_prd: latestPrd.prd_json,
    chosen_direction: chosenDirection,
    recommendation_reason: directionsJson?.recommended_direction?.reason ?? "",
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
You are a strong product strategist and prototype planner.

Generate a concise starter build pack for the chosen product direction.

Return ONLY valid JSON. No markdown. No explanation.

Use this exact shape:
{
  "direction_name": "",
  "concept_summary": "",
  "page_map": [
    {
      "page": "",
      "purpose": ""
    }
  ],
  "core_components": [],
  "user_flow": [],
  "v0_prompt": "",
  "notes": ""
}

Rules:
- Keep the page map practical and MVP-sized
- core_components should be concrete UI building blocks
- user_flow should be short and sequential
- v0_prompt should be directly usable as a prompt to generate a UI prototype
- notes should include implementation guidance or tradeoff reminders
- direction_name must match the chosen direction name
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
    throw new Error("Failed to parse build pack output.");
  }

  const { data: latestBuildPack, error: latestBuildPackError } =
    await supabaseAdmin
      .from("selected_prototypes")
      .select("version")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (latestBuildPackError) {
    throw new Error(latestBuildPackError.message);
  }

  const nextVersion = latestBuildPack ? latestBuildPack.version + 1 : 1;

  const { error: insertError } = await supabaseAdmin
    .from("selected_prototypes")
    .insert({
      project_id: projectId,
      direction_name: chosenDirection.name,
      build_pack_json: parsed,
      version: nextVersion,
    });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return { success: true };
}

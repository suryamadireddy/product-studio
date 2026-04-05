import { supabaseAdmin } from "@/lib/supabase/server";

export async function getPublicProjectPage(slug: string) {
  const { data: project, error: projectError } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (projectError) {
    console.error(
      "Error fetching project:",
      JSON.stringify(projectError, null, 2)
    );
    return null;
  }

  if (!project || !project.is_public) {
    return null;
  }

  const projectId = project.id;

  const { data: brief, error: briefError } = await supabaseAdmin
    .from("project_brief")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: researchSynthesis, error: synthesisError } =
    await supabaseAdmin
      .from("research_synthesis")
      .select("*")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

  const { data: prd, error: prdError } = await supabaseAdmin
    .from("prds")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: prototypeDirections, error: directionsError } =
    await supabaseAdmin
      .from("prototype_directions")
      .select("*")
      .eq("project_id", projectId)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (briefError) {
    console.error(
      "Error fetching project brief:",
      JSON.stringify(briefError, null, 2)
    );
  }

  if (synthesisError) {
    console.error(
      "Error fetching research synthesis:",
      JSON.stringify(synthesisError, null, 2)
    );
  }

  if (prdError) {
    console.error("Error fetching PRD:", JSON.stringify(prdError, null, 2));
  }

  if (directionsError) {
    console.error(
      "Error fetching prototype directions:",
      JSON.stringify(directionsError, null, 2)
    );
  }

  return {
    project,
    brief: brief ?? null,
    researchSynthesis: researchSynthesis ?? null,
    prd: prd ?? null,
    prototypeDirections: prototypeDirections ?? null,
  };
}
import "server-only";

import { supabaseAdmin } from "@/lib/supabase/server";
import { getCurrentArtifactsForProject } from "@/lib/server/artifacts";

export async function getProjectBySlug(slug: string) {
    const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data;
}

export async function getPrivateProjectPageData(slug: string) {
  const project = await getProjectBySlug(slug);
  const artifacts = await getCurrentArtifactsForProject(project.id);

  return {
    project,
    artifacts,
  };
}
import "server-only";

import { supabaseAdmin } from "@/lib/supabase/server";
import type { ArtifactType } from "@/lib/types";

type CreateArtifactInput = {
  projectId: string;
  artifactType: ArtifactType;
  contentMd: string;
  generationMethod?: "initial" | "refinement";
  refinementPrompt?: string | null;
  sourceArtifactId?: string | null;
};

export async function getNextArtifactVersion(
  projectId: string,
  artifactType: ArtifactType
): Promise<number> {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("artifacts")
    .select("version")
    .eq("project_id", projectId)
    .eq("artifact_type", artifactType)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get next artifact version: ${error.message}`);
  }

  return data ? data.version + 1 : 1;
}

export async function createArtifact(input: CreateArtifactInput) {
  const supabase = supabaseAdmin;

  const version = await getNextArtifactVersion(input.projectId, input.artifactType);

  const { data, error } = await supabase
    .from("artifacts")
    .insert({
      project_id: input.projectId,
      artifact_type: input.artifactType,
      version,
      content_md: input.contentMd,
      generation_method: input.generationMethod ?? "initial",
      refinement_prompt: input.refinementPrompt ?? null,
      source_artifact_id: input.sourceArtifactId ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create artifact: ${error.message}`);
  }

  return data;
}

export async function getCurrentArtifactsForProject(projectId: string) {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("project_id", projectId)
    .eq("is_current", true)
    .order("artifact_type", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch current artifacts: ${error.message}`);
  }

  return data;
}

export async function getArtifactsForProject(projectId: string) {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("project_id", projectId)
    .order("artifact_type", { ascending: true })
    .order("version", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch artifacts: ${error.message}`);
  }

  return data;
}

export async function getCurrentArtifactByType(
  projectId: string,
  artifactType: ArtifactType
) {
  const supabase = supabaseAdmin;

  const { data, error } = await supabase
    .from("artifacts")
    .select("*")
    .eq("project_id", projectId)
    .eq("artifact_type", artifactType)
    .eq("is_current", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch current artifact by type: ${error.message}`);
  }

  return data;
}
import { NextResponse } from "next/server";
import { createArtifact } from "@/lib/server/artifacts";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, title")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const created = await Promise.all([
      createArtifact({
        projectId,
        artifactType: "brief",
        contentMd: `# Brief\n\nInitial brief for ${project.title}.`,
      }),
      createArtifact({
        projectId,
        artifactType: "synthesis",
        contentMd: `# Synthesis\n\nInitial synthesis for ${project.title}.`,
      }),
      createArtifact({
        projectId,
        artifactType: "prd",
        contentMd: `# PRD\n\nInitial PRD for ${project.title}.`,
      }),
      createArtifact({
        projectId,
        artifactType: "directions",
        contentMd: `# Directions\n\nInitial prototype directions for ${project.title}.`,
      }),
    ]);

    return NextResponse.json({ ok: true, created });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
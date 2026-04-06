import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { refineArtifactForProject } from "@/lib/server/refine-artifact";
import type { ArtifactType } from "@/lib/types";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

function isArtifactType(value: string): value is ArtifactType {
  return ["brief", "synthesis", "prd", "directions"].includes(value);
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const body = await request.json();

    const artifactType = body?.artifactType;
    const refinementPrompt = body?.refinementPrompt;

    if (!artifactType || !isArtifactType(artifactType)) {
      return NextResponse.json(
        { error: "Valid artifactType is required" },
        { status: 400 },
      );
    }

    if (!refinementPrompt || typeof refinementPrompt !== "string") {
      return NextResponse.json(
        { error: "refinementPrompt is required" },
        { status: 400 },
      );
    }

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select("id, title")
      .eq("slug", slug)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const result = await refineArtifactForProject({
      projectId: project.id,
      projectTitle: project.title,
      artifactType,
      refinementPrompt: refinementPrompt.trim(),
    });

    return NextResponse.json({
      ok: true,
      responseId: result.responseId,
      artifactId: result.artifact.id,
      version: result.artifact.version,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateSingleArtifactForProject } from "@/lib/server/generate-single-artifact";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const supabase = supabaseAdmin;

    const { data: project, error } = await supabase
      .from("projects")
      .select("id, slug, title, raw_idea, domain, intended_audience")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const result = await generateSingleArtifactForProject({
      project,
      artifactType: "brief",
    });

    return NextResponse.json({
      ok: true,
      responseId: result.responseId,
      artifactId: result.artifact.id,
      artifactType: result.artifact.artifact_type,
      version: result.artifact.version,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
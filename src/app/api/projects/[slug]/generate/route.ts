import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateInitialArtifactsForProject } from "@/lib/server/generate-artifacts";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select("id, title, raw_idea")
      .eq("slug", slug)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const result = await generateInitialArtifactsForProject({
      projectId: project.id,
      projectTitle: project.title,
      ideaInput: project.raw_idea,
    });

    return NextResponse.json({
      ok: true,
      responseId: result.responseId,
      artifactIds: {
        brief: result.artifacts.brief.id,
        synthesis: result.artifacts.synthesis.id,
        prd: result.artifacts.prd.id,
        directions: result.artifacts.directions.id,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

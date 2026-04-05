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
      console.log("generate route: start");
  
      const { slug } = await context.params;
      console.log("generate route: slug =", slug);
  
      const supabase = supabaseAdmin;
      console.log("generate route: supabase client created");
  
      const { data: project, error } = await supabase
        .from("projects")
        .select("id, slug, title, raw_idea")
        .eq("slug", slug)
        .maybeSingle();
  
      console.log("generate route: project query complete", { project, error });
  
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
  
      if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
  
      console.log("generate route: calling artifact generation");
  
      const result = await generateInitialArtifactsForProject({
        projectId: project.id,
        projectTitle: project.title,
        ideaInput: project.raw_idea,
      });
  
      console.log("generate route: artifact generation complete", {
        responseId: result.responseId,
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
      console.error("generate route: failed", error);
  
      const message =
        error instanceof Error ? error.message : "Unknown server error";
  
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
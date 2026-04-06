import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;

    const { data, error } = await supabaseAdmin
      .from("projects")
      .update({
        is_public: true,
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("slug", slug)
      .select("id, slug, is_public, status, published_at")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Failed to publish project" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      project: data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

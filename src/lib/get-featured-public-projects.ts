import { supabaseAdmin } from "@/lib/supabase/server";

export type PublicProjectCard = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  rawIdea: string | null;
  featuredOrder: number | null;
  coverImage: string;
};

const fallbackCovers = [
  "/project-covers/cover-1.png",
  "/project-covers/cover-2.png",
  "/project-covers/cover-3.png",
  "/project-covers/cover-4.png",
];

function mapProject(
  project: {
    id: string;
    slug: string;
    title: string;
    summary: string | null;
    raw_idea: string | null;
    featured_order: number | null;
  },
  index: number,
): PublicProjectCard {
  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    summary: project.summary ?? null,
    rawIdea: project.raw_idea ?? null,
    featuredOrder: project.featured_order ?? null,
    coverImage: fallbackCovers[index % fallbackCovers.length],
  };
}

export async function getFeaturedPublicProjects(): Promise<PublicProjectCard[]> {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, slug, title, summary, raw_idea, featured_order, created_at")
    .eq("is_public", true)
    .eq("status", "published")
    .not("featured_order", "is", null)
    .order("featured_order", { ascending: true })
    .limit(4);

  if (error) {
    console.error("Error fetching featured public projects:", error);
    return [];
  }

  return (data ?? []).map(mapProject);
}

export async function getAllPublicProjects(): Promise<PublicProjectCard[]> {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, slug, title, summary, raw_idea, featured_order, created_at")
    .eq("is_public", true)
    .eq("status", "published")
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all public projects:", error);
    return [];
  }

  return (data ?? []).map(mapProject);
}
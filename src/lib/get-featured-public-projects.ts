import { supabaseAdmin } from "@/lib/supabase/server";

export type PublicProjectCard = {
  id: string;
  slug: string;
  title: string;
  featuredOrder: number | null;
};

export async function getFeaturedPublicProjects(): Promise<PublicProjectCard[]> {
  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, slug, title, featured_order, created_at")
    .eq("is_public", true)
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching featured public projects:", error);
    return [];
  }

  return (data ?? []).map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.title,
    featuredOrder: project.featured_order ?? null,
  }));
}
"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

const createProjectSchema = z.object({
  title: z.string().min(1),
  rawIdea: z.string().min(1),
  domain: z.string().optional(),
  intendedAudience: z.string().optional(),
});

export async function createProject(formData: FormData) {
  const parsed = createProjectSchema.safeParse({
    title: formData.get("title"),
    rawIdea: formData.get("rawIdea"),
    domain: formData.get("domain"),
    intendedAudience: formData.get("intendedAudience"),
  });

  if (!parsed.success) {
    throw new Error("Invalid form submission");
  }

  const { title, rawIdea, domain, intendedAudience } = parsed.data;

  const baseSlug = slugify(title);
  let slug = baseSlug;

  const { data: existing } = await supabaseAdmin
    .from("projects")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    slug = `${baseSlug}-${Date.now()}`;
  }

  const { error } = await supabaseAdmin.from("projects").insert({
    slug,
    title,
    raw_idea: rawIdea,
    domain: domain || null,
    intended_audience: intendedAudience || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/projects/${slug}`);
}

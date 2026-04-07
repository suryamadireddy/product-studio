import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCurrentArtifactsForProject } from "@/lib/server/artifacts";
import type { ArtifactType } from "@/lib/types";
import { Header } from "@/components/public/header";
import { ChatBox } from "@/components/public/chat-box";
import { ArtifactExplorer } from "@/components/public/artifact-explorer";

const ARTIFACT_ORDER: ArtifactType[] = [
  "brief",
  "synthesis",
  "prd",
  "directions",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("title, summary, raw_idea")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "published")
    .single();

  if (error || !project) {
    return {
      title: "Project Not Found",
    };
  }

  const description =
    project.summary ??
    project.raw_idea?.slice(0, 160) ??
    "Research-backed product case study.";

  return {
    title: `${project.title} | KSM Studio`,
    description,
  };
}

export default async function WorkProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .eq("status", "published")
    .single();

  if (error || !project) {
    notFound();
  }

  const currentArtifacts = await getCurrentArtifactsForProject(project.id);

  const artifactMap = new Map(
    currentArtifacts.map((artifact) => [
      artifact.artifact_type as ArtifactType,
      artifact,
    ]),
  );

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-10">
          <p className="text-sm text-gray-500">Project</p>

          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            {project.title}
          </h1>

          {project.summary ? (
            <p className="mt-4 max-w-3xl text-base leading-7 text-gray-700">
              {project.summary}
            </p>
          ) : null}
        </header>

        <section className="mb-10 rounded-lg border p-6">
          <h2 className="text-lg font-medium">Concept</h2>
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-800">
            {project.raw_idea}
          </p>
        </section>

        <ArtifactExplorer
          artifacts={ARTIFACT_ORDER.map((artifactType) =>
            artifactMap.get(artifactType),
          )
            .filter(Boolean)
            .map((artifact) => ({
              artifact_type: artifact!.artifact_type as ArtifactType,
              content_md: artifact!.content_md,
              version: artifact!.version,
            }))}
        />

        <ChatBox slug={slug} />
      </div>
    </main>
  );
}
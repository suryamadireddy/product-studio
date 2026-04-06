import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCurrentArtifactsForProject } from "@/lib/server/artifacts";
import type { ArtifactType } from "@/lib/types";
import { ChatBox } from "@/components/public/chat-box";

const ARTIFACT_ORDER: ArtifactType[] = [
  "brief",
  "synthesis",
  "prd",
  "directions",
];

function prettyArtifactTitle(type: ArtifactType) {
  switch (type) {
    case "brief":
      return "Brief";
    case "synthesis":
      return "Synthesis";
    case "prd":
      return "PRD";
    case "directions":
      return "Prototype Directions";
    default:
      return type;
  }
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
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <p className="text-sm text-gray-500">Selected Work</p>
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

      <section className="space-y-6">
        {ARTIFACT_ORDER.map((artifactType) => {
          const artifact = artifactMap.get(artifactType);

          if (!artifact) return null;

          return (
            <article key={artifactType} className="rounded-lg border p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-medium">
                  {prettyArtifactTitle(artifactType)}
                </h2>
                <span className="text-sm text-gray-500">
                  Version {artifact.version}
                </span>
              </div>

              <div className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
                {artifact.content_md}
              </div>
            </article>
          );
        })}
      </section>

      <ChatBox slug={slug} />
    </main>
  );
}

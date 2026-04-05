import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCurrentArtifactsForProject } from "@/lib/server/artifacts";
import { CurrentArtifactsSection } from "@/components/private-studio/current-artifacts-section";
import { GenerateCoreArtifactsButton } from "@/components/projects/generate-core-artifacts-button";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !project) {
    notFound();
  }

  const currentArtifacts = await getCurrentArtifactsForProject(project.id);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <header className="mb-8">
        <p className="text-sm text-gray-500">Private Studio</p>
        <h1 className="mt-2 text-3xl font-semibold">{project.title}</h1>

        <div className="mt-4">
          <GenerateCoreArtifactsButton slug={project.slug} />
        </div>

        <p className="mt-3 text-sm text-gray-500">
          Status: {project.status}
        </p>
      </header>

      <section className="rounded-lg border p-6">
        <h2 className="text-lg font-medium">Raw Idea</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-7">
          {project.raw_idea}
        </p>

        {project.domain ? (
          <div className="mt-6">
            <h2 className="text-lg font-medium">Domain</h2>
            <p className="mt-2 text-sm">{project.domain}</p>
          </div>
        ) : null}

        {project.intended_audience ? (
          <div className="mt-6">
            <h2 className="text-lg font-medium">Intended Audience</h2>
            <p className="mt-2 text-sm">{project.intended_audience}</p>
          </div>
        ) : null}
      </section>

      <div className="mt-10">
        <CurrentArtifactsSection artifacts={currentArtifacts} />
      </div>
    </main>
  );
}
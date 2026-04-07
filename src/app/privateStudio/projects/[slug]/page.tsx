import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCurrentArtifactsForProject } from "@/lib/server/artifacts";
import { CurrentArtifactsSection } from "@/components/private-studio/current-artifacts-section";
import { GenerateCoreArtifactsButton } from "@/components/projects/generate-core-artifacts-button";
import { PublishProjectButton } from "@/components/projects/publish-project-button";
import { RefineArtifactForm } from "@/components/refine-artifact-form";
import type { ArtifactType } from "@/lib/types";


const ARTIFACT_TYPES: ArtifactType[] = [
    "brief",
    "synthesis",
    "prd",
    "directions",
];

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

                {project.raw_idea ? (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700">
                        {project.raw_idea}
                    </p>
                ) : null}

                <div className="mt-4 flex items-center gap-3">
                    <GenerateCoreArtifactsButton slug={project.slug} />
                    <PublishProjectButton slug={project.slug} />
                </div>
            </header>

            <CurrentArtifactsSection slug={project.slug} artifacts={currentArtifacts} />
        </main>
    );
}
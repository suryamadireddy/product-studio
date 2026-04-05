import "server-only";

import { generateSingleArtifactForProject } from "@/lib/server/generate-single-artifact";

type ProjectInput = {
    id: string;
    title: string;
    raw_idea: string;
    domain?: string | null;
    intended_audience?: string | null;
};

export async function generateCoreArtifactsForProject(project: ProjectInput) {
    const brief = await generateSingleArtifactForProject({
        project,
        artifactType: "brief",
    });

    const synthesis = await generateSingleArtifactForProject({
        project,
        artifactType: "synthesis",
    });

    const prd = await generateSingleArtifactForProject({
        project,
        artifactType: "prd",
    });

    return {
        brief,
        synthesis,
        prd,
    };
}
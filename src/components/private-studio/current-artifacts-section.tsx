import { RefineArtifactForm } from "@/components/refine-artifact-form";
import type { Artifact, ArtifactType } from "@/lib/types";

type Props = {
  slug: string;
  artifacts: Artifact[];
};

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

export function CurrentArtifactsSection({ slug, artifacts }: Props) {
  const artifactMap = new Map(
    artifacts.map((artifact) => [
      artifact.artifact_type as ArtifactType,
      artifact,
    ]),
  );

  return (
    <section className="space-y-6">
      {ARTIFACT_ORDER.map((artifactType) => {
        const artifact = artifactMap.get(artifactType);

        return (
          <article key={artifactType} className="rounded-lg border p-6">
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium">
                {prettyArtifactTitle(artifactType)}
              </h2>

              {artifact ? (
                <span className="text-sm text-gray-500">
                  Version {artifact.version}
                </span>
              ) : (
                <span className="text-sm text-gray-400">Not generated yet</span>
              )}
            </div>

            {artifact ? (
              <>
                <div className="whitespace-pre-wrap text-sm leading-7 text-gray-800">
                  {artifact.content_md}
                </div>

                <RefineArtifactForm slug={slug} artifactType={artifactType} />
              </>
            ) : (
              <p className="text-sm text-gray-400">
                No {artifactType} artifact yet.
              </p>
            )}
          </article>
        );
      })}
    </section>
  );
}

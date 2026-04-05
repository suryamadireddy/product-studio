type ArtifactRow = {
    id: string;
    artifact_type: "brief" | "synthesis" | "prd" | "directions";
    version: number;
    content_md: string;
    is_current: boolean;
    created_at: string;
  };
  
  const ARTIFACT_ORDER = ["brief", "synthesis", "prd", "directions"] as const;
  
  function prettyArtifactTitle(type: ArtifactRow["artifact_type"]) {
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
  
  export function CurrentArtifactsSection({
    artifacts,
  }: {
    artifacts: ArtifactRow[];
  }) {
    const artifactMap = new Map(
      artifacts.map((artifact) => [artifact.artifact_type, artifact])
    );
  
    return (
      <section className="mt-10 space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Current Artifacts</h2>
          <p className="mt-1 text-sm text-gray-500">
            This section reads from the new unified artifacts table.
          </p>
        </div>
  
        {ARTIFACT_ORDER.map((artifactType) => {
          const artifact = artifactMap.get(artifactType);
  
          return (
            <article key={artifactType} className="rounded-lg border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  {prettyArtifactTitle(artifactType)}
                </h3>
  
                {artifact ? (
                  <span className="text-sm text-gray-500">
                    Version {artifact.version}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">Not generated yet</span>
                )}
              </div>
  
              {artifact ? (
                <div className="whitespace-pre-wrap text-sm leading-6 text-gray-700">
                  {artifact.content_md}
                </div>
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
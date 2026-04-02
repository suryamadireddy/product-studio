import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/server";
import { generateBrief } from "./generate-brief";
import { generateResearch } from "./generate-research";
import { synthesizeResearch } from "./synthesize-research";
import { generatePrd } from "./generate-prd";
import { generateDirections } from "./generate-directions";
import { generateBuildPack } from "./generate-build-pack";

type StructuredBrief = {
  problem: string;
  target_users: string[];
  current_solutions: string[];
  opportunity: string;
  key_features: string[];
  risks: string[];
};

type ResearchSynthesis = {
  target_users: string[];
  current_workflow: string[];
  pain_points: string[];
  existing_alternatives: string[];
  opportunities: string[];
  unknowns: string[];
};

type PrdArtifact = {
  title: string;
  project_summary: string;
  core_problem: string;
  target_users: string[];
  pain_points: string[];
  existing_alternatives: string[];
  product_wedge: string;
  mvp_goal: string;
  must_have_capabilities: string[];
  key_risks: string[];
  open_questions: string[];
};

type PrototypeDirectionsArtifact = {
  directions: Array<{
    name: string;
    concept_summary: string;
    core_user_flow: string[];
    key_screens: string[];
    why_this_direction_might_win: string;
    complexity: "low" | "medium" | "high" | string;
  }>;
  recommended_direction: {
    name: string;
    reason: string;
  };
};

type BuildPackArtifact = {
  direction_name: string;
  concept_summary: string;
  page_map: Array<{
    page: string;
    purpose: string;
  }>;
  core_components: string[];
  user_flow: string[];
  v0_prompt: string;
  notes: string;
};

function toArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return [value];
  }

  return [];
}

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

  const { data: briefs, error: briefsError } = await supabaseAdmin
    .from("project_briefs")
    .select("*")
    .eq("project_id", project.id)
    .order("version", { ascending: false });

  if (briefsError) {
    throw new Error(briefsError.message);
  }

  const latestBrief = briefs?.[0];
  const structuredBrief = latestBrief?.structured_brief_json as
    | StructuredBrief
    | undefined;

  const { data: researchSources, error: researchSourcesError } =
    await supabaseAdmin
      .from("research_sources")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

  if (researchSourcesError) {
    throw new Error(researchSourcesError.message);
  }

  const { data: researchSyntheses, error: researchSynthesesError } =
    await supabaseAdmin
      .from("research_syntheses")
      .select("*")
      .eq("project_id", project.id)
      .order("version", { ascending: false });

  if (researchSynthesesError) {
    throw new Error(researchSynthesesError.message);
  }

  const latestResearchSynthesis = researchSyntheses?.[0];
  const structuredResearchSynthesis =
    latestResearchSynthesis?.synthesis_json as ResearchSynthesis | undefined;

  const synthesisTargetUsers = toArray(
    structuredResearchSynthesis?.target_users,
  );
  const synthesisCurrentWorkflow = toArray(
    structuredResearchSynthesis?.current_workflow,
  );
  const synthesisPainPoints = toArray(structuredResearchSynthesis?.pain_points);
  const synthesisExistingAlternatives = toArray(
    structuredResearchSynthesis?.existing_alternatives,
  );
  const synthesisOpportunities = toArray(
    structuredResearchSynthesis?.opportunities,
  );
  const synthesisUnknowns = toArray(structuredResearchSynthesis?.unknowns);

  const { data: prds, error: prdsError } = await supabaseAdmin
    .from("prds")
    .select("*")
    .eq("project_id", project.id)
    .order("version", { ascending: false });

  if (prdsError) {
    throw new Error(prdsError.message);
  }

  const latestPrd = prds?.[0];
  const structuredPrd = latestPrd?.prd_json as PrdArtifact | undefined;
  const prdTargetUsers = toArray(structuredPrd?.target_users);
  const prdPainPoints = toArray(structuredPrd?.pain_points);
  const prdExistingAlternatives = toArray(structuredPrd?.existing_alternatives);
  const prdMustHaveCapabilities = toArray(
    structuredPrd?.must_have_capabilities,
  );
  const prdKeyRisks = toArray(structuredPrd?.key_risks);
  const prdOpenQuestions = toArray(structuredPrd?.open_questions);

  const { data: directionArtifacts, error: directionArtifactsError } =
    await supabaseAdmin
      .from("prototype_directions")
      .select("*")
      .eq("project_id", project.id)
      .order("version", { ascending: false });

  if (directionArtifactsError) {
    throw new Error(directionArtifactsError.message);
  }

  const latestDirectionsArtifact = directionArtifacts?.[0];
  const structuredDirections = latestDirectionsArtifact?.directions_json as
    | PrototypeDirectionsArtifact
    | undefined;

  const directionsList = Array.isArray(structuredDirections?.directions)
    ? structuredDirections.directions
    : [];

  const recommendedDirection = structuredDirections?.recommended_direction;

  const { data: buildPacks, error: buildPacksError } = await supabaseAdmin
    .from("selected_prototypes")
    .select("*")
    .eq("project_id", project.id)
    .order("version", { ascending: false });

  if (buildPacksError) {
    throw new Error(buildPacksError.message);
  }

  const latestBuildPack = buildPacks?.[0];
  const structuredBuildPack = latestBuildPack?.build_pack_json as
    | BuildPackArtifact
    | undefined;

  const buildPackPageMap = Array.isArray(structuredBuildPack?.page_map)
    ? structuredBuildPack.page_map
    : [];

  const buildPackCoreComponents = toArray(structuredBuildPack?.core_components);
  const buildPackUserFlow = toArray(structuredBuildPack?.user_flow);

  const targetUsers = toArray(structuredBrief?.target_users);
  const currentSolutions = toArray(structuredBrief?.current_solutions);
  const keyFeatures = toArray(structuredBrief?.key_features);
  const risks = toArray(structuredBrief?.risks);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-semibold">{project.title}</h1>
      <p className="mt-2 text-sm text-gray-500">Status: {project.status}</p>
      <form
        action={async () => {
          "use server";
          await generateBrief(project.id, project.raw_idea);
        }}
      >
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white">
          Generate Brief
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await generateResearch(project.id, project.raw_idea);
        }}
      >
        <button className="rounded-md bg-green-600 px-4 py-2 text-white">
          Run Research
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await synthesizeResearch(project.id);
        }}
      >
        <button className="rounded-md bg-purple-600 px-4 py-2 text-white">
          Synthesize Research
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await generatePrd(project.id);
        }}
      >
        <button className="rounded-md bg-orange-600 px-4 py-2 text-white">
          Generate PRD
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await generateDirections(project.id);
        }}
      >
        <button className="rounded-md bg-pink-600 px-4 py-2 text-white">
          Generate Directions
        </button>
      </form>
      <form
        action={async () => {
          "use server";
          await generateBuildPack(project.id);
        }}
      >
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-white">
          Generate Build Pack
        </button>
      </form>
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-lg font-medium">Raw Idea</h2>
          <p className="mt-2 whitespace-pre-wrap">{project.raw_idea}</p>
        </div>

        {project.domain && (
          <div>
            <h2 className="text-lg font-medium">Domain</h2>
            <p className="mt-2">{project.domain}</p>
          </div>
        )}

        {project.intended_audience && (
          <div>
            <h2 className="text-lg font-medium">Intended Audience</h2>
            <p className="mt-2">{project.intended_audience}</p>
          </div>
        )}
      </div>
      {structuredBrief && (
        <div className="mt-10 rounded-lg border p-6 space-y-8">
          <h2 className="text-2xl font-semibold">
            Generated Brief{" "}
            {latestBrief?.version ? `(v${latestBrief.version})` : ""}
          </h2>
          <section>
            <h3 className="text-lg font-medium">Problem</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredBrief.problem}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">Target Users</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {targetUsers.map((user, index) => (
                <li key={index}>{user}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Current Solutions</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {currentSolutions.map((solution, index) => (
                <li key={index}>{solution}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Opportunity</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredBrief.opportunity}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">Key Features</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {keyFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Risks</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
      {briefs && briefs.length > 1 && (
        <div className="mt-10 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Brief History</h2>
          <div className="mt-4 space-y-3">
            {briefs.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="font-medium">Version {item.version}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                {latestBrief?.id === item.id && (
                  <span className="text-sm text-blue-600">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {researchSources && researchSources.length > 0 && (
        <div className="mt-10 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">Research Sources</h2>

          <div className="mt-6 space-y-4">
            {researchSources.map((source) => (
              <div key={source.id} className="rounded-md border p-4">
                <h3 className="font-medium">
                  {source.title || "Untitled source"}
                </h3>

                {source.url && (
                  <p className="mt-1 text-sm text-blue-600 break-all">
                    {source.url}
                  </p>
                )}

                {source.extracted_summary && (
                  <p className="mt-3 text-sm leading-6 text-gray-700">
                    {source.extracted_summary}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {structuredResearchSynthesis && (
        <div className="mt-10 rounded-lg border p-6 space-y-8">
          <h2 className="text-2xl font-semibold">
            Research Synthesis
            {latestResearchSynthesis?.version
              ? ` (v${latestResearchSynthesis.version})`
              : ""}
          </h2>

          <section>
            <h3 className="text-lg font-medium">Target Users</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {synthesisTargetUsers.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Current Workflow</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {synthesisCurrentWorkflow.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Pain Points</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {synthesisPainPoints.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Existing Alternatives</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {synthesisExistingAlternatives.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Opportunities</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {synthesisOpportunities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Unknowns</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {synthesisUnknowns.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
      {structuredPrd && (
        <div className="mt-10 rounded-lg border p-6 space-y-8">
          <h2 className="text-2xl font-semibold">
            PRD {latestPrd?.version ? `(v${latestPrd.version})` : ""}
          </h2>

          <section>
            <h3 className="text-lg font-medium">Title</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredPrd.title}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">Project Summary</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredPrd.project_summary}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">Core Problem</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredPrd.core_problem}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">Target Users</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {prdTargetUsers.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Pain Points</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {prdPainPoints.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Existing Alternatives</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {prdExistingAlternatives.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Product Wedge</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredPrd.product_wedge}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">MVP Goal</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredPrd.mvp_goal}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">Must-Have Capabilities</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {prdMustHaveCapabilities.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Key Risks</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {prdKeyRisks.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">Open Questions</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {prdOpenQuestions.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
      {prds && prds.length > 1 && (
        <div className="mt-10 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">PRD History</h2>

          <div className="mt-4 space-y-3">
            {prds.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="font-medium">Version {item.version}</p>
                  <p className="text-sm text-gray-500">{item.created_at}</p>
                </div>

                {latestPrd?.id === item.id && (
                  <span className="text-sm text-orange-600">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {structuredDirections && (
        <div className="mt-10 rounded-lg border p-6 space-y-8">
          <h2 className="text-2xl font-semibold">
            Prototype Directions{" "}
            {latestDirectionsArtifact?.version
              ? `(v${latestDirectionsArtifact.version})`
              : ""}
          </h2>

          {recommendedDirection && (
            <div className="rounded-md border bg-gray-50 p-4">
              <h3 className="text-lg font-medium">Recommended Direction</h3>
              <p className="mt-2 text-sm">
                <span className="font-medium">{recommendedDirection.name}</span>
              </p>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                {recommendedDirection.reason}
              </p>
            </div>
          )}

          <div className="space-y-6">
            {directionsList.map((direction, index) => (
              <div key={index} className="rounded-md border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{direction.name}</h3>
                  <span className="text-sm text-gray-500 capitalize">
                    {direction.complexity}
                  </span>
                </div>

                <section>
                  <h4 className="text-sm font-medium">Concept Summary</h4>
                  <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                    {direction.concept_summary}
                  </p>
                </section>

                <section>
                  <h4 className="text-sm font-medium">Core User Flow</h4>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    {toArray(direction.core_user_flow).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-sm font-medium">Key Screens</h4>
                  <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
                    {toArray(direction.key_screens).map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h4 className="text-sm font-medium">
                    Why This Direction Might Win
                  </h4>
                  <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                    {direction.why_this_direction_might_win}
                  </p>
                </section>
              </div>
            ))}
          </div>
        </div>
      )}
      {directionArtifacts && directionArtifacts.length > 1 && (
        <div className="mt-10 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Directions History</h2>

          <div className="mt-4 space-y-3">
            {directionArtifacts.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="font-medium">Version {item.version}</p>
                  <p className="text-sm text-gray-500">{item.created_at}</p>
                </div>

                {latestDirectionsArtifact?.id === item.id && (
                  <span className="text-sm text-pink-600">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {structuredBuildPack && (
        <div className="mt-10 rounded-lg border p-6 space-y-8">
          <h2 className="text-2xl font-semibold">
            Build Pack{" "}
            {latestBuildPack?.version ? `(v${latestBuildPack.version})` : ""}
          </h2>

          <section>
            <h3 className="text-lg font-medium">Direction Name</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredBuildPack.direction_name}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">Concept Summary</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredBuildPack.concept_summary}
            </p>
          </section>

          <section>
            <h3 className="text-lg font-medium">Page Map</h3>
            <div className="mt-3 space-y-3">
              {buildPackPageMap.map((item, index) => (
                <div key={index} className="rounded-md border p-3">
                  <p className="font-medium">{item.page}</p>
                  <p className="mt-1 text-sm text-gray-700">{item.purpose}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium">Core Components</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {buildPackCoreComponents.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">User Flow</h3>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {buildPackUserFlow.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-medium">v0 Prompt</h3>
            <pre className="mt-2 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm leading-6">
              {structuredBuildPack.v0_prompt}
            </pre>
          </section>

          <section>
            <h3 className="text-lg font-medium">Notes</h3>
            <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
              {structuredBuildPack.notes}
            </p>
          </section>
        </div>
      )}
      {buildPacks && buildPacks.length > 1 && (
        <div className="mt-10 rounded-lg border p-6">
          <h2 className="text-xl font-semibold">Build Pack History</h2>

          <div className="mt-4 space-y-3">
            {buildPacks.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border px-4 py-3"
              >
                <div>
                  <p className="font-medium">Version {item.version}</p>
                  <p className="text-sm text-gray-500">
                    {item.direction_name || "Unnamed direction"}
                  </p>
                  <p className="text-sm text-gray-500">{item.created_at}</p>
                </div>

                {latestBuildPack?.id === item.id && (
                  <span className="text-sm text-indigo-600">Current</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

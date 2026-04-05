import { notFound } from "next/navigation";
import { getPublicProjectPage } from "@/lib/get-public-project-page";

type Direction = {
  name?: string;
  complexity?: string;
  key_screens?: string[];
  core_user_flow?: string[];
  concept_summary?: string;
  why_this_direction_might_win?: string;
};

type RecommendedDirection = {
  name?: string;
  reason?: string;
};

function asArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export default async function PublicProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPublicProjectPage(slug);

  if (!data) {
    notFound();
  }

  const { project, brief, researchSynthesis, prd, prototypeDirections } = data;

  const briefJson = brief?.structured_brief_json ?? {};
  const synthesisJson = researchSynthesis?.synthesis_json ?? {};
  const prdJson = prd?.prd_json ?? {};
  const directionsJson = prototypeDirections?.directions_json ?? {};

  const title =
    asString(prdJson.title) ||
    asString(briefJson.title) ||
    "Untitled Project";

  const summary =
    asString(prdJson.project_summary) ||
    asString(briefJson.project_summary) ||
    asString(project.raw_idea) ||
    "A structured product exploration developed through research, synthesis, direction-setting, and build planning.";

  const coreProblem =
    asString(prdJson.core_problem) ||
    asString(briefJson.core_problem) ||
    asString(project.raw_idea);

  const targetUsers =
    asArray(prdJson.target_users).length > 0
      ? asArray(prdJson.target_users)
      : asArray(synthesisJson.target_users);

  const painPoints =
    asArray(prdJson.pain_points).length > 0
      ? asArray(prdJson.pain_points)
      : asArray(synthesisJson.pain_points);

  const opportunities = asArray(synthesisJson.opportunities);
  const currentWorkflow = asArray(synthesisJson.current_workflow);
  const alternatives =
    asArray(prdJson.existing_alternatives).length > 0
      ? asArray(prdJson.existing_alternatives)
      : asArray(synthesisJson.existing_alternatives);

  const directions: Direction[] = Array.isArray(directionsJson.directions)
    ? directionsJson.directions
    : [];

  const recommendedDirection: RecommendedDirection | null =
    directionsJson.recommended_direction &&
    typeof directionsJson.recommended_direction === "object"
      ? directionsJson.recommended_direction
      : null;

  const recommendedDirectionDetails =
    recommendedDirection?.name
      ? directions.find((direction) => direction.name === recommendedDirection.name) ?? null
      : null;

  const mustHaveCapabilities = asArray(prdJson.must_have_capabilities);
  const mvpGoal = asString(prdJson.mvp_goal);
  const productWedge = asString(prdJson.product_wedge);
  const keyRisks = asArray(prdJson.key_risks);
  const openQuestions =
    asArray(prdJson.open_questions).length > 0
      ? asArray(prdJson.open_questions)
      : asArray(synthesisJson.unknowns);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="mb-14">
        <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
          Case Study
        </p>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          {title}
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          {summary}
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold tracking-tight">The Problem</h2>

        {targetUsers.length > 0 ? (
          <div className="mt-5">
            <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
              Target Users
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {targetUsers.map((user, index) => (
                <span
                  key={index}
                  className="rounded-full border px-3 py-1 text-sm text-muted-foreground"
                >
                  {user}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mt-6 max-w-3xl leading-8 text-muted-foreground">
          {coreProblem || "Problem statement coming soon."}
        </p>

        {painPoints.length > 0 ? (
          <div className="mt-8">
            <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
              Key Pain Points
            </p>
            <ul className="mt-3 grid gap-3 md:grid-cols-2">
              {painPoints.map((painPoint, index) => (
                <li key={index} className="rounded-xl border p-4 text-muted-foreground">
                  {painPoint}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {(opportunities.length > 0 || currentWorkflow.length > 0 || alternatives.length > 0) && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight">Research Highlights</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {opportunities.length > 0 ? (
              <div className="rounded-2xl border p-5">
                <h3 className="font-medium">Opportunities</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                  {opportunities.slice(0, 5).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {currentWorkflow.length > 0 ? (
              <div className="rounded-2xl border p-5">
                <h3 className="font-medium">Current Workflow</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                  {currentWorkflow.slice(0, 5).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {alternatives.length > 0 ? (
              <div className="rounded-2xl border p-5">
                <h3 className="font-medium">Existing Alternatives</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                  {alternatives.slice(0, 5).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {directions.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight">Explored Product Directions</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {directions.slice(0, 4).map((direction, index) => (
              <div key={index} className="rounded-2xl border p-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-medium">
                    {asString(direction.name) || `Direction ${index + 1}`}
                  </h3>

                  {direction.complexity ? (
                    <span className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
                      {direction.complexity}
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {asString(direction.concept_summary) || "Direction summary coming soon."}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {recommendedDirection && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight">Recommended Direction</h2>

          <div className="mt-6 rounded-2xl border bg-muted/30 p-6">
            <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
              Selected Concept
            </p>

            <h3 className="mt-2 text-xl font-semibold">
              {asString(recommendedDirection.name) || "Selected Direction"}
            </h3>

            <p className="mt-4 leading-8 text-muted-foreground">
              {asString(recommendedDirection.reason) ||
                "Recommendation rationale coming soon."}
            </p>

            {recommendedDirectionDetails?.why_this_direction_might_win ? (
              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
                  Why This Direction Might Win
                </p>
                <p className="mt-2 leading-8 text-muted-foreground">
                  {recommendedDirectionDetails.why_this_direction_might_win}
                </p>
              </div>
            ) : null}

            {recommendedDirectionDetails?.core_user_flow &&
            recommendedDirectionDetails.core_user_flow.length > 0 ? (
              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
                  Core User Flow
                </p>
                <ul className="mt-3 space-y-2 text-muted-foreground">
                  {recommendedDirectionDetails.core_user_flow.map((step, index) => (
                    <li key={index} className="rounded-xl border bg-background p-4">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {recommendedDirectionDetails?.key_screens &&
            recommendedDirectionDetails.key_screens.length > 0 ? (
              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
                  Key Screens
                </p>
                <ul className="mt-3 grid gap-3 md:grid-cols-2">
                  {recommendedDirectionDetails.key_screens.map((screen, index) => (
                    <li key={index} className="rounded-xl border bg-background p-4 text-muted-foreground">
                      {screen}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {(mustHaveCapabilities.length > 0 || mvpGoal || productWedge) && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight">What Would Be Built</h2>

          {mvpGoal ? (
            <div className="mt-6 rounded-2xl border p-5">
              <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
                MVP Goal
              </p>
              <p className="mt-3 leading-8 text-muted-foreground">{mvpGoal}</p>
            </div>
          ) : null}

          {productWedge ? (
            <div className="mt-4 rounded-2xl border p-5">
              <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
                Product Wedge
              </p>
              <p className="mt-3 leading-8 text-muted-foreground">{productWedge}</p>
            </div>
          ) : null}

          {mustHaveCapabilities.length > 0 ? (
            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
                Must-Have Capabilities
              </p>
              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {mustHaveCapabilities.map((capability, index) => (
                  <li key={index} className="rounded-xl border p-4 text-muted-foreground">
                    {capability}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      )}

      {(openQuestions.length > 0 || keyRisks.length > 0) && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight">Open Questions & Risks</h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {openQuestions.length > 0 ? (
              <div className="rounded-2xl border p-5">
                <h3 className="font-medium">Open Questions</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                  {openQuestions.map((question, index) => (
                    <li key={index}>{question}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {keyRisks.length > 0 ? (
              <div className="rounded-2xl border p-5">
                <h3 className="font-medium">Key Risks</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-muted-foreground">
                  {keyRisks.map((risk, index) => (
                    <li key={index}>{risk}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </section>
      )}

      <section className="pt-4">
        <p className="text-sm leading-7 text-muted-foreground">
          This concept was developed through a structured AI-assisted product workflow spanning
          brief generation, research synthesis, PRD creation, direction exploration, and build planning.
        </p>
      </section>
    </main>
  );
}
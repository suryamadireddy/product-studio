import Link from "next/link";
import { getFeaturedPublicProjects } from "@/lib/get-featured-public-projects";

export default async function HomePage() {
  const projects = await getFeaturedPublicProjects();

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            AI Product Studio
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            Research-backed product concepts, PRDs, and build-ready case studies.
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            This portfolio showcases a structured workflow that turns rough ideas
            into product briefs, research synthesis, PRDs, prototype directions,
            and implementation-ready build plans. Each project is presented as a
            curated case study focused on the problem, insight, direction, and
            what would actually get built.
          </p>

          <div className="mt-8">
            <a
              href="#projects"
              className="inline-flex items-center rounded-xl border px-5 py-3 text-sm font-medium transition hover:bg-muted"
            >
              Explore Projects
            </a>
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/30">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-5">
            <div>Idea</div>
            <div>Research</div>
            <div>PRD</div>
            <div>Direction</div>
            <div>Build Plan</div>
          </div>
        </div>
      </section>

      <section id="projects" className="mx-auto max-w-6xl px-6 py-16 md:py-20">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Featured Projects
          </h2>
          <p className="mt-2 text-muted-foreground">
            Selected product explorations developed through the studio workflow.
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-2xl border p-8 text-muted-foreground">
            No public projects yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}/public`}
                className="group rounded-2xl border bg-background p-6 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex h-full flex-col">
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Case Study
                    </p>
                    <h3 className="mt-2 text-xl font-semibold tracking-tight">
                      {project.title}
                    </h3>
                  </div>

                  <p className="text-sm leading-7 text-muted-foreground">
                    A structured product exploration developed through research,
                    synthesis, direction-setting, and build planning.
                  </p>

                  <div className="mt-6 pt-4 text-sm font-medium">
                    View Project →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
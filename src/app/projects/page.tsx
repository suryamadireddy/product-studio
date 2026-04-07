import type { Metadata } from "next";
import { Header } from "@/components/public/header";
import { getAllPublicProjects } from "@/lib/get-featured-public-projects";
import { ProjectCard } from "@/components/public/project-card";

export const metadata: Metadata = {
    title: "Projects | KSM Studio",
    description:
        "A public index of research-backed product explorations and case studies published through KSM Studio.",
};

export default async function WorkIndexPage() {
    const projects = await getAllPublicProjects();

    return (
        <main className="min-h-screen bg-background">
            <Header />

            <section className="px-6 py-16 md:py-20">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-10">
                        <h1 className="text-4xl font-normal tracking-tight text-foreground md:text-5xl">
                            Projects
                        </h1>

                        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                            A public index of research-backed product explorations published through KSM Studio.
                        </p>
                    </div>

                    {projects.length === 0 ? (
                        <div className="border-t">
                            No public projects yet.
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {projects.map((project, index) => (
                                <ProjectCard key={project.id} project={project} index={index} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
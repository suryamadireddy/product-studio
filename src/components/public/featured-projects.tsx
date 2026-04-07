"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { WheelEvent } from "react";
import type { PublicProjectCard } from "@/lib/get-featured-public-projects";

function getTileDescription(project: PublicProjectCard) {
    if (project.summary?.trim()) return project.summary.trim();
    if (project.rawIdea?.trim()) return project.rawIdea.trim();

    return "Research-backed product concept with a public case study, artifacts, and grounded product direction.";
}

export function FeaturedProjects({
    projects,
}: {
    projects: PublicProjectCard[];
}) {
    const featuredProjects = useMemo(() => projects.slice(0, 4), [projects]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const lastWheelAtRef = useRef(0);

    const safeSelectedIndex =
        featuredProjects.length === 0
            ? 0
            : Math.min(selectedIndex, featuredProjects.length - 1);

    const selectedProject = featuredProjects[safeSelectedIndex] ?? null;

    function handleSelect(index: number) {
        setSelectedIndex(index);
    }

    function handleHeroWheel(event: WheelEvent<HTMLDivElement>) {
        if (featuredProjects.length <= 1) return;

        const now = Date.now();
        if (now - lastWheelAtRef.current < 350) {
            return;
        }

        const direction = Math.sign(event.deltaY);
        if (direction === 0) return;

        const atFirst = safeSelectedIndex === 0;
        const atLast = safeSelectedIndex === featuredProjects.length - 1;

        const shouldMoveWithinFeatured =
            (direction > 0 && !atLast) || (direction < 0 && !atFirst);

        if (shouldMoveWithinFeatured) {
            event.preventDefault();
            lastWheelAtRef.current = now;
            setSelectedIndex((current) => {
                const next = current + direction;
                return Math.max(0, Math.min(next, featuredProjects.length - 1));
            });
        }
    }

    return (
        <section id="work" className="py-16 md:py-20">


            {featuredProjects.length === 0 ? (
                <div className="px-6">
                    <div className="rounded-3xl border p-8 text-muted-foreground">
                        No public projects yet.
                    </div>
                </div>
            ) : (
                <div className="px-6">
                    <div className="grid md:grid-cols-[270px_minmax(0,1fr)_24px] md:items-stretch md:gap-6">
                        <div className="grid grid-cols-4 gap-0 md:grid-cols-1">
                            {featuredProjects.map((project, index) => {
                                const isSelected = index === safeSelectedIndex;

                                return (
                                    <button
                                        key={project.id}
                                        type="button"
                                        onClick={() => handleSelect(index)}
                                        className={[
                                            "w-full text-left",
                                            "flex h-[180px] items-end p-3 md:h-[150px] md:p-4",
                                            isSelected
                                                ? "rounded-2xl bg-gradient-to-r from-background via-neutral-900/60 to-neutral-950 text-white"
                                                : "border-border bg-background hover:bg-muted/30",
                                        ].join(" ")}
                                        aria-pressed={isSelected}
                                        aria-label={`Select project ${project.title}`}
                                    >
                                        <div className="w-full">
                                            <p
                                                className={[
                                                    "mb-2 text-[10px] uppercase tracking-[0.18em]",
                                                    isSelected
                                                        ? "text-neutral-400"
                                                        : "text-muted-foreground",
                                                ].join(" ")}
                                            >
                                                {index === 0 ? "Featured" : "Project"}
                                            </p>

                                            <h3
                                                className={[
                                                    "font-serif leading-tight",
                                                    isSelected
                                                        ? "text-base text-white md:text-lg"
                                                        : "text-sm text-foreground md:text-base",
                                                ].join(" ")}
                                            >
                                                {project.title}
                                            </h3>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {selectedProject ? (
                            <div onWheel={handleHeroWheel} className="h-full">
                                <Link
                                    href={`/projects/${selectedProject.slug}`}
                                    className="relative block h-full overflow-hidden rounded-2xl bg-neutral-950 shadow-lg ring-1 ring-white/10 transition duration-200 hover:opacity-95"
                                >
                                    <div className="relative flex h-full min-h-[600px] flex-col justify-between p-6 md:min-h-[600px] md:p-8">
                                        <div>
                                            <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                                                Featured Project
                                            </p>

                                            <h3 className="max-w-[14ch] font-serif text-3xl font-normal leading-tight tracking-tight text-white md:text-5xl">
                                                {selectedProject.title}
                                            </h3>

                                            <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-300 md:text-base">
                                                {getTileDescription(selectedProject)}
                                            </p>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between gap-4 pt-4">
                                            <span className="text-sm text-neutral-400">
                                                Explore the full case study
                                            </span>

                                            <span className="text-sm font-medium text-white">
                                                Open Project →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ) : null}

                        <div className="hidden md:flex md:flex-col md:items-center md:justify-center md:gap-3">
                            {featuredProjects.map((project, index) => {
                                const isSelected = index === safeSelectedIndex;

                                return (
                                    <button
                                        key={`${project.id}-dot`}
                                        type="button"
                                        onClick={() => handleSelect(index)}
                                        className={[
                                            "h-2.5 w-2.5 rounded-full bg-black transition-opacity",
                                            isSelected ? "opacity-100" : "opacity-30 hover:opacity-60",
                                        ].join(" ")}
                                        aria-label={`Go to ${project.title}`}
                                        aria-pressed={isSelected}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
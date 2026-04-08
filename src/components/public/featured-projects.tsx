"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { Ref, WheelEvent } from "react";
import type { PublicProjectCard } from "@/lib/get-featured-public-projects";

function getTileDescription(project: PublicProjectCard) {
  if (project.summary?.trim()) return project.summary.trim();
  if (project.rawIdea?.trim()) return project.rawIdea.trim();

  return "Research-backed product concept with a public case study, artifacts, and grounded product direction.";
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function FeaturedProjects({
  projects,
  surfaceRef,
  workProgress = 0,
}: {
  projects: PublicProjectCard[];
  surfaceRef?: Ref<HTMLDivElement>;
  workProgress?: number;
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
    if (now - lastWheelAtRef.current < 350) return;

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

  // Instead of negative margins, collapse the wrapper padding to 0.
  // This makes the black surface expand into the whole work section smoothly.
  const horizontalPad = lerp(24, 0, workProgress); // px-6 -> 0
  const verticalPad = lerp(64, 0, workProgress); // close to py-16 -> 0

  const scale = lerp(0.985, 1, workProgress);
  const topRadius = lerp(24, 0, workProgress);
  const bottomRadius = lerp(24, 16, workProgress);

  return (
    <section id="work" className="overflow-visible">
      {featuredProjects.length === 0 ? (
        <div className="px-6 py-16 md:px-12 md:py-20">
          <div className="rounded-3xl border p-8 text-muted-foreground">
            No public projects yet.
          </div>
        </div>
      ) : (
        <div
          style={{
            paddingLeft: `${horizontalPad}px`,
            paddingRight: `${horizontalPad}px`,
            paddingTop: `${verticalPad}px`,
            paddingBottom: `${verticalPad}px`,
          }}
        >
          <div
            ref={surfaceRef}
            className="overflow-hidden bg-black will-change-transform"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center top",
              borderTopLeftRadius: `${topRadius}px`,
              borderTopRightRadius: `${topRadius}px`,
              borderBottomLeftRadius: `${bottomRadius}px`,
              borderBottomRightRadius: `${bottomRadius}px`,
            }}
          >
            <div className="grid md:grid-cols-[140px_minmax(0,1fr)] md:items-stretch md:gap-5">
              {/* tiles */}
              <div className="flex flex-row gap-0 p-3 md:flex-col md:items-start md:p-5">
                {featuredProjects.map((project, index) => {
                  const isSelected = index === safeSelectedIndex;

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => handleSelect(index)}
                      className={[
                        "aspect-square w-[120px] text-left md:w-[140px]",
                        "rounded-2xl bg-white transition-all duration-300",
                        isSelected
                          ? "scale-[1.02]"
                          : "opacity-90 hover:opacity-100",
                      ].join(" ")}
                      aria-pressed={isSelected}
                      aria-label={`Select project ${project.title}`}
                    >
                      <div className="h-full w-full" />
                    </button>
                  );
                })}
              </div>

              {/* hero */}
              {selectedProject ? (
                <div onWheel={handleHeroWheel} className="h-full">
                  <Link
                    href={`/projects/${selectedProject.slug}`}
                    className="relative block h-full overflow-hidden transition duration-200 hover:opacity-95"
                  >
                    <div className="relative flex h-full min-h-[600px] flex-col justify-between p-6 md:p-8">
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
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

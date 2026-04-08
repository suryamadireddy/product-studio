"use client";

import { useEffect, useRef, useState } from "react";
import type { PublicProjectCard } from "@/lib/get-featured-public-projects";
import { Header } from "@/components/public/header";
import { Hero } from "@/components/public/hero";
import { FeaturedProjects } from "@/components/public/featured-projects";
import { Process } from "@/components/public/process";
import { Closing } from "@/components/public/closing";
import { Footer } from "@/components/public/footer";

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function HomeShell({ projects }: { projects: PublicProjectCard[] }) {
  const headerRef = useRef<HTMLElement>(null);
  const workSurfaceRef = useRef<HTMLDivElement>(null);

  const [workProgress, setWorkProgress] = useState(0);
  const [headerColorProgress, setHeaderColorProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;

    let targetWorkProgress = 0;
    let smoothWorkProgress = 0;
    let smoothHeaderColorProgress = 0;

    // starts closer to the section
    const enterZone = 36;
    // shrinks back while still visible before leaving
    const exitZone = 180;

    const workSmoothing = 0.16;
    const colorSmoothing = 0.08;

    const measureTargets = () => {
      const headerEl = headerRef.current;
      const workEl = workSurfaceRef.current;

      if (!headerEl || !workEl) {
        targetWorkProgress = 0;
        return;
      }

      const headerLine = headerEl.offsetHeight;
      const rect = workEl.getBoundingClientRect();

      const enterProgress =
        rect.top > headerLine
          ? clamp(1 - (rect.top - headerLine) / enterZone)
          : 1;

      const exitProgress =
        rect.bottom > headerLine
          ? clamp((rect.bottom - headerLine) / exitZone)
          : 0;

      targetWorkProgress = Math.min(enterProgress, exitProgress);
    };

    const animate = () => {
      smoothWorkProgress = lerp(
        smoothWorkProgress,
        targetWorkProgress,
        workSmoothing,
      );

      // color trails movement slightly
      smoothHeaderColorProgress = lerp(
        smoothHeaderColorProgress,
        smoothWorkProgress,
        colorSmoothing,
      );

      setWorkProgress(smoothWorkProgress);
      setHeaderColorProgress(smoothHeaderColorProgress);

      rafId = window.requestAnimationFrame(animate);
    };

    const onScrollOrResize = () => {
      measureTargets();
    };

    measureTargets();
    rafId = window.requestAnimationFrame(animate);

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Header
        headerRef={headerRef}
        headerProgress={workProgress}
        headerColorProgress={headerColorProgress}
      />
      <Hero />
      <FeaturedProjects
        projects={projects}
        surfaceRef={workSurfaceRef}
        workProgress={workProgress}
      />
      <Process />
      <Closing />
      <Footer />
    </main>
  );
}

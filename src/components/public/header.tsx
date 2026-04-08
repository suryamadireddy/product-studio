"use client";

import Link from "next/link";
import type { RefObject } from "react";

type HeaderProps = {
  headerProgress?: number;
  headerColorProgress?: number;
  headerRef?: RefObject<HTMLElement | null>;
};

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

export function Header({
  headerProgress = 0,
  headerColorProgress = 0,
  headerRef,
}: HeaderProps) {
  // motion follows work section exactly
  const brandShiftX = lerp(0, -10, headerProgress);
  const navShiftX = lerp(0, -28, headerProgress);

  // color trails slightly behind motion
  const bgTone = Math.round(lerp(255, 10, headerColorProgress));
  const brandTone = Math.round(lerp(15, 255, headerColorProgress));
  const navTone = Math.round(lerp(90, 190, headerColorProgress));

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50"
      style={{
        backgroundColor: `rgba(${bgTone}, ${bgTone}, ${bgTone}, 0.96)`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="h-[72px] px-8 md:px-10">
        <div className="flex h-full items-center justify-between">
          <Link
            href="/"
            className="text-sm font-medium tracking-tight will-change-transform"
            style={{
              color: `rgb(${brandTone}, ${brandTone}, ${brandTone})`,
              transform: `translateX(${brandShiftX}px)`,
            }}
          >
            KSM Studio
          </Link>

          <div
            className="flex items-center gap-8 will-change-transform"
            style={{
              transform: `translateX(${navShiftX}px)`,
            }}
          >
            <Link
              href="/projects"
              className="text-sm"
              style={{
                color: `rgb(${navTone}, ${navTone}, ${navTone})`,
              }}
            >
              Projects
            </Link>
            <Link
              href="/#process"
              className="text-sm"
              style={{
                color: `rgb(${navTone}, ${navTone}, ${navTone})`,
              }}
            >
              Process
            </Link>
            <Link
              href="/#about"
              className="text-sm"
              style={{
                color: `rgb(${navTone}, ${navTone}, ${navTone})`,
              }}
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

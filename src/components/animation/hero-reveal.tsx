"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { loadGsap, prefersReducedMotion } from "@/components/animation/motion";

export function HeroReveal({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void loadGsap().then(({ gsap }) => {
      if (cancelled || !scopeRef.current) return;

      const context = gsap.context(() => {
        const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

        timeline
          .from("[data-hero-line]", {
            opacity: 0,
            duration: 0.78,
            stagger: 0.08,
            yPercent: 105,
          })
          .from(
            "[data-hero-meta]",
            {
              opacity: 0,
              duration: 0.45,
              stagger: 0.06,
              y: 14,
            },
            0.12,
          )
          .from(
            "[data-hero-support]",
            {
              opacity: 0,
              duration: 0.52,
              stagger: 0.07,
              y: 18,
            },
            0.42,
          );
      }, scopeRef);

      cleanup = () => context.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={scopeRef}>{children}</div>;
}

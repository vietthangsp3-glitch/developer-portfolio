"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { loadGsap, prefersReducedMotion } from "@/components/animation/motion";

export function SelectedWorkMotion({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void loadGsap().then(({ gsap }) => {
      if (cancelled || !scopeRef.current) return;

      const context = gsap.context(() => {
        const mediaQuery = gsap.matchMedia();

        mediaQuery.add(
          {
            desktop: "(min-width: 768px)",
            mobile: "(max-width: 767px)",
          },
          ({ conditions }) => {
            const { desktop } = conditions as { desktop: boolean };
            const cards = gsap.utils.toArray<HTMLElement>(
              "[data-project-layout]",
            );

            cards.forEach((card) => {
              const media = card.querySelector<HTMLElement>(
                "[data-project-media]",
              );
              const metadata = card.querySelector<HTMLElement>(
                "[data-project-meta]",
              );

              if (!media || !metadata) return;

              const timeline = gsap.timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: {
                  trigger: card,
                  once: true,
                  start: desktop ? "top 84%" : "top 90%",
                },
              });

              timeline
                .from(
                  media,
                  {
                    duration: desktop ? 0.5 : 0.35,
                    opacity: 0,
                  },
                  0,
                )
                .from(
                  metadata,
                  {
                    opacity: 0,
                    duration: desktop ? 0.42 : 0.34,
                    y: desktop ? 12 : 8,
                  },
                  desktop ? 0.12 : 0.08,
                );
            });
          },
        );

        return () => mediaQuery.revert();
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

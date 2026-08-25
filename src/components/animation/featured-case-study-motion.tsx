"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { loadGsap, prefersReducedMotion } from "@/components/animation/motion";

export function FeaturedCaseStudyMotion({ children }: { children: ReactNode }) {
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
            const section = scopeRef.current?.querySelector<HTMLElement>(
              "[data-featured-case-study]",
            );
            const media = section?.querySelector<HTMLElement>(
              "[data-featured-media]",
            );
            const image = media?.querySelector("img");
            const intro = section?.querySelector<HTMLElement>(
              "[data-featured-intro]",
            );
            const metadata = section?.querySelector<HTMLElement>(
              "[data-featured-meta]",
            );

            if (!section || !media || !image || !intro || !metadata) return;

            gsap
              .timeline({
                defaults: { ease: "power3.out" },
                scrollTrigger: {
                  trigger: section,
                  once: true,
                  start: desktop ? "top 78%" : "top 88%",
                },
              })
              .from(intro, {
                opacity: 0,
                duration: 0.5,
                y: desktop ? 22 : 12,
              })
              .from(
                media,
                {
                  clipPath: desktop ? "inset(7% 0 7% 0)" : "inset(0 0 10% 0)",
                  duration: desktop ? 0.78 : 0.48,
                },
                0.16,
              )
              .from(metadata, { opacity: 0, duration: 0.42, y: 12 }, 0.5);

            if (desktop) {
              gsap.fromTo(
                image,
                { scale: 1.035 },
                {
                  ease: "none",
                  scale: 1,
                  scrollTrigger: {
                    trigger: media,
                    start: "top 86%",
                    end: "bottom 36%",
                    scrub: 0.45,
                  },
                },
              );
            }
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

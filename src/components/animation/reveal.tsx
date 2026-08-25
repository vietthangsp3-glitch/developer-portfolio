"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { loadGsap, prefersReducedMotion } from "@/components/animation/motion";

export function Reveal({ children }: { children: ReactNode }) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void loadGsap().then(({ gsap }) => {
      if (cancelled || !scopeRef.current) return;

      const context = gsap.context(() => {
        const element = scopeRef.current;
        if (!element) return;

        if (element.getBoundingClientRect().top <= window.innerHeight * 0.88) {
          return;
        }

        gsap.fromTo(
          element,
          { opacity: 0, y: 18 },
          {
            duration: 0.52,
            ease: "power3.out",
            onComplete: () => {
              gsap.set(element, {
                clearProps: "opacity,transform",
              });
            },
            opacity: 1,
            scrollTrigger: {
              trigger: element,
              once: true,
              start: "top 88%",
            },
            y: 0,
          },
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

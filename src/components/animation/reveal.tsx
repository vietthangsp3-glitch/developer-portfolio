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
        gsap.from(scopeRef.current, {
          opacity: 0,
          duration: 0.52,
          ease: "power3.out",
          scrollTrigger: {
            trigger: scopeRef.current,
            once: true,
            start: "top 88%",
          },
          y: 18,
        });
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

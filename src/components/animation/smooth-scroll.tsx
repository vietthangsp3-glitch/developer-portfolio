"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { loadGsap, prefersReducedMotion } from "@/components/animation/motion";

type MotionRuntime = {
  lenis: import("lenis").default;
  refresh: () => void;
};

export function SmoothScroll() {
  const pathname = usePathname();
  const runtimeRef = useRef<MotionRuntime | null>(null);

  useEffect(() => {
    if (
      prefersReducedMotion() ||
      window.matchMedia("(pointer: coarse)").matches
    ) {
      return;
    }

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    void Promise.all([import("lenis"), loadGsap()]).then(
      ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (cancelled) return;

        const lenis = new Lenis({
          duration: 0.72,
          smoothWheel: true,
          syncTouch: false,
          wheelMultiplier: 0.9,
        });
        const update = (time: number) => lenis.raf(time * 1000);
        const refresh = () => {
          lenis.resize();
          ScrollTrigger.refresh();
        };

        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(update);
        gsap.ticker.lagSmoothing(0);
        runtimeRef.current = { lenis, refresh };

        cleanup = () => {
          runtimeRef.current = null;
          lenis.off("scroll", ScrollTrigger.update);
          gsap.ticker.remove(update);
          gsap.ticker.lagSmoothing(500, 33);
          lenis.destroy();
        };
      },
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      runtimeRef.current?.refresh(),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

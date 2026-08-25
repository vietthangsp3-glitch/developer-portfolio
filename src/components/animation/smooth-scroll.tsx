"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { loadGsap, prefersReducedMotion } from "@/components/animation/motion";

type MotionRuntime = {
  clearScrollMemory: () => void;
  lenis: import("lenis").default;
  refresh: () => void;
};

function getHashTarget() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;

  try {
    return document.getElementById(decodeURIComponent(hash));
  } catch {
    return null;
  }
}

function resetRouteScroll(
  runtime: MotionRuntime | null,
  { refresh = true }: { refresh?: boolean } = {},
) {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  const hashTarget = getHashTarget();

  runtime?.clearScrollMemory();
  if (refresh) runtime?.refresh();

  root.style.scrollBehavior = "auto";

  if (hashTarget) {
    hashTarget.scrollIntoView({ block: "start" });
  } else {
    window.scrollTo(0, 0);
  }

  runtime?.lenis.scrollTo(window.scrollY, {
    force: true,
    immediate: true,
  });

  root.style.scrollBehavior = previousScrollBehavior;
}

export function SmoothScroll() {
  const pathname = usePathname();
  const runtimeRef = useRef<MotionRuntime | null>(null);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;

    function handleNavigation(event: MouseEvent) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (
        !link ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.hash) {
        return;
      }

      resetRouteScroll(runtimeRef.current, { refresh: false });
    }

    window.history.scrollRestoration = "manual";
    document.addEventListener("click", handleNavigation, true);

    return () => {
      document.removeEventListener("click", handleNavigation, true);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

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
        runtimeRef.current = {
          clearScrollMemory: () => ScrollTrigger.clearScrollMemory("manual"),
          lenis,
          refresh,
        };

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
    let settleFrame = 0;
    const commitFrame = window.requestAnimationFrame(() => {
      settleFrame = window.requestAnimationFrame(() => {
        resetRouteScroll(runtimeRef.current);
      });
    });

    return () => {
      window.cancelAnimationFrame(commitFrame);
      window.cancelAnimationFrame(settleFrame);
    };
  }, [pathname]);

  return null;
}

import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ScrambleText } from "@/components/animation/scramble-text";

function mockMotionPreferences({
  reduced = false,
  hover = true,
}: {
  reduced?: boolean;
  hover?: boolean;
}) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reduced : hover,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function useSeededRandom() {
  let seed = 23;
  vi.spyOn(Math, "random").mockImplementation(() => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  });
}

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ScrambleText", () => {
  it("preserves the supplied casing in its resolved state", () => {
    mockMotionPreferences({});

    const { container } = render(<ScrambleText text="Thang" />);

    expect(container.querySelector("[data-scramble-visual]")).toHaveTextContent(
      "Thang",
    );
  });

  it("performs one fixed-length substitution and restores the original", () => {
    vi.useFakeTimers();
    mockMotionPreferences({});
    useSeededRandom();

    const { container } = render(<ScrambleText text="THANG" />);
    const root = container.querySelector("[data-scramble-text]")!;
    const visual = root.querySelector("[data-scramble-visual]")!;
    const accessibleText = root.querySelector(".sr-only");

    fireEvent.pointerEnter(root);
    const randomizedText = visual.textContent ?? "";
    const changedCharacters = Array.from(randomizedText).filter(
      (character, index) => character !== "THANG"[index],
    );

    expect(randomizedText).toHaveLength(5);
    expect(changedCharacters.length).toBeGreaterThanOrEqual(2);
    expect(vi.getTimerCount()).toBe(1);
    expect(accessibleText).toHaveTextContent("THANG");

    act(() => vi.advanceTimersByTime(160));
    expect(visual).toHaveTextContent("THANG");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("varies changed counts, positions, and replacements across 20 entries", () => {
    vi.useFakeTimers();
    mockMotionPreferences({});
    useSeededRandom();

    const original = "NGUYEN";
    const { container } = render(<ScrambleText text={original} />);
    const root = container.querySelector("[data-scramble-text]")!;
    const visual = root.querySelector("[data-scramble-visual]")!;
    const changedCounts = new Set<number>();
    const changedPositions = new Set<string>();
    const randomizedValues = new Set<string>();

    for (let entry = 0; entry < 20; entry += 1) {
      fireEvent.pointerEnter(root);
      const randomizedText = visual.textContent ?? "";
      const positions = Array.from(randomizedText)
        .map((character, index) => (character !== original[index] ? index : -1))
        .filter((index) => index >= 0);

      expect(randomizedText).toHaveLength(original.length);
      expect(positions.length).toBeGreaterThanOrEqual(2);
      expect(positions.length).toBeLessThanOrEqual(original.length);
      expect(vi.getTimerCount()).toBe(1);

      changedCounts.add(positions.length);
      changedPositions.add(positions.join(","));
      randomizedValues.add(randomizedText);

      act(() => vi.advanceTimersByTime(160));
      expect(visual).toHaveTextContent(original);
      fireEvent.pointerLeave(root);
    }

    expect(changedCounts.size).toBeGreaterThan(1);
    expect(changedPositions.size).toBeGreaterThan(1);
    expect(randomizedValues.size).toBeGreaterThan(1);
  });

  it("clears its pending restore when the pointer leaves", () => {
    vi.useFakeTimers();
    mockMotionPreferences({});
    useSeededRandom();

    const { container } = render(<ScrambleText text="THANG" />);
    const root = container.querySelector("[data-scramble-text]")!;
    const visual = root.querySelector("[data-scramble-visual]")!;

    fireEvent.pointerEnter(root);
    expect(visual).not.toHaveTextContent("THANG");
    expect(vi.getTimerCount()).toBe(1);

    fireEvent.pointerLeave(root);
    expect(visual).toHaveTextContent("THANG");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stays resolved for reduced motion and non-hover pointers", () => {
    vi.useFakeTimers();

    for (const preferences of [
      { reduced: true, hover: true },
      { reduced: false, hover: false },
    ]) {
      mockMotionPreferences(preferences);
      const { container, unmount } = render(<ScrambleText text="THANG" />);
      const root = container.querySelector("[data-scramble-text]")!;

      fireEvent.pointerEnter(root);
      expect(root.querySelector("[data-scramble-visual]")).toHaveTextContent(
        "THANG",
      );
      expect(vi.getTimerCount()).toBe(0);
      unmount();
    }
  });
});

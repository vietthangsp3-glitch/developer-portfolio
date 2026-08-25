"use client";

import { useEffect, useRef, useState } from "react";

const SCRAMBLE_CHARACTERS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*+-_?/<>[]{}";
const RESTORE_DELAY = 160;

type ScrambleTextProps = {
  text: string;
  className?: string;
};

function randomReplacement(originalCharacter: string) {
  const availableCharacters = Array.from(SCRAMBLE_CHARACTERS).filter(
    (character) => character !== originalCharacter,
  );
  const index = Math.floor(Math.random() * availableCharacters.length);
  return availableCharacters[index];
}

function createRandomizedText(text: string) {
  const characters = Array.from(text);
  const minimumChanges = Math.min(2, characters.length);
  const changedCount =
    minimumChanges +
    Math.floor(Math.random() * (characters.length - minimumChanges + 1));
  const indexes = characters.map((_, index) => index);

  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[randomIndex]] = [
      indexes[randomIndex],
      indexes[index],
    ];
  }

  for (const index of indexes.slice(0, changedCount)) {
    characters[index] = randomReplacement(characters[index]);
  }

  return characters.join("");
}

export function ScrambleText({ text, className = "" }: ScrambleTextProps) {
  const resolvedText = text;
  const [displayText, setDisplayText] = useState(resolvedText);
  const restoreTimerRef = useRef<number | null>(null);

  function restoreOriginal() {
    if (restoreTimerRef.current !== null) {
      window.clearTimeout(restoreTimerRef.current);
      restoreTimerRef.current = null;
    }
    setDisplayText(resolvedText);
  }

  useEffect(() => {
    return () => {
      if (restoreTimerRef.current !== null) {
        window.clearTimeout(restoreTimerRef.current);
      }
    };
  }, []);

  function startScramble() {
    const motionDisabled = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const preciseHover = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    restoreOriginal();

    if (motionDisabled || !preciseHover) {
      return;
    }

    setDisplayText(createRandomizedText(resolvedText));
    restoreTimerRef.current = window.setTimeout(restoreOriginal, RESTORE_DELAY);
  }

  return (
    <span
      className={`relative inline-block whitespace-nowrap ${className}`}
      data-scramble-text
      onPointerEnter={startScramble}
      onPointerLeave={restoreOriginal}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible">
        {text}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-0 normal-case"
        data-scramble-visual
      >
        {displayText}
      </span>
    </span>
  );
}

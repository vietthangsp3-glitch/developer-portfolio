import type { ComponentProps } from "react";

type SectionProps = ComponentProps<"section">;

export function Section({ className = "", ...props }: SectionProps) {
  return <section className={className} {...props} />;
}

export function SectionDivider({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`border-border/80 mb-[clamp(2rem,4vw,3.5rem)] border-t ${className}`}
      data-section-divider
    />
  );
}

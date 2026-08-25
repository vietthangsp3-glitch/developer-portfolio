import type { ComponentProps } from "react";

type SectionProps = ComponentProps<"section">;

export function Section({ className = "", ...props }: SectionProps) {
  return <section className={className} {...props} />;
}

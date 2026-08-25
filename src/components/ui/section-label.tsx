import type { ComponentProps } from "react";

type SectionLabelProps = ComponentProps<"p">;

export function SectionLabel({ className = "", ...props }: SectionLabelProps) {
  return (
    <p
      className={`text-label text-muted-foreground font-mono tracking-[0.1em] uppercase ${className}`}
      {...props}
    />
  );
}

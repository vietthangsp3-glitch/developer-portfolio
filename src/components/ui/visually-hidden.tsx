import type { ComponentProps } from "react";

type VisuallyHiddenProps = ComponentProps<"span">;

export function VisuallyHidden(props: VisuallyHiddenProps) {
  return <span className="sr-only" {...props} />;
}

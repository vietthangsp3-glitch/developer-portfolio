import type { ComponentProps } from "react";

type ContainerProps = ComponentProps<"div">;

export function Container({ className = "", ...props }: ContainerProps) {
  return (
    <div
      className={`max-w-content px-page-gutter mx-auto w-full ${className}`}
      {...props}
    />
  );
}

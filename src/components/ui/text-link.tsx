import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";

type TextLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
};

export function TextLink({
  children,
  className = "",
  ...props
}: TextLinkProps) {
  return (
    <Link
      className={`group decoration-border hover:decoration-accent inline-flex min-h-11 items-center gap-2 font-medium underline underline-offset-4 transition-colors duration-200 ${className}`}
      {...props}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className="transition-transform duration-200 group-hover:translate-x-1"
      >
        ↗
      </span>
    </Link>
  );
}

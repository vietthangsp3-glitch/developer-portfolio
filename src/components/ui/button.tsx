import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "quiet";
};

const variantClasses = {
  primary:
    "bg-foreground text-background hover:bg-accent focus-visible:bg-accent",
  quiet:
    "border border-border bg-transparent text-foreground hover:border-foreground hover:bg-surface focus-visible:border-focus",
} as const;

export function Button({
  className = "",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

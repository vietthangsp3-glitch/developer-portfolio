type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
}: AdminPageHeaderProps) {
  return (
    <header className="border-border border-b pb-8">
      <p className="text-accent font-mono text-xs tracking-[0.12em] uppercase">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-[clamp(2rem,4vw,3.5rem)] leading-none font-medium tracking-[-0.04em]">
        {title}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl text-base leading-relaxed">
        {description}
      </p>
    </header>
  );
}

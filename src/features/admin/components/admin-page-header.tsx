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
    <header className="border-border/70 border-b pb-7">
      <p className="text-accent flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.14em] uppercase">
        <span className="bg-accent size-1.5 rounded-full" aria-hidden="true" />
        {eyebrow}
      </p>
      <h1 className="mt-3 text-[clamp(2rem,3.2vw,3rem)] leading-none font-medium tracking-[-0.035em]">
        {title}
      </h1>
      <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-6 sm:text-base">
        {description}
      </p>
    </header>
  );
}

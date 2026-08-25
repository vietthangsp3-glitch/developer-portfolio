import Link from "next/link";

import { MobileMenu } from "@/components/layout/mobile-menu";
import { Container } from "@/components/ui/container";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { siteConfig } from "@/config/site";
import type { PublicSiteSettingsDto } from "@/server/dal/dto";

export function SiteHeader({
  settings,
}: {
  settings?: PublicSiteSettingsDto | null;
}) {
  const name = settings?.siteName ?? siteConfig.name;
  const shortName = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <header className="h-header bg-background relative z-50">
      <Container className="border-border flex h-full items-center justify-between border-b">
        <Link
          href="/"
          className="group inline-flex min-h-11 items-center gap-3 text-sm font-medium tracking-[-0.01em] no-underline"
        >
          <span
            aria-hidden="true"
            className="bg-foreground text-background group-hover:bg-accent group-focus-visible:bg-accent grid size-8 place-items-center rounded-sm font-mono text-[0.6875rem] font-semibold tracking-[0.06em] transition-colors duration-200"
          >
            {shortName}
          </span>
          <span>{name}</span>
          <VisuallyHidden>home</VisuallyHidden>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <p className="text-label text-muted-foreground hidden font-mono tracking-[0.08em] uppercase lg:block">
            {settings?.availability ?? siteConfig.availability}
          </p>
          <nav aria-label="Primary navigation">
            <ul className="flex items-center gap-1">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="decoration-accent inline-flex min-h-11 items-center px-3 text-sm font-medium no-underline decoration-2 underline-offset-4 hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <MobileMenu items={siteConfig.navigation} />
      </Container>
    </header>
  );
}

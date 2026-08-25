import Link from "next/link";

import { Container } from "@/components/ui/container";
import { siteConfig } from "@/config/site";
import type { PublicSiteSettingsDto } from "@/server/dal/dto";

export function SiteFooter({
  settings,
}: {
  settings?: PublicSiteSettingsDto | null;
}) {
  const email = settings?.contactEmail ?? siteConfig.email;
  const name = settings?.siteName ?? siteConfig.name;
  return (
    <footer className="mt-auto py-6 md:py-8">
      <Container>
        <div className="border-border grid grid-cols-4 gap-x-4 gap-y-10 border-t pt-5 text-sm md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
          <div className="col-span-4 md:col-span-4 lg:col-span-5">
            <p className="text-subheading max-w-[18ch] leading-tight font-medium">
              {settings?.siteTitle ?? siteConfig.title}
            </p>
            <p className="text-muted-foreground mt-3 max-w-[38ch] text-sm">
              {settings?.siteDescription ?? siteConfig.description}
            </p>
            <a
              className="mt-5 inline-block underline underline-offset-4"
              href={`mailto:${email}`}
            >
              {email}
            </a>
          </div>
          <nav
            className="col-span-2 md:col-span-2 md:col-start-6 lg:col-start-8"
            aria-label="Footer navigation"
          >
            <ul className="space-y-1">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    className="inline-flex min-h-9 items-center no-underline hover:underline"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="text-muted-foreground col-span-2 text-right md:col-span-2 lg:col-span-3">
            <p>{siteConfig.location}</p>
            <p className="mt-2">
              © {new Date().getFullYear()} {name}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}

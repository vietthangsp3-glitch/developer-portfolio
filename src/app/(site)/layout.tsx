import { SmoothScroll } from "@/components/animation/smooth-scroll";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { getResolvedPublicSiteSettings } from "@/server/dal/public";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const settings = await getResolvedPublicSiteSettings();
  const name = settings.siteName;
  const description = settings.siteDescription;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name,
      url: siteConfig.url,
      email: settings.contactEmail,
      sameAs: settings.socialLinks.map((link) => link.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: settings.siteTitle,
      description,
      author: { "@id": `${siteConfig.url}/#person` },
    },
  ];
  return (
    <>
      <JsonLd value={jsonLd} />
      <div
        aria-hidden="true"
        className="site-background"
        data-site-background
      />
      <div className="site-foreground flex min-h-dvh flex-col">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <SmoothScroll />
        <SiteHeader settings={settings} />
        <div aria-hidden="true" className="h-header shrink-0" />
        {children}
        <SiteFooter settings={settings} />
      </div>
    </>
  );
}

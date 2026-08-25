import { describe, expect, it } from "vitest";

import { siteConfig } from "@/config/site";
import { createRootMetadata } from "@/config/seo";
import { resolvePublicSiteSettings } from "@/server/dal/mappers";

describe("public site settings", () => {
  it("propagates CMS identity, contact, availability, and SEO values", () => {
    const settings = resolvePublicSiteSettings({
      siteName: "CMS Name",
      siteTitle: "CMS title",
      siteDescription: "CMS description",
      availability: "Available in October",
      contactEmail: "cms@example.com",
      socialLinks: [{ label: "GitHub", url: "https://github.com/example" }],
      seoTitle: "CMS SEO title",
      seoDescription: "CMS SEO description",
    });

    expect(settings).toMatchObject({
      siteName: "CMS Name",
      contactEmail: "cms@example.com",
      availability: "Available in October",
      seoTitle: "CMS SEO title",
    });
  });

  it("uses the centralized static configuration when no row exists", () => {
    expect(resolvePublicSiteSettings(null)).toMatchObject({
      siteName: siteConfig.name,
      contactEmail: siteConfig.email,
      availability: siteConfig.availability,
      seoTitle: siteConfig.title,
    });
  });

  it("maps CMS settings into root metadata", () => {
    const settings = resolvePublicSiteSettings({
      siteName: "CMS Name",
      siteTitle: "CMS title",
      siteDescription: "CMS description",
      availability: "Available",
      contactEmail: "cms@example.com",
      socialLinks: [],
      seoTitle: "CMS SEO title",
      seoDescription: "CMS SEO description",
    });
    const metadata = createRootMetadata(settings, false);

    expect(metadata.title).toEqual({
      default: "CMS SEO title",
      template: "%s — CMS Name",
    });
    expect(metadata.description).toBe("CMS SEO description");
    expect(metadata.openGraph).toMatchObject({
      siteName: "CMS Name",
      title: "CMS SEO title",
    });
  });
});

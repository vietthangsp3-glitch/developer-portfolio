import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/dal/public", () => ({
  getResolvedPublicSiteSettings: vi.fn(async () => ({
    siteName: "CMS Name",
    siteTitle: "CMS title",
    siteDescription: "CMS description",
    availability: "Available in October",
    contactEmail: "cms@example.com",
    socialLinks: [],
    seoTitle: "CMS SEO title",
    seoDescription: "CMS SEO description",
  })),
}));

import ContactPage from "@/app/(site)/contact/page";
import { SiteFooter } from "@/components/layout/site-footer";

describe("site settings public surfaces", () => {
  it("renders CMS contact and availability values on Contact", async () => {
    render(await ContactPage());

    expect(
      screen.getByRole("link", { name: "cms@example.com" }),
    ).toHaveAttribute("href", "mailto:cms@example.com");
    expect(screen.getByText(/Available in October/)).toBeVisible();
  });

  it("renders CMS title and description in the public footer", () => {
    render(
      <SiteFooter
        settings={{
          siteName: "CMS Name",
          siteTitle: "CMS title",
          siteDescription: "CMS description",
          availability: "Available in October",
          contactEmail: "cms@example.com",
          socialLinks: [],
          seoTitle: "CMS SEO title",
          seoDescription: "CMS SEO description",
        }}
      />,
    );

    expect(screen.getByText("CMS title")).toBeVisible();
    expect(screen.getByText("CMS description")).toBeVisible();
  });
});

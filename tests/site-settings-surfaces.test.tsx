import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/layout/site-footer";
import { HomeContactDetails } from "@/features/home/components/home-page";

describe("site settings public surfaces", () => {
  it("renders CMS contact and availability values on the homepage", () => {
    render(
      <HomeContactDetails
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

import { describe, expect, it } from "vitest";

import { isProductionIndexingEnabled } from "@/config/seo";

describe("SEO deployment policy", () => {
  it("indexes only an explicit HTTPS Vercel production deployment", () => {
    expect(
      isProductionIndexingEnabled({
        nodeEnv: "production",
        vercelEnv: "production",
        siteUrl: "https://portfolio.example.com",
      }),
    ).toBe(true);
    expect(
      isProductionIndexingEnabled({
        nodeEnv: "production",
        vercelEnv: "preview",
        siteUrl: "https://preview.example.com",
      }),
    ).toBe(false);
    expect(
      isProductionIndexingEnabled({
        nodeEnv: "production",
        vercelEnv: "production",
        siteUrl: "http://localhost:3000",
      }),
    ).toBe(false);
  });
});

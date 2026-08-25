import { describe, expect, it } from "vitest";

import { auditMetadataSchema } from "@/features/audit/schemas/audit";
import { inquiryInputSchema } from "@/features/inquiries/schemas/inquiry";
import { mediaInputSchema } from "@/features/media/schemas/media";
import { projects } from "@/features/projects/data/projects";
import {
  caseStudyContentSchema,
  projectInputSchema,
} from "@/features/projects/schemas/project";
import { serviceInputSchema } from "@/features/services/schemas/service";
import { testimonialInputSchema } from "@/features/testimonials/schemas/testimonial";
import { migrationEnvSchema, serverEnvSchema } from "@/config/env.schema";
import { productionEnvironmentSchema } from "@/config/production";
import { safeHttpUrlSchema } from "@/lib/validation";
import { projectAdminInputSchema, slugify } from "@/features/admin/schemas/cms";
import {
  createCloudinarySignature,
  getMediaReferenceTotal,
} from "@/server/media/cloudinary";
import { shouldAttemptRateLimitCleanup } from "@/server/rate-limit";

const validProject = {
  title: "A valid project",
  slug: "a-valid-project",
  summary: "A concise project summary.",
  category: "Editorial",
  role: "Design / Development",
  year: 2026,
  status: "published" as const,
  sortOrder: 0,
  caseStudyContent: { version: 1 as const, blocks: [] },
  publishedAt: new Date("2026-01-01T00:00:00.000Z"),
};

describe("backend boundary validation", () => {
  it("accepts current structured case-study fixtures without arbitrary HTML", () => {
    for (const project of projects) {
      expect(
        caseStudyContentSchema.parse({ version: 1, blocks: project.blocks }),
      ).toEqual({ version: 1, blocks: project.blocks });
    }

    expect(
      caseStudyContentSchema.safeParse({
        version: 1,
        blocks: [{ type: "html", value: "<script>alert(1)</script>" }],
      }).success,
    ).toBe(false);
  });

  it("requires publication dates and rejects unsafe public URLs", () => {
    expect(projectInputSchema.safeParse(validProject).success).toBe(true);
    expect(
      projectInputSchema.safeParse({ ...validProject, publishedAt: null })
        .success,
    ).toBe(false);
    expect(
      projectInputSchema.safeParse({
        ...validProject,
        liveUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);

    expect(
      safeHttpUrlSchema.safeParse("https://example.com/work").success,
    ).toBe(true);
    expect(
      safeHttpUrlSchema.safeParse("http://localhost:3000/work").success,
    ).toBe(true);
    expect(safeHttpUrlSchema.safeParse("http://example.com/work").success).toBe(
      false,
    );
  });

  it("normalizes inquiries and bounds all content inputs", () => {
    const inquiry = inquiryInputSchema.parse({
      name: "  Ada Lovelace  ",
      email: "  ADA@EXAMPLE.COM ",
      projectType: "Portfolio",
      message: "A clear project brief.",
    });

    expect(inquiry.name).toBe("Ada Lovelace");
    expect(inquiry.email).toBe("ada@example.com");
    expect(inquiry.source).toBe("website");

    expect(
      serviceInputSchema.safeParse({
        title: "Development",
        slug: "development",
        summary: "Production engineering.",
        description: "A complete delivery service.",
        sortOrder: -1,
        published: true,
      }).success,
    ).toBe(false);

    expect(
      testimonialInputSchema.safeParse({
        personName: "Client",
        role: "Founder",
        company: "Company",
        quote: "A useful quote.",
        published: false,
        sortOrder: 0,
      }).success,
    ).toBe(true);

    expect(
      mediaInputSchema.safeParse({
        provider: "local",
        providerKey: "asset-1",
        url: "/images/asset.webp",
        width: 0,
        height: 100,
        format: "webp",
        altText: "An asset",
      }).success,
    ).toBe(false);
  });

  it("rejects sensitive audit metadata keys", () => {
    expect(
      auditMetadataSchema.safeParse({ changedFields: ["title"] }).success,
    ).toBe(true);
    expect(auditMetadataSchema.safeParse({ authToken: "secret" }).success).toBe(
      false,
    );
    expect(
      auditMetadataSchema.safeParse({ inquiryMessage: "private body" }).success,
    ).toBe(false);
  });

  it("schedules rate-limit cleanup only after its controlled interval", () => {
    const now = new Date("2026-08-25T00:00:00.000Z");
    expect(shouldAttemptRateLimitCleanup(now, now.getTime() - 1)).toBe(true);
    expect(shouldAttemptRateLimitCleanup(now, now.getTime() + 1)).toBe(false);
  });

  it("validates runtime and migration database environment shapes", () => {
    const pooled = "postgresql://user:password@example.neon.tech/portfolio";
    const direct = "postgresql://user:password@example.neon.tech/portfolio";

    const validServerEnv = {
      DATABASE_URL: pooled,
      BETTER_AUTH_URL: "http://localhost:3000",
      BETTER_AUTH_SECRET: "a".repeat(32),
      RATE_LIMIT_HMAC_SECRET: "b".repeat(32),
    };

    expect(serverEnvSchema.safeParse(validServerEnv).success).toBe(true);
    expect(serverEnvSchema.safeParse({}).success).toBe(false);
    expect(
      migrationEnvSchema.safeParse({ DATABASE_URL_UNPOOLED: direct }).success,
    ).toBe(true);
    expect(
      serverEnvSchema.safeParse({
        ...validServerEnv,
        DATABASE_URL: "https://example.com",
      }).success,
    ).toBe(false);
    expect(
      serverEnvSchema.safeParse({
        ...validServerEnv,
        BETTER_AUTH_SECRET: "too-short",
      }).success,
    ).toBe(false);
    expect(
      serverEnvSchema.safeParse({
        ...validServerEnv,
        CLOUDINARY_CLOUD_NAME: "portfolio",
      }).success,
    ).toBe(false);
    expect(
      serverEnvSchema.safeParse({
        ...validServerEnv,
        CLOUDINARY_CLOUD_NAME: "portfolio",
        CLOUDINARY_API_KEY: "key",
        CLOUDINARY_API_SECRET: "secret",
      }).success,
    ).toBe(true);
    expect(
      serverEnvSchema.safeParse({
        ...validServerEnv,
        RESEND_API_KEY: "re_test",
      }).success,
    ).toBe(false);
    expect(
      serverEnvSchema.safeParse({
        ...validServerEnv,
        RESEND_API_KEY: "re_test",
        INQUIRY_NOTIFICATION_EMAIL: "owner@example.com",
        INQUIRY_FROM_EMAIL: "portfolio@example.com",
      }).success,
    ).toBe(true);
    expect(
      serverEnvSchema.safeParse({
        ...validServerEnv,
        RESEND_API_KEY: "",
        INQUIRY_NOTIFICATION_EMAIL: "",
        INQUIRY_FROM_EMAIL: "",
      }).success,
    ).toBe(true);
  });

  it("requires aligned, complete production services without reusing secrets", () => {
    const production = {
      NEXT_PUBLIC_SITE_URL: "https://portfolio.example.com",
      VERCEL_ENV: "production" as const,
      DATABASE_URL:
        "postgresql://owner:password@ep-portfolio-pooler.us-east-2.aws.neon.tech/neondb",
      DATABASE_URL_UNPOOLED:
        "postgresql://owner:password@ep-portfolio.us-east-2.aws.neon.tech/neondb",
      BETTER_AUTH_URL: "https://portfolio.example.com",
      BETTER_AUTH_SECRET: "a".repeat(32),
      RATE_LIMIT_HMAC_SECRET: "b".repeat(32),
      CLOUDINARY_CLOUD_NAME: "portfolio",
      CLOUDINARY_API_KEY: "cloudinary-key",
      CLOUDINARY_API_SECRET: "cloudinary-secret",
      RESEND_API_KEY: "resend-key",
      INQUIRY_NOTIFICATION_EMAIL: "owner@example.com",
      INQUIRY_FROM_EMAIL: "portfolio@example.com",
    };

    expect(productionEnvironmentSchema.safeParse(production).success).toBe(
      true,
    );
    expect(
      productionEnvironmentSchema.safeParse({
        ...production,
        RESEND_API_KEY: undefined,
        INQUIRY_NOTIFICATION_EMAIL: undefined,
        INQUIRY_FROM_EMAIL: undefined,
      }).success,
    ).toBe(true);
    expect(
      productionEnvironmentSchema.safeParse({
        ...production,
        INQUIRY_FROM_EMAIL: undefined,
      }).success,
    ).toBe(false);
    expect(
      productionEnvironmentSchema.safeParse({
        ...production,
        VERCEL_ENV: "preview",
      }).success,
    ).toBe(false);
    expect(
      productionEnvironmentSchema.safeParse({
        ...production,
        BETTER_AUTH_URL: "https://preview.example.com",
      }).success,
    ).toBe(false);
    expect(
      productionEnvironmentSchema.safeParse({
        ...production,
        RATE_LIMIT_HMAC_SECRET: production.BETTER_AUTH_SECRET,
      }).success,
    ).toBe(false);
  });

  it("validates CMS publication, slug generation, and media boundaries", () => {
    const base = {
      title: "Northline Build",
      slug: "northline-build",
      subtitle: "",
      summary: "A valid summary.",
      description: "",
      category: "Architecture",
      role: "Design / Development",
      year: 2026,
      status: "published" as const,
      featured: false,
      featuredRank: 0,
      sortOrder: 0,
      thumbnailMediaId: "",
      heroMediaId: "",
      liveUrl: null,
      repositoryUrl: null,
      seoTitle: "",
      seoDescription: "",
      technologies: ["Next.js"],
      mediaRelations: [],
      caseStudyContent: { version: 1 as const, blocks: [] },
    };
    expect(projectAdminInputSchema.safeParse(base).success).toBe(false);
    expect(
      projectAdminInputSchema.safeParse({ ...base, status: "draft" }).success,
    ).toBe(true);
    expect(slugify("  Café & Product System  ")).toBe("cafe-product-system");
    expect(
      getMediaReferenceTotal({
        projectMedia: 1,
        thumbnail: 1,
        hero: 0,
        testimonial: 0,
      }),
    ).toBe(2);
    expect(
      createCloudinarySignature(
        { timestamp: 123, folder: "portfolio/projects" },
        "secret",
      ),
    ).toBe(
      createCloudinarySignature(
        { folder: "portfolio/projects", timestamp: 123 },
        "secret",
      ),
    );
  });
});

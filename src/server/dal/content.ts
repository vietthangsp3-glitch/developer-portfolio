import "server-only";

import { asc, and, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { getDatabase } from "@/server/db";
import { runDatabaseOperation } from "@/server/db/errors";
import {
  mediaAssets,
  services,
  siteSettings,
  testimonials,
} from "@/server/db/schema";
import type {
  PublicServiceDto,
  PublicSiteSettingsDto,
  PublicTestimonialDto,
} from "@/server/dal/dto";
import {
  toPublicMediaDto,
  toPublicSiteSettingsDto,
} from "@/server/dal/mappers";

const avatarMedia = alias(mediaAssets, "testimonial_avatar_media");

export async function getPublishedServices(): Promise<PublicServiceDto[]> {
  return runDatabaseOperation("getPublishedServices", async () =>
    getDatabase()
      .select({
        slug: services.slug,
        title: services.title,
        summary: services.summary,
        description: services.description,
      })
      .from(services)
      .where(eq(services.published, true))
      .orderBy(asc(services.sortOrder)),
  );
}

export async function getPublishedTestimonials(): Promise<
  PublicTestimonialDto[]
> {
  return runDatabaseOperation("getPublishedTestimonials", async () => {
    const rows = await getDatabase()
      .select({
        personName: testimonials.personName,
        role: testimonials.role,
        company: testimonials.company,
        quote: testimonials.quote,
        avatar: {
          url: avatarMedia.url,
          width: avatarMedia.width,
          height: avatarMedia.height,
          format: avatarMedia.format,
          altText: avatarMedia.altText,
        },
      })
      .from(testimonials)
      .leftJoin(avatarMedia, eq(testimonials.avatarMediaId, avatarMedia.id))
      .where(
        and(eq(testimonials.published, true), eq(testimonials.isDemo, false)),
      )
      .orderBy(asc(testimonials.sortOrder));

    return rows.map((row) => ({
      personName: row.personName,
      role: row.role,
      company: row.company,
      quote: row.quote,
      avatar: toPublicMediaDto(row.avatar),
    }));
  });
}

export async function getPublicSiteSettings(): Promise<PublicSiteSettingsDto | null> {
  return runDatabaseOperation("getPublicSiteSettings", async () => {
    const [row] = await getDatabase()
      .select({
        siteName: siteSettings.siteName,
        siteTitle: siteSettings.siteTitle,
        siteDescription: siteSettings.siteDescription,
        availability: siteSettings.availability,
        contactEmail: siteSettings.contactEmail,
        socialLinks: siteSettings.socialLinks,
        seoTitle: siteSettings.seoTitle,
        seoDescription: siteSettings.seoDescription,
      })
      .from(siteSettings)
      .where(eq(siteSettings.settingsKey, "default"))
      .limit(1);

    return row ? toPublicSiteSettingsDto(row) : null;
  });
}

import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import type { PublicSiteSettingsDto } from "@/server/dal/dto";

const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isProductionIndexingEnabled(
  input = {
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    siteUrl: siteConfig.url,
  },
) {
  try {
    const url = new URL(input.siteUrl);
    return (
      input.nodeEnv === "production" &&
      input.vercelEnv === "production" &&
      url.protocol === "https:" &&
      !localHosts.has(url.hostname)
    );
  } catch {
    return false;
  }
}

export const defaultSocialImage = {
  url: "/images/projects/northline-build.webp",
  width: 1536,
  height: 1024,
  alt: `${siteConfig.name} portfolio preview`,
};

export function createRootMetadata(
  settings: PublicSiteSettingsDto,
  allowIndexing: boolean,
): Metadata {
  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: settings.seoTitle,
      template: `%s — ${settings.siteName}`,
    },
    description: settings.seoDescription,
    applicationName: settings.siteName,
    alternates: { canonical: "/" },
    manifest: "/manifest.webmanifest",
    robots: {
      index: allowIndexing,
      follow: allowIndexing,
      googleBot: {
        index: allowIndexing,
        follow: allowIndexing,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: settings.siteName,
      title: settings.seoTitle,
      description: settings.seoDescription,
      url: siteConfig.url,
      images: [defaultSocialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seoTitle,
      description: settings.seoDescription,
      images: [defaultSocialImage],
    },
  };
}

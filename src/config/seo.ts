import { siteConfig } from "@/config/site";

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

import type { Metadata } from "next";

import { geistMono, geistSans } from "@/config/fonts";
import { createRootMetadata, isProductionIndexingEnabled } from "@/config/seo";
import { getResolvedPublicSiteSettings } from "@/server/dal/public";

import "./globals.css";

const allowIndexing = isProductionIndexingEnabled();

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getResolvedPublicSiteSettings();
  return createRootMetadata(settings, allowIndexing);
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}

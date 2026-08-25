"use client";

import { geistMono, geistSans } from "@/config/fonts";

import "./globals.css";

export default function GlobalError({ retry }: { retry: () => void }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <title>Something went wrong</title>
        <main className="px-page-gutter py-section flex min-h-dvh items-center">
          <div className="max-w-reading border-border mx-auto w-full border-t pt-5">
            <p className="text-label text-accent font-mono uppercase">
              Site error
            </p>
            <h1 className="text-heading mt-6 font-medium text-balance">
              The site could not finish loading.
            </h1>
            <p className="text-lead text-muted-foreground mt-6 max-w-[52ch]">
              Please try again. No action was completed while this page was
              unavailable.
            </p>
            <button
              className="bg-foreground text-background hover:bg-accent focus-visible:bg-accent mt-8 inline-flex min-h-11 items-center justify-center rounded-sm px-5 py-3 text-sm font-medium transition-colors duration-200"
              type="button"
              onClick={retry}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

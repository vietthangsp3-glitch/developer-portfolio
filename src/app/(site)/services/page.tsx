import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";
import { getCachedPublishedServices } from "@/server/dal/public";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Strategy, interface design, development, and launch support for ambitious digital work.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getCachedPublishedServices();
  return (
    <main id="main-content" tabIndex={-1}>
      <PageIntro
        label="Services / Scope"
        title="From direction to delivery."
        description="Focused engagements that connect the strategic question, the visual system, and the final implementation."
      />
      <section className="pb-section">
        <Container>
          <ol>
            {services.map((service, index) => (
              <li
                key={service.slug}
                className="border-border grid grid-cols-4 gap-x-4 gap-y-7 border-t py-8 md:grid-cols-8 md:gap-x-6 md:py-12 lg:grid-cols-12"
              >
                <span className="text-label text-accent col-span-1 font-mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="col-span-3 md:col-span-3 lg:col-span-4">
                  <h2 className="text-subheading font-medium">
                    {service.title}
                  </h2>
                  <p className="text-muted-foreground mt-4 max-w-[35ch]">
                    {service.summary}
                  </p>
                </div>
                <ul className="col-span-3 col-start-2 md:col-span-3 md:col-start-6 lg:col-span-3 lg:col-start-9">
                  {service.description
                    .split("\n")
                    .filter(Boolean)
                    .map((item) => (
                      <li
                        key={item}
                        className="border-border border-b py-2 text-sm first:border-t"
                      >
                        {item}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ol>
          <div className="mt-section-compact flex justify-end">
            <TextLink href="/contact">Share your brief</TextLink>
          </div>
        </Container>
      </section>
    </main>
  );
}

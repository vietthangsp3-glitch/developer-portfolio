import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { SectionLabel } from "@/components/ui/section-label";
import { TextLink } from "@/components/ui/text-link";

export const metadata: Metadata = {
  title: "About",
  description:
    "An independent design and development practice for thoughtful digital work.",
  alternates: { canonical: "/about" },
};

const principles = [
  [
    "Clarity before novelty",
    "A strong idea, clear information, and a useful path matter more than surface effects.",
  ],
  [
    "Design through engineering",
    "Performance, accessibility, and maintainability are design materials—not a final checklist.",
  ],
  [
    "Direct collaboration",
    "The person shaping the direction is the same person working through the implementation details.",
  ],
] as const;

export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <PageIntro
        label="About / Practice"
        title="Close to the work."
        description="I am Thang Nguyen, an independent developer working across interface design and engineering for clients who care about how their digital work feels and performs."
      />
      <section className="pb-section">
        <Container>
          <div className="grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
            <SectionLabel className="col-span-4 md:col-span-2 lg:col-span-3">
              Approach / 01
            </SectionLabel>
            <div className="col-span-4 md:col-span-6 lg:col-span-7">
              <h2 className="text-heading max-w-[14ch] font-medium">
                A small practice with a broad field of view.
              </h2>
              <div className="text-lead text-muted-foreground mt-8 max-w-[50ch] space-y-6">
                <p>
                  I move between content, typography, interaction, systems, and
                  code. That continuity helps good decisions survive the whole
                  process.
                </p>
                <p>
                  Projects are shaped around the problem rather than a fixed
                  production package. When specialist support is useful, I
                  collaborate with trusted writers, designers, and technologists
                  while remaining accountable for the whole.
                </p>
              </div>
            </div>
          </div>
          <ol className="mt-section-compact border-border border-b">
            {principles.map(([title, body], index) => (
              <li
                key={title}
                className="border-border grid grid-cols-4 gap-x-4 gap-y-4 border-t py-6 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
              >
                <span className="text-label text-accent col-span-1 font-mono">
                  0{index + 1}
                </span>
                <h3 className="text-subheading col-span-3 font-medium md:col-span-3 lg:col-span-4">
                  {title}
                </h3>
                <p className="text-muted-foreground col-span-3 col-start-2 max-w-[45ch] md:col-span-4 md:col-start-5 lg:col-span-5 lg:col-start-8">
                  {body}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-section-compact flex justify-end">
            <TextLink href="/contact">Discuss a project</TextLink>
          </div>
        </Container>
      </section>
    </main>
  );
}

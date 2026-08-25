import Image from "next/image";

import { FeaturedCaseStudyMotion } from "@/components/animation/featured-case-study-motion";
import { HeroReveal } from "@/components/animation/hero-reveal";
import { Reveal } from "@/components/animation/reveal";
import { ScrambleText } from "@/components/animation/scramble-text";
import { SelectedWorkMotion } from "@/components/animation/selected-work-motion";
import { Container } from "@/components/ui/container";
import { SectionLabel } from "@/components/ui/section-label";
import { TextLink } from "@/components/ui/text-link";
import { siteConfig } from "@/config/site";
import {
  capabilities,
  technologyGroups,
} from "@/features/content/data/site-content";
import { ProjectIndex } from "@/features/projects/components/project-index";
import type { Project } from "@/features/projects/types";
import type {
  PublicSiteSettingsDto,
  PublicTestimonialDto,
} from "@/server/dal/dto";

export function HomePage({
  projects,
  featuredProject,
  testimonials,
  settings,
}: {
  projects: Project[];
  featuredProject?: Project;
  testimonials: PublicTestimonialDto[];
  settings?: PublicSiteSettingsDto | null;
}) {
  const featured = featuredProject ?? projects[0];
  const nameWords = (settings?.siteName ?? siteConfig.name).trim().split(/\s+/);

  return (
    <>
      <HeroReveal>
        <section
          aria-labelledby="hero-title"
          className="border-border flex min-h-[calc(100svh-var(--header-height))] border-b"
        >
          <Container className="flex">
            <div className="flex w-full flex-col justify-between py-[clamp(2rem,5vw,4.5rem)]">
              <h1
                id="hero-title"
                aria-label={settings?.siteName ?? siteConfig.name}
                className="text-hero-name font-semibold uppercase"
              >
                {nameWords.map((word) => (
                  <span className="block overflow-hidden" key={word}>
                    <span className="block" data-hero-line>
                      <ScrambleText text={word} />
                    </span>
                  </span>
                ))}
              </h1>

              <div className="border-border mt-[clamp(3rem,7vw,7rem)] grid grid-cols-4 gap-x-4 gap-y-7 border-t pt-4 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
                <p
                  className="text-label text-accent col-span-4 font-mono uppercase md:col-span-3 lg:col-span-3"
                  data-hero-meta
                >
                  Independent developer / Design &amp; engineering
                </p>
                <p
                  className="text-muted-foreground col-span-4 max-w-[43ch] leading-7 md:col-span-5 lg:col-span-4 lg:col-start-5"
                  data-hero-support
                >
                  I design and build precise websites and digital products for
                  teams whose work deserves a stronger presence.
                </p>
                <a
                  className="group col-span-4 flex min-h-11 items-start justify-between gap-6 self-start font-mono text-sm font-medium uppercase no-underline md:col-span-5 md:col-start-4 lg:col-span-3 lg:col-start-10"
                  data-hero-support
                  href="#selected-work"
                >
                  <span>Selected work</span>
                  <span
                    aria-hidden="true"
                    className="text-accent transition-transform duration-200 group-hover:translate-y-1 group-focus-visible:translate-y-1"
                  >
                    ↓ Scroll
                  </span>
                </a>
              </div>
            </div>
          </Container>
        </section>
      </HeroReveal>

      <SelectedWorkMotion>
        <section
          aria-labelledby="selected-work-title"
          className="py-section-wide border-border border-b"
          id="selected-work"
        >
          <Container>
            <div className="mb-12 grid grid-cols-4 gap-x-4 md:mb-20 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
              <SectionLabel className="col-span-2 lg:col-span-3">
                Selected work / 01
              </SectionLabel>
              <h2
                id="selected-work-title"
                className="text-heading col-span-4 col-start-1 mt-8 font-medium md:col-span-6 md:col-start-3 md:mt-0 lg:col-span-7 lg:col-start-5"
              >
                A selection of focused digital systems.
              </h2>
            </div>
            <ProjectIndex
              items={projects.slice(0, 4)}
              headingLevel="h3"
              variant="technical"
            />
            <div className="mt-12 flex justify-end md:mt-20">
              <TextLink
                className="decoration-border hover:decoration-foreground"
                href="/work"
              >
                Explore all projects
              </TextLink>
            </div>
          </Container>
        </section>
      </SelectedWorkMotion>

      <section
        aria-labelledby="capabilities-title"
        className="bg-surface py-section-tight"
      >
        <Container>
          <div className="grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
            <SectionLabel className="col-span-4 md:col-span-2 lg:col-span-3">
              Capabilities / 02
            </SectionLabel>
            <h2
              id="capabilities-title"
              className="text-heading col-span-4 max-w-[14ch] font-medium md:col-span-6 lg:col-span-7"
            >
              Direction, design, and engineering in one close loop.
            </h2>
          </div>
          <ol className="mt-16 md:mt-24">
            {capabilities.map((item, index) => (
              <li
                key={item.title}
                className="border-border grid grid-cols-4 gap-x-4 gap-y-4 border-t py-6 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
              >
                <span className="text-label text-muted-foreground col-span-1 font-mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="text-subheading col-span-3 font-medium md:col-span-3 lg:col-span-4">
                  {item.title}
                </h3>
                <p className="text-muted-foreground col-span-3 col-start-2 max-w-[48ch] md:col-span-4 md:col-start-5 lg:col-span-5 lg:col-start-8">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {featured ? (
        <FeaturedCaseStudyMotion>
          <section
            aria-labelledby="featured-title"
            className="bg-surface-strong py-section-wide"
            data-featured-case-study
          >
            <Container>
              <div
                className="grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
                data-featured-intro
              >
                <SectionLabel className="col-span-4 md:col-span-2 lg:col-span-3">
                  Featured case study / 03
                </SectionLabel>
                <div className="col-span-4 md:col-span-6 lg:col-span-8 lg:col-start-5">
                  <h2
                    id="featured-title"
                    className="text-heading max-w-[12ch] font-medium"
                  >
                    {featured.title}
                  </h2>
                  <p className="text-lead text-muted-foreground mt-6 max-w-[42ch]">
                    {featured.outcome}
                  </p>
                </div>
              </div>
              <div
                className="bg-muted relative mt-12 aspect-[4/3] overflow-hidden md:mt-20 md:aspect-[16/9] lg:aspect-[12/5]"
                data-featured-media
              >
                <Image
                  src={featured.image.src}
                  alt={featured.image.alt}
                  fill
                  sizes="(min-width: 1440px) 1440px, (min-width: 768px) calc(100vw - 6vw), 100vw"
                  className="object-cover object-center lg:object-[center_62%]"
                />
              </div>
              <div
                className="border-border grid grid-cols-4 gap-x-4 gap-y-5 border-b py-5 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
                data-featured-meta
              >
                <p className="text-label text-muted-foreground col-span-2 font-mono uppercase lg:col-span-3">
                  {featured.sector} / {featured.year}
                </p>
                <p className="text-label text-muted-foreground col-span-2 text-right font-mono uppercase md:col-span-3 md:col-start-6 lg:col-span-4 lg:col-start-5 lg:text-left">
                  {featured.services.join(" / ")}
                </p>
                <div className="col-span-4 flex justify-end md:col-span-8 lg:col-span-3 lg:col-start-10">
                  <TextLink href={`/work/${featured.slug}`}>
                    Read the case study
                  </TextLink>
                </div>
              </div>
            </Container>
          </section>
        </FeaturedCaseStudyMotion>
      ) : null}

      <section
        aria-labelledby="about-preview-title"
        className="bg-surface py-section-wide"
      >
        <Container>
          <div className="grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
            <SectionLabel className="col-span-4 md:col-span-2 lg:col-span-3">
              About / 04
            </SectionLabel>
            <div className="col-span-4 md:col-span-6 lg:col-span-7 lg:col-start-5">
              <h2
                id="about-preview-title"
                className="text-heading max-w-[15ch] font-medium"
              >
                One partner from first question to final detail.
              </h2>
              <p className="text-lead text-muted-foreground mt-8 max-w-[50ch]">
                I work across design and engineering because the strongest
                digital work depends on both. The process stays direct,
                collaborative, and grounded in what the project actually needs.
              </p>
              <TextLink className="mt-8" href="/about">
                More about the practice
              </TextLink>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="technology-title" className="py-section-tight">
        <Container>
          <div className="grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
            <SectionLabel className="col-span-4 md:col-span-2 lg:col-span-3">
              Technology / 05
            </SectionLabel>
            <div className="col-span-4 md:col-span-6 lg:col-span-8">
              <h2
                id="technology-title"
                className="text-heading max-w-[13ch] font-medium"
              >
                The right tools, kept in their place.
              </h2>
              <div className="mt-12 grid gap-8 md:grid-cols-3">
                {technologyGroups.map((group) => (
                  <div
                    key={group.label}
                    className="border-border border-t pt-3"
                  >
                    <h3 className="text-label text-accent font-mono uppercase">
                      {group.label}
                    </h3>
                    <ul className="mt-5 space-y-2">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section
        aria-labelledby="testimonials-title"
        className="py-section border-border border-y"
      >
        <Container>
          <div className="grid grid-cols-4 gap-x-4 gap-y-12 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
            <SectionLabel className="col-span-4 md:col-span-2 lg:col-span-3">
              Perspective / 06
            </SectionLabel>
            <div className="col-span-4 md:col-span-6 lg:col-span-9">
              <h2
                id="testimonials-title"
                className="text-heading max-w-[12ch] font-medium"
              >
                Good work starts with trust.
              </h2>
              {testimonials.length ? (
                <div className="mt-14 grid gap-12 lg:grid-cols-2">
                  {testimonials.map((item) => (
                    <figure
                      key={`${item.personName}-${item.company}`}
                      className="border-border border-t pt-5"
                    >
                      <blockquote className="text-subheading max-w-[28ch] font-medium">
                        “{item.quote}”
                      </blockquote>
                      <figcaption className="text-muted-foreground mt-8 text-sm">
                        <span className="text-foreground block font-medium">
                          {item.personName}
                        </span>
                        {item.role} / {item.company}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground mt-8 max-w-[45ch]">
                  Client references are shared privately while verified public
                  testimonials are being prepared.
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      <Reveal>
        <section
          aria-labelledby="contact-title"
          className="border-accent pt-section-wide pb-section-compact border-t-2"
        >
          <Container>
            <div className="grid grid-cols-4 gap-x-4 gap-y-10 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
              <SectionLabel className="col-span-4 md:col-span-2 lg:col-span-3">
                Contact / 07
              </SectionLabel>
              <div className="col-span-4 md:col-span-6 lg:col-span-8 lg:col-start-5">
                <h2
                  id="contact-title"
                  className="text-page-title max-w-[10ch] font-medium text-balance"
                >
                  Have something worth making?
                </h2>
                <p className="text-lead text-muted-foreground mt-8 max-w-[45ch]">
                  Tell me what you are building, what needs to change, and where
                  you want the work to go.
                </p>
                <div className="mt-8 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-8">
                  <TextLink href="/contact">Start a project</TextLink>
                  <a
                    className="text-muted-foreground inline-flex min-h-11 items-center text-sm underline underline-offset-4"
                    href={`mailto:${settings?.contactEmail ?? siteConfig.email}`}
                  >
                    {settings?.contactEmail ?? siteConfig.email}
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>
      </Reveal>
    </>
  );
}

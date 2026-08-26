import { HeroReveal } from "@/components/animation/hero-reveal";
import { Reveal } from "@/components/animation/reveal";
import { ScrambleText } from "@/components/animation/scramble-text";
import { SelectedWorkMotion } from "@/components/animation/selected-work-motion";
import { Container } from "@/components/ui/container";
import { SectionDivider } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { TextLink } from "@/components/ui/text-link";
import { siteConfig } from "@/config/site";
import { technologyGroups } from "@/features/content/data/site-content";
import { ContactForm } from "@/features/inquiries/components/contact-form";
import { ProjectIndex } from "@/features/projects/components/project-index";
import type { Project } from "@/features/projects/types";
import type { PublicServiceDto, PublicSiteSettingsDto } from "@/server/dal/dto";

type HomePageProps = {
  selectedProjects: Project[];
  services: PublicServiceDto[];
  settings?: PublicSiteSettingsDto | null;
};

export function HomeContactDetails({
  settings,
}: {
  settings?: PublicSiteSettingsDto | null;
}) {
  const contactEmail = settings?.contactEmail ?? siteConfig.email;

  return (
    <aside className="col-span-4 md:col-span-2 lg:col-span-3">
      <p className="text-label text-muted-foreground font-mono uppercase">
        Direct contact
      </p>
      <a
        className="mt-4 inline-block break-all underline underline-offset-4"
        href={`mailto:${contactEmail}`}
      >
        {contactEmail}
      </a>
      <p className="text-muted-foreground mt-5 max-w-[24ch] text-sm">
        {settings?.availability ?? siteConfig.availability}. Replies are
        typically considered within two working days.
      </p>
    </aside>
  );
}

export function HomePage({
  selectedProjects,
  services,
  settings,
}: HomePageProps) {
  const nameWords = (settings?.siteName ?? siteConfig.name)
    .trim()
    .split(/\s+/)
    .map(
      (word) =>
        `${word.charAt(0).toLocaleUpperCase()}${word.slice(1).toLocaleLowerCase()}`,
    );
  const displayName = nameWords.join(" ");

  return (
    <>
      <HeroReveal>
        <section
          aria-labelledby="hero-title"
          className="border-border flex min-h-[calc(100svh-var(--header-height))] border-b"
        >
          <Container className="flex">
            <div className="flex w-full flex-col justify-between py-[clamp(2rem,5vw,4.5rem)]">
              <div>
                <p
                  className="text-hero-eyebrow text-label font-mono tracking-[0.14em] uppercase"
                  data-hero-meta
                >
                  Portfolio &ndash; 2026
                </p>
                <h1
                  id="hero-title"
                  aria-label={displayName}
                  className="text-hero-name mt-[clamp(1rem,2vw,1.75rem)] pl-[clamp(0.5rem,2vw,1.5rem)] font-[620]"
                >
                  {nameWords.map((word) => (
                    <span
                      className="-mb-[0.14em] block overflow-hidden pb-[0.14em]"
                      key={word}
                    >
                      <span className="block" data-hero-line>
                        <ScrambleText text={word} />
                      </span>
                    </span>
                  ))}
                </h1>
              </div>

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
                  href="#selected-projects"
                >
                  <span>Selected projects</span>
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

      <section
        id="about"
        aria-labelledby="about-title"
        className="home-anchor py-home-section"
      >
        <Container>
          <SectionDivider />
          <SectionHeader
            index="01"
            label="About"
            title="One partner from first question to final detail."
            titleClassName="max-w-[15ch]"
            titleId="about-title"
          />
          <div className="ml-home-copy-indent max-w-[50ch]">
            <p className="text-home-lead text-muted-foreground">
              I work across design and engineering because the strongest digital
              work depends on both. The process stays direct, collaborative, and
              grounded in what the project actually needs.
            </p>
            <TextLink className="mt-8" href="#contact">
              Discuss a project
            </TextLink>
          </div>
        </Container>
      </section>

      <SelectedWorkMotion>
        <section
          aria-labelledby="selected-projects-title"
          className="home-anchor py-home-section"
          id="selected-projects"
        >
          <Container>
            <SectionDivider />
            <SectionHeader
              index="02"
              label="Selected projects"
              title="A selection of focused digital systems."
              titleClassName="max-w-[14ch]"
              titleId="selected-projects-title"
            />
            <ProjectIndex
              items={selectedProjects}
              headingLevel="h3"
              variant="technical"
            />
            <div className="mt-12 flex justify-end md:mt-20">
              <TextLink
                className="decoration-border hover:decoration-foreground"
                href="/projects"
              >
                View all projects
              </TextLink>
            </div>
          </Container>
        </section>
      </SelectedWorkMotion>

      <section
        id="services"
        aria-labelledby="services-title"
        className="home-anchor py-home-section"
      >
        <Container>
          <SectionDivider />
          <SectionHeader
            index="03"
            label="Services"
            title="Direction, design, and engineering in one close loop."
            titleClassName="max-w-[14ch]"
            titleId="services-title"
          />
          <ol>
            {services.map((service, index) => (
              <li
                key={service.slug}
                className="border-border grid grid-cols-4 gap-x-4 gap-y-5 border-t py-7 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12"
              >
                <span className="text-label text-accent col-span-1 font-mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="col-span-3 md:col-span-3 lg:col-span-4">
                  <h3 className="text-subheading font-medium">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground mt-4 max-w-[38ch]">
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
        </Container>
      </section>

      <section aria-labelledby="technology-title" className="py-home-section">
        <Container>
          <SectionDivider />
          <SectionHeader
            index="04"
            label="Technology"
            title="The right tools, kept in their place."
            titleClassName="max-w-[13ch]"
            titleId="technology-title"
          />
          <div className="mx-auto grid w-full max-w-[72rem] gap-8 md:grid-cols-3">
            {technologyGroups.map((group) => (
              <div key={group.label} className="border-border border-t pt-3">
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
        </Container>
      </section>

      <Reveal>
        <section
          id="contact"
          aria-labelledby="contact-title"
          className="home-anchor py-home-section"
        >
          <Container>
            <SectionDivider />
            <SectionHeader
              index="05"
              label="Contact"
              title="Have something worth making?"
              titleClassName="max-w-[10ch]"
              titleId="contact-title"
            />
            <div className="ml-home-copy-indent max-w-[45ch]">
              <p className="text-home-lead text-muted-foreground">
                Tell me what you are building, what needs to change, and where
                you want the work to go.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-4 gap-x-4 gap-y-16 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
              <HomeContactDetails settings={settings} />
              <ContactForm />
            </div>
          </Container>
        </section>
      </Reveal>
    </>
  );
}

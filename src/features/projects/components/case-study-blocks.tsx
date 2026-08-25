import Image from "next/image";

import { Container } from "@/components/ui/container";
import type { CaseStudyBlock } from "@/features/projects/types";

export function CaseStudyBlocks({ blocks }: { blocks: CaseStudyBlock[] }) {
  return (
    <div>
      {blocks.map((block, index) => {
        if (block.type === "image") {
          return (
            <figure key={index} className="py-section-compact">
              <Container>
                <div className="bg-surface-strong relative aspect-[4/3] overflow-hidden md:aspect-[16/10] lg:aspect-[12/5]">
                  <Image
                    src={block.image.src}
                    alt={block.image.alt}
                    fill
                    sizes="(min-width: 1440px) 1440px, (min-width: 768px) calc(100vw - 6vw), 100vw"
                    className="object-cover"
                  />
                </div>
                {block.caption ? (
                  <figcaption className="text-label text-muted-foreground mt-3 font-mono uppercase">
                    {block.caption}
                  </figcaption>
                ) : null}
              </Container>
            </figure>
          );
        }

        if (block.type === "stats") {
          return (
            <section
              key={index}
              aria-label="Project outcomes"
              className="py-section-compact"
            >
              <Container className="grid grid-cols-1 gap-10 md:grid-cols-3">
                {block.items.map((item) => (
                  <div key={item.label} className="border-border border-t pt-3">
                    <p className="text-heading font-medium">{item.value}</p>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {item.label}
                    </p>
                  </div>
                ))}
              </Container>
            </section>
          );
        }

        if (block.type === "quote") {
          return (
            <figure key={index} className="py-section">
              <Container>
                <blockquote className="text-heading ml-auto max-w-[18ch] font-medium text-balance">
                  “{block.quote}”
                </blockquote>
                <figcaption className="text-label text-muted-foreground mt-6 ml-auto max-w-[60ch] font-mono uppercase">
                  — {block.attribution}
                </figcaption>
              </Container>
            </figure>
          );
        }

        if (block.type === "technical-summary") {
          return (
            <section key={index} className="py-section-compact">
              <Container>
                <div className="border-border grid grid-cols-4 gap-x-4 gap-y-8 border-t pt-4 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
                  <p className="text-label text-accent col-span-4 font-mono uppercase md:col-span-2 lg:col-span-3">
                    Technical summary
                  </p>
                  <div className="col-span-4 md:col-span-6 lg:col-span-5">
                    <h2 className="text-subheading font-medium">
                      {block.title}
                    </h2>
                    <p className="text-muted-foreground mt-5">{block.body}</p>
                  </div>
                  <ul className="col-span-4 md:col-span-6 md:col-start-3 lg:col-span-3 lg:col-start-10">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="border-border border-b py-3 text-sm first:border-t"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Container>
            </section>
          );
        }

        const narrativeLayout =
          block.eyebrow === "Solution"
            ? "lg:col-span-7 lg:col-start-4"
            : block.eyebrow === "Outcome"
              ? "lg:col-span-6 lg:col-start-6"
              : "lg:col-span-7 lg:col-start-5";

        return (
          <section key={index} className="py-section-compact">
            <Container>
              <div className="grid grid-cols-4 gap-x-4 gap-y-7 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
                <p className="text-label text-accent col-span-4 font-mono uppercase md:col-span-2 lg:col-span-3">
                  {block.eyebrow}
                </p>
                <div className={`col-span-4 md:col-span-6 ${narrativeLayout}`}>
                  <h2 className="text-heading max-w-[15ch] font-medium text-balance">
                    {block.title}
                  </h2>
                  <div className="text-lead text-muted-foreground mt-8 max-w-[48ch] space-y-5">
                    {block.body.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Container>
          </section>
        );
      })}
    </div>
  );
}

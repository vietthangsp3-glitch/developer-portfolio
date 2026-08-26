import { Container } from "@/components/ui/container";
import { SectionLabel } from "@/components/ui/section-label";

type PageIntroProps = {
  label: string;
  title: string;
  description: string;
};

export function PageIntro({ label, title, description }: PageIntroProps) {
  return (
    <header className="py-section-compact md:pb-section">
      <Container>
        <div className="border-border border-t pt-4">
          <SectionLabel>{label}</SectionLabel>
          <div className="mt-[clamp(2rem,4vw,3.5rem)]">
            <h1 className="text-page-title font-medium text-balance md:whitespace-nowrap">
              {title}
            </h1>
            <p className="text-lead text-muted-foreground mt-[clamp(1.25rem,2.5vw,2rem)] max-w-[52ch]">
              {description}
            </p>
          </div>
        </div>
      </Container>
    </header>
  );
}

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
        <div className="border-border grid grid-cols-4 gap-x-4 gap-y-10 border-t pt-4 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
          <SectionLabel className="col-span-4 md:col-span-2 lg:col-span-3">
            {label}
          </SectionLabel>
          <div className="col-span-4 md:col-span-6 lg:col-span-9">
            <h1 className="text-page-title max-w-[11ch] font-medium text-balance">
              {title}
            </h1>
            <p className="text-lead text-muted-foreground mt-8 max-w-[52ch] md:mt-12 md:ml-[16.666%]">
              {description}
            </p>
          </div>
        </div>
      </Container>
    </header>
  );
}

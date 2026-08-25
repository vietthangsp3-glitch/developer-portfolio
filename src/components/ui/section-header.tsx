import { SectionLabel } from "@/components/ui/section-label";

type SectionHeaderProps = {
  index: string;
  label: string;
  title: string;
  titleId: string;
  titleClassName?: string;
};

export function SectionHeader({
  index,
  label,
  title,
  titleId,
  titleClassName = "",
}: SectionHeaderProps) {
  return (
    <div className="mb-[clamp(3rem,6vw,5rem)]">
      <SectionLabel>
        ({index}) &mdash; {label}
      </SectionLabel>
      <h2
        id={titleId}
        className={`text-section-heading mt-[clamp(1.5rem,3vw,2.5rem)] max-w-[18ch] font-semibold text-balance ${titleClassName}`}
      >
        {title}
      </h2>
    </div>
  );
}

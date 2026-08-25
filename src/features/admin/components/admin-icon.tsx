import type { SVGProps } from "react";

export type AdminIconName =
  | "dashboard"
  | "projects"
  | "services"
  | "testimonials"
  | "inquiries"
  | "media"
  | "settings"
  | "check"
  | "plus"
  | "external"
  | "database";

export function AdminIcon({
  name,
  className = "size-4",
}: {
  name: AdminIconName;
  className?: string;
}) {
  const commonProps: SVGProps<SVGSVGElement> = {
    "aria-hidden": true,
    className,
    fill: "none",
    viewBox: "0 0 24 24",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  const paths = {
    dashboard: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    projects: (
      <>
        <path d="M4 7.5h16v11.25A2.25 2.25 0 0 1 17.75 21H6.25A2.25 2.25 0 0 1 4 18.75V7.5Z" />
        <path d="M8 7.5V5.25A2.25 2.25 0 0 1 10.25 3h3.5A2.25 2.25 0 0 1 16 5.25V7.5M4 12h16" />
      </>
    ),
    services: (
      <>
        <path d="M5 6h14M5 12h14M5 18h14" />
        <circle cx="8" cy="6" r="1.75" fill="currentColor" stroke="none" />
        <circle cx="16" cy="12" r="1.75" fill="currentColor" stroke="none" />
        <circle cx="10" cy="18" r="1.75" fill="currentColor" stroke="none" />
      </>
    ),
    testimonials: (
      <>
        <path d="M5.5 17.5 3 21v-5.25A8 8 0 1 1 6.5 19" />
        <path d="M8 10h8M8 14h5" />
      </>
    ),
    inquiries: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6" />
      </>
    ),
    media: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m5 18 5-5 3 3 2-2 4 4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.16.38.4.72.7 1 .3.28.68.42 1.1.4h.1v4h-.1a1.7 1.7 0 0 0-1.8.6Z" />
      </>
    ),
    check: <path d="m5 12.5 4.25 4.25L19 7" />,
    plus: <path d="M12 5v14M5 12h14" />,
    external: (
      <path d="M14 5h5v5M10 14 19 5M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4" />
    ),
    database: (
      <>
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v7c0 1.66 3.58 3 8 3s8-1.34 8-3V5M4 12v7c0 1.66 3.58 3 8 3s8-1.34 8-3v-7" />
      </>
    ),
  } satisfies Record<AdminIconName, React.ReactNode>;

  return <svg {...commonProps}>{paths[name]}</svg>;
}

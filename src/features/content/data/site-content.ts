export const capabilities = [
  {
    title: "Websites",
    description:
      "Distinctive marketing sites and portfolios built around clear positioning, editorial rhythm, and measurable speed.",
  },
  {
    title: "Web applications",
    description:
      "Focused product interfaces that make complex workflows understandable, resilient, and accessible.",
  },
  {
    title: "WordPress",
    description:
      "Purpose-built publishing systems with an editor experience as considered as the public one.",
  },
  {
    title: "Interactive experiences",
    description:
      "Selective creative development that adds character without compromising content or performance.",
  },
] as const;

export const technologyGroups = [
  {
    label: "Interface",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS"],
  },
  {
    label: "Content",
    items: ["WordPress", "Headless CMS", "Structured content", "SEO"],
  },
  {
    label: "Systems",
    items: ["Node.js", "PostgreSQL", "REST APIs", "Cloud platforms"],
  },
] as const;

export const testimonials = [
  {
    quote:
      "He brought structure to an ambiguous brief and made every design decision feel inevitable.",
    person: "Sample client 01",
    role: "Founder",
    company: "Independent product studio",
  },
  {
    quote:
      "The work was unusually considered—from the first content discussion to the final responsive detail.",
    person: "Sample client 02",
    role: "Creative director",
    company: "International design practice",
  },
] as const;

export const services = [
  {
    number: "01",
    title: "Strategy & direction",
    description:
      "Clarify the audience, proposition, content hierarchy, and technical shape before production begins.",
    deliverables: [
      "Discovery workshop",
      "Information architecture",
      "Technical direction",
      "Content framework",
    ],
  },
  {
    number: "02",
    title: "Interface design",
    description:
      "Build a coherent visual system that gives the work hierarchy, character, and room to breathe.",
    deliverables: [
      "Art direction",
      "Responsive design",
      "Design system",
      "Interactive prototype",
    ],
  },
  {
    number: "03",
    title: "Development",
    description:
      "Translate the approved direction into accessible, maintainable, production-ready code.",
    deliverables: [
      "Next.js development",
      "CMS integration",
      "Accessibility",
      "Performance engineering",
    ],
  },
  {
    number: "04",
    title: "Launch & evolution",
    description:
      "Test the real system, support release, and improve it using evidence rather than assumptions.",
    deliverables: [
      "Quality assurance",
      "Launch support",
      "Documentation",
      "Measured iteration",
    ],
  },
] as const;

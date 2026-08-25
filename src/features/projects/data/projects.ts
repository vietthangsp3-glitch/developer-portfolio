import type { Project } from "@/features/projects/types";

const image = (slug: string, alt: string) => ({
  src: `/images/projects/${slug}.webp`,
  alt,
  width: 1536,
  height: 1024,
});

export const projects: Project[] = [
  {
    slug: "northline-build",
    title: "Northline Build",
    sector: "Architecture & construction",
    year: "2026",
    services: ["Strategy", "Web design", "Development"],
    technologies: ["Next.js", "TypeScript", "Headless CMS"],
    summary:
      "A calm, exacting digital presence for a builder defined by material craft.",
    outcome:
      "A project-first system that makes complex capability easy to understand.",
    image: image(
      "northline-build",
      "A contemporary concrete residence under construction on a coastal landscape",
    ),
    featured: true,
    blocks: [
      {
        type: "narrative",
        eyebrow: "Challenge",
        title: "Make rigor visible without saying too much.",
        body: [
          "Northline needed a portfolio that could carry the weight of large residential work while still feeling direct to private clients.",
          "The concept removes sales language and lets process, materials, and completed spaces build confidence in sequence.",
        ],
      },
      {
        type: "stats",
        items: [
          { value: "12", label: "Reusable page patterns" },
          { value: "3", label: "Clear enquiry paths" },
          { value: "AA", label: "Accessibility target" },
        ],
      },
      {
        type: "image",
        image: image(
          "studio-ledger",
          "Architectural models and drawings arranged on a dark studio table",
        ),
        caption:
          "A restrained visual language connects process to finished work.",
      },
      {
        type: "narrative",
        eyebrow: "Solution",
        title: "An editorial system grounded in construction logic.",
        body: [
          "A strict grid, oversized type, and generous image fields create a precise but unforced rhythm. Project templates turn technical detail into a narrative that clients can scan or study.",
          "The component model keeps publishing flexible without allowing the visual system to drift.",
        ],
      },
      {
        type: "quote",
        quote:
          "The strongest interface is the one that gives the work room to speak.",
        attribution: "Project principle",
      },
      {
        type: "technical-summary",
        title: "Built to stay quiet and fast",
        body: "The representative implementation keeps content server-rendered and the client bundle deliberately small.",
        items: [
          "Typed content model",
          "Responsive image delivery",
          "Accessible navigation",
          "Composable case-study blocks",
        ],
      },
      {
        type: "narrative",
        eyebrow: "Outcome",
        title: "A credible path from first impression to serious conversation.",
        body: [
          "The resulting concept balances atmosphere with useful detail and gives every project a consistent, memorable frame.",
        ],
      },
    ],
  },
  {
    slug: "field-notes-supply",
    title: "Field Notes Supply",
    sector: "Outdoor commerce",
    year: "2026",
    services: ["Digital direction", "Commerce UX", "Development"],
    technologies: ["Next.js", "Shopify", "TypeScript"],
    summary:
      "A tactile storefront that treats utility products with editorial care.",
    outcome: "A faster route from discovery to a confident product choice.",
    image: image(
      "field-notes-supply",
      "Outdoor field equipment arranged on warm stone",
    ),
    blocks: [
      {
        type: "narrative",
        eyebrow: "Challenge",
        title: "Bring field-tested utility into a refined digital store.",
        body: [
          "The concept had to feel practical and premium without borrowing the visual clichés of outdoor retail.",
        ],
      },
      {
        type: "image",
        image: image(
          "field-notes-supply",
          "A canvas pack, steel bottle, map, notebook and climbing cord",
        ),
        caption: "Product stories begin with material, context, and purpose.",
      },
      {
        type: "narrative",
        eyebrow: "Solution",
        title: "Editorial discovery with commerce discipline.",
        body: [
          "Clear taxonomy, concise product guidance, and tactile imagery make exploration useful while preserving a distinctive point of view.",
        ],
      },
      {
        type: "technical-summary",
        title: "A pragmatic commerce foundation",
        body: "The architecture separates a fast editorial frontend from dependable catalogue and checkout systems.",
        items: [
          "Server-rendered catalogue",
          "Structured product data",
          "Accessible filters",
          "Measured third-party scripts",
        ],
      },
      {
        type: "narrative",
        eyebrow: "Outcome",
        title: "A store designed to reduce hesitation.",
        body: [
          "Every layer helps the customer understand what an object is for, how it is made, and why it belongs in their kit.",
        ],
      },
    ],
  },
  {
    slug: "atlas-weekends",
    title: "Atlas Weekends",
    sector: "Travel & hospitality",
    year: "2025",
    services: ["Product design", "Content system", "Development"],
    technologies: ["Next.js", "TypeScript", "Maps API"],
    summary: "A slower, more considered way to discover short escapes.",
    outcome:
      "An editorial planning flow that turns inspiration into a practical itinerary.",
    image: image(
      "atlas-weekends",
      "A winding road along a remote rocky Atlantic coast",
    ),
    blocks: [
      {
        type: "narrative",
        eyebrow: "Challenge",
        title: "Close the gap between dreaming and planning.",
        body: [
          "Travel inspiration is abundant; useful, calm decision support is not. Atlas Weekends brings both into one focused path.",
        ],
      },
      {
        type: "stats",
        items: [
          { value: "48h", label: "Itinerary format" },
          { value: "1", label: "Focused planning view" },
          { value: "0", label: "Essential hover interactions" },
        ],
      },
      {
        type: "image",
        image: image(
          "atlas-weekends",
          "Remote coastal terrain with a pale road and small cabin",
        ),
        caption: "Place leads; interface recedes.",
      },
      {
        type: "narrative",
        eyebrow: "Solution",
        title: "A publication that behaves like a useful tool.",
        body: [
          "Destination essays, maps, stays, and schedules share one structured content model. The interface remains readable in bright light and on small screens.",
        ],
      },
      {
        type: "narrative",
        eyebrow: "Outcome",
        title: "Inspiration with enough structure to act.",
        body: [
          "The final concept gives independent travellers a clear weekend plan without flattening the pleasure of discovery.",
        ],
      },
    ],
  },
  {
    slug: "studio-ledger",
    title: "Studio Ledger",
    sector: "Architecture practice",
    year: "2025",
    services: ["Information architecture", "Web design", "WordPress"],
    technologies: ["WordPress", "PHP", "REST API"],
    summary:
      "A publishing system for an architecture studio with a deep working archive.",
    outcome:
      "A maintainable project archive that feels composed at every scale.",
    image: image(
      "studio-ledger",
      "Paper models and architectural studies on a studio worktable",
    ),
    blocks: [
      {
        type: "narrative",
        eyebrow: "Challenge",
        title: "Turn an uneven archive into a coherent body of work.",
        body: [
          "Years of projects, essays, drawings, and credits needed a system that editors could maintain without sacrificing visual control.",
        ],
      },
      {
        type: "image",
        image: image(
          "studio-ledger",
          "Architectural drawings, paper samples, pencils and a scale model",
        ),
        caption:
          "The archive is treated as a working surface, not a catalogue grid.",
      },
      {
        type: "narrative",
        eyebrow: "Solution",
        title: "Strong templates, flexible sequencing.",
        body: [
          "A carefully limited block system supports varied stories while keeping typography, credits, and image behavior consistent.",
        ],
      },
      {
        type: "technical-summary",
        title: "WordPress without the theme noise",
        body: "A typed frontend consumes a purpose-built editorial schema instead of mirroring the CMS presentation layer.",
        items: [
          "Custom editorial fields",
          "Preview workflow",
          "Responsive media",
          "Stable URL architecture",
        ],
      },
      {
        type: "narrative",
        eyebrow: "Outcome",
        title: "A living archive with a single point of view.",
        body: [
          "Editors can publish quickly, and the studio’s work still reads as one intentional collection.",
        ],
      },
    ],
  },
  {
    slug: "relay-operations",
    title: "Relay Operations",
    sector: "B2B software",
    year: "2025",
    services: ["Product strategy", "Interface design", "Frontend"],
    technologies: ["React", "TypeScript", "PostgreSQL"],
    summary:
      "A focused operations workspace for teams coordinating high-stakes field work.",
    outcome:
      "Dense operational detail reorganized into calm, decisive workflows.",
    image: image(
      "relay-operations",
      "A precise charcoal data-control installation with paper charts",
    ),
    blocks: [
      {
        type: "narrative",
        eyebrow: "Challenge",
        title: "Make complex state readable under pressure.",
        body: [
          "Dispatch teams needed to understand changes, ownership, and risk without moving through a maze of generic dashboards.",
        ],
      },
      {
        type: "image",
        image: image(
          "relay-operations",
          "Modular dark control panels with a restrained orange indicator",
        ),
        caption:
          "Hierarchy is built from contrast and sequence, not decoration.",
      },
      {
        type: "narrative",
        eyebrow: "Solution",
        title: "One operational picture, shaped by urgency.",
        body: [
          "The concept organizes work around exceptions and decisions. Progressive disclosure keeps supporting information close without making it compete.",
        ],
      },
      {
        type: "technical-summary",
        title: "A resilient application surface",
        body: "The frontend model prioritizes typed domain boundaries and reliable state transitions.",
        items: [
          "Role-aware workflows",
          "Optimistic interaction patterns",
          "Audit-friendly actions",
          "Keyboard-first controls",
        ],
      },
      {
        type: "narrative",
        eyebrow: "Outcome",
        title: "Less interface between the team and the decision.",
        body: [
          "A calmer visual system makes dense operational work more legible without removing the detail experts depend on.",
        ],
      },
    ],
  },
  {
    slug: "kinetic-type-lab",
    title: "Kinetic Type Lab",
    sector: "Interactive experience",
    year: "2024",
    services: ["Creative development", "Interaction design", "Prototype"],
    technologies: ["WebGL", "TypeScript", "GLSL"],
    summary:
      "An expressive type playground built around restraint, rhythm, and response.",
    outcome:
      "A memorable experimental system that remains legible and inclusive.",
    image: image(
      "kinetic-type-lab",
      "Sculptural folded planes in charcoal, paper and rust orange",
    ),
    blocks: [
      {
        type: "narrative",
        eyebrow: "Challenge",
        title: "Make experimentation feel purposeful.",
        body: [
          "The brief called for a playful interactive identity without turning motion into a barrier or spectacle for its own sake.",
        ],
      },
      {
        type: "image",
        image: image(
          "kinetic-type-lab",
          "Abstract letterpress-inspired forms crossing a dark studio space",
        ),
        caption:
          "Motion is imagined as one layer of a complete static composition.",
      },
      {
        type: "narrative",
        eyebrow: "Solution",
        title: "Expression inside a disciplined frame.",
        body: [
          "A small set of typographic behaviors reacts to pace and input while every state preserves hierarchy and reading order.",
        ],
      },
      {
        type: "technical-summary",
        title: "Progressive enhancement by default",
        body: "The representative system starts with meaningful HTML and adds visual behavior only when the device and user preference allow it.",
        items: [
          "Reduced-motion mode",
          "Static visual fallback",
          "Lazy-loaded enhancement",
          "Budgeted rendering work",
        ],
      },
      {
        type: "narrative",
        eyebrow: "Outcome",
        title: "A small experiment with a durable idea.",
        body: [
          "The concept proves that expressive interaction and inclusive performance can reinforce each other.",
        ],
      },
    ],
  },
];

export function getProject(slug: string) {
  return projects.find((project) => project.slug === slug);
}

export function getNextProject(slug: string) {
  const currentIndex = projects.findIndex((project) => project.slug === slug);
  return projects[(currentIndex + 1) % projects.length];
}

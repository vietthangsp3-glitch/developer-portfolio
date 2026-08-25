import { slugify } from "@/features/admin/schemas/cms";

export type CanonicalTechnology = {
  name: string;
  slug: string;
};

export function canonicalizeTechnologies(
  names: readonly string[],
): CanonicalTechnology[] {
  const technologies = new Map<string, CanonicalTechnology>();

  for (const rawName of names) {
    const name = rawName.trim().replace(/\s+/g, " ");
    const slug = slugify(name);

    if (!slug || technologies.has(slug)) continue;
    technologies.set(slug, { name, slug });
  }

  return [...technologies.values()];
}

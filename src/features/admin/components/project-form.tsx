"use client";

import { useState } from "react";

import { saveProjectAction } from "@/features/admin/actions/cms";
import { ActionForm } from "@/features/admin/components/action-form";
import { CaseStudyEditor } from "@/features/admin/components/case-study-editor";
import {
  ProjectMediaEditor,
  type ProjectMediaRelation,
} from "@/features/admin/components/project-media-editor";
import {
  Checkbox,
  Field,
  FormSection,
  Select,
  TextArea,
  TextInput,
} from "@/features/admin/components/form-controls";
import { slugify } from "@/features/admin/schemas/cms";
import type { CaseStudyContent } from "@/features/projects/schemas/project";

export type ProjectFormValue = {
  id?: string;
  title: string;
  slug: string;
  subtitle: string | null;
  summary: string;
  description: string | null;
  category: string;
  role: string;
  year: number;
  status: "draft" | "published" | "archived";
  featuredRank: number | null;
  sortOrder: number;
  thumbnailMediaId: string | null;
  heroMediaId: string | null;
  liveUrl: string | null;
  repositoryUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  caseStudyContent: CaseStudyContent;
  technologies: string[];
  mediaRelations: ProjectMediaRelation[];
};

type MediaOption = { id: string; altText: string; url: string };

export function ProjectForm({
  value,
  media,
  technologyOptions,
}: {
  value: ProjectFormValue;
  media: MediaOption[];
  technologyOptions: Array<{ id: string; name: string }>;
}) {
  const [title, setTitle] = useState(value.title);
  const [slug, setSlug] = useState(value.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(value.id));
  return (
    <ActionForm
      action={saveProjectAction}
      className="mt-8 space-y-8"
      submitLabel={value.id ? "Save project" : "Create project"}
    >
      {value.id ? <input type="hidden" name="id" value={value.id} /> : null}
      <FormSection title="Basic information">
        <Field label="Title">
          <TextInput
            required
            name="title"
            maxLength={160}
            value={title}
            onChange={(event) => {
              const next = event.target.value;
              setTitle(next);
              if (!slugTouched) setSlug(slugify(next));
            }}
          />
        </Field>
        <Field label="Slug">
          <TextInput
            required
            name="slug"
            maxLength={120}
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
          />
        </Field>
        <Field label="Subtitle" wide>
          <TextInput
            name="subtitle"
            maxLength={240}
            defaultValue={value.subtitle ?? ""}
          />
        </Field>
        <Field label="Summary" wide>
          <TextArea
            required
            name="summary"
            maxLength={500}
            defaultValue={value.summary}
          />
        </Field>
        <Field label="Description" wide>
          <TextArea
            name="description"
            maxLength={5000}
            defaultValue={value.description ?? ""}
          />
        </Field>
      </FormSection>
      <FormSection title="Project details">
        <Field label="Category">
          <TextInput
            required
            name="category"
            maxLength={120}
            defaultValue={value.category}
          />
        </Field>
        <Field label="Role / services">
          <TextInput
            required
            name="role"
            maxLength={240}
            defaultValue={value.role}
          />
        </Field>
        <Field label="Year">
          <TextInput
            required
            name="year"
            type="number"
            min={1900}
            max={2200}
            defaultValue={value.year}
          />
        </Field>
        <Field label="Technologies" hint="Comma-separated">
          <TextInput
            name="technologies"
            list="project-technology-options"
            defaultValue={value.technologies.join(", ")}
          />
          <datalist id="project-technology-options">
            {technologyOptions.map((technology) => (
              <option key={technology.id} value={technology.name} />
            ))}
          </datalist>
        </Field>
        <Field label="Live URL">
          <TextInput
            name="liveUrl"
            type="url"
            defaultValue={value.liveUrl ?? ""}
          />
        </Field>
        <Field label="Repository URL">
          <TextInput
            name="repositoryUrl"
            type="url"
            defaultValue={value.repositoryUrl ?? ""}
          />
        </Field>
      </FormSection>
      <FormSection title="Media">
        <Field label="Thumbnail">
          <Select
            name="thumbnailMediaId"
            defaultValue={value.thumbnailMediaId ?? ""}
          >
            <option value="">No thumbnail</option>
            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.altText || item.url}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Hero image">
          <Select name="heroMediaId" defaultValue={value.heroMediaId ?? ""}>
            <option value="">No hero image</option>
            {media.map((item) => (
              <option key={item.id} value={item.id}>
                {item.altText || item.url}
              </option>
            ))}
          </Select>
        </Field>
        <ProjectMediaEditor
          media={media}
          initialRelations={value.mediaRelations}
        />
      </FormSection>
      <FormSection title="Case study">
        <CaseStudyEditor initialBlocks={value.caseStudyContent.blocks} />
      </FormSection>
      <FormSection title="SEO">
        <Field label="SEO title">
          <TextInput
            name="seoTitle"
            maxLength={160}
            defaultValue={value.seoTitle ?? ""}
          />
        </Field>
        <Field label="SEO description">
          <TextArea
            name="seoDescription"
            maxLength={320}
            defaultValue={value.seoDescription ?? ""}
          />
        </Field>
      </FormSection>
      <FormSection title="Publishing">
        <Field label="Status">
          <Select name="status" defaultValue={value.status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        <Field label="Sort order">
          <TextInput
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={value.sortOrder}
          />
        </Field>
        <Checkbox
          label="Feature on homepage"
          name="featured"
          defaultChecked={value.featuredRank !== null}
        />
        <Field label="Featured rank">
          <TextInput
            name="featuredRank"
            type="number"
            min={0}
            defaultValue={value.featuredRank ?? 0}
          />
        </Field>
      </FormSection>
    </ActionForm>
  );
}

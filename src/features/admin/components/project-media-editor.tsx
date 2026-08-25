"use client";

import { useState } from "react";

import {
  Field,
  Select,
  TextInput,
} from "@/features/admin/components/form-controls";

export type ProjectMediaRelation = {
  mediaId: string;
  role: "cover" | "hero" | "gallery" | "case_study";
  altTextOverride: string | null;
  caption: string | null;
};
type MediaOption = { id: string; altText: string; url: string };

export function ProjectMediaEditor({
  media,
  initialRelations,
}: {
  media: MediaOption[];
  initialRelations: ProjectMediaRelation[];
}) {
  const [relations, setRelations] = useState(initialRelations);
  const update = (index: number, value: ProjectMediaRelation) =>
    setRelations((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= relations.length) return;
    setRelations((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  return (
    <div className="sm:col-span-2">
      <input
        type="hidden"
        name="mediaRelations"
        value={JSON.stringify(relations)}
      />
      {relations.length ? (
        <div className="space-y-3">
          {relations.map((relation, index) => (
            <div
              className="border-border grid gap-3 border p-3 sm:grid-cols-2"
              key={`${relation.mediaId}-${relation.role}-${index}`}
            >
              <Field label="Asset">
                <Select
                  value={relation.mediaId}
                  onChange={(event) =>
                    update(index, { ...relation, mediaId: event.target.value })
                  }
                >
                  {media.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.altText || item.url}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Role">
                <Select
                  value={relation.role}
                  onChange={(event) =>
                    update(index, {
                      ...relation,
                      role: event.target.value as ProjectMediaRelation["role"],
                    })
                  }
                >
                  <option value="cover">Cover</option>
                  <option value="hero">Hero</option>
                  <option value="gallery">Gallery</option>
                  <option value="case_study">Case study</option>
                </Select>
              </Field>
              <Field label="Alt override">
                <TextInput
                  value={relation.altTextOverride ?? ""}
                  onChange={(event) =>
                    update(index, {
                      ...relation,
                      altTextOverride: event.target.value || null,
                    })
                  }
                />
              </Field>
              <Field label="Caption">
                <TextInput
                  value={relation.caption ?? ""}
                  onChange={(event) =>
                    update(index, {
                      ...relation,
                      caption: event.target.value || null,
                    })
                  }
                />
              </Field>
              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                  className="border-border min-h-9 border px-3 text-xs disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={index === relations.length - 1}
                  onClick={() => move(index, 1)}
                  className="border-border min-h-9 border px-3 text-xs disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setRelations((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="border-danger text-danger min-h-9 border px-3 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No project media relationships.
        </p>
      )}
      <button
        type="button"
        disabled={!media.length}
        onClick={() =>
          media[0] &&
          setRelations((current) => [
            ...current,
            {
              mediaId: media[0].id,
              role: "gallery",
              altTextOverride: null,
              caption: null,
            },
          ])
        }
        className="border-border mt-3 min-h-10 border px-4 text-sm disabled:opacity-40"
      >
        Add media relationship
      </button>
    </div>
  );
}

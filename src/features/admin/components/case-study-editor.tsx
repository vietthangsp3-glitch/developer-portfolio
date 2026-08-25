"use client";

import { useState } from "react";

import type { CaseStudyBlock } from "@/features/projects/schemas/project";
import {
  Field,
  Select,
  TextArea,
  TextInput,
} from "@/features/admin/components/form-controls";

const blankBlocks: Record<CaseStudyBlock["type"], CaseStudyBlock> = {
  narrative: { type: "narrative", eyebrow: "Section", title: "", body: [""] },
  image: {
    type: "image",
    image: { src: "/images/projects/", alt: "", width: 1536, height: 1024 },
    caption: "",
  },
  quote: { type: "quote", quote: "", attribution: "" },
  stats: { type: "stats", items: [{ value: "", label: "" }] },
  "technical-summary": {
    type: "technical-summary",
    title: "",
    body: "",
    items: [""],
  },
};

export function CaseStudyEditor({
  initialBlocks,
}: {
  initialBlocks: CaseStudyBlock[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [newType, setNewType] = useState<CaseStudyBlock["type"]>("narrative");
  const update = (index: number, block: CaseStudyBlock) =>
    setBlocks((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? block : item)),
    );
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    setBlocks((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="sm:col-span-2">
      <input
        type="hidden"
        name="caseStudyContent"
        value={JSON.stringify({ version: 1, blocks })}
      />
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <fieldset className="border-border bg-surface border p-4" key={index}>
            <legend className="px-2 font-mono text-xs uppercase">
              {String(index + 1).padStart(2, "0")} / {block.type}
            </legend>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="border-border min-h-9 border px-3 text-xs disabled:opacity-40"
              >
                Move up
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === blocks.length - 1}
                className="border-border min-h-9 border px-3 text-xs disabled:opacity-40"
              >
                Move down
              </button>
              <button
                type="button"
                onClick={() =>
                  setBlocks((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                className="border-danger text-danger min-h-9 border px-3 text-xs"
              >
                Remove
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {block.type === "narrative" ? (
                <>
                  <Field label="Eyebrow">
                    <TextInput
                      value={block.eyebrow}
                      onChange={(event) =>
                        update(index, { ...block, eyebrow: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Title">
                    <TextInput
                      value={block.title}
                      onChange={(event) =>
                        update(index, { ...block, title: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Paragraphs" hint="One per line" wide>
                    <TextArea
                      value={block.body.join("\n")}
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          body: event.target.value.split("\n"),
                        })
                      }
                    />
                  </Field>
                </>
              ) : null}
              {block.type === "image" ? (
                <>
                  <Field label="Image URL" wide>
                    <TextInput
                      value={block.image.src}
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          image: { ...block.image, src: event.target.value },
                        })
                      }
                    />
                  </Field>
                  <Field label="Alt text">
                    <TextInput
                      value={block.image.alt}
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          image: { ...block.image, alt: event.target.value },
                        })
                      }
                    />
                  </Field>
                  <Field label="Caption">
                    <TextInput
                      value={block.caption ?? ""}
                      onChange={(event) =>
                        update(index, { ...block, caption: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Width">
                    <TextInput
                      type="number"
                      value={block.image.width}
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          image: {
                            ...block.image,
                            width: Number(event.target.value),
                          },
                        })
                      }
                    />
                  </Field>
                  <Field label="Height">
                    <TextInput
                      type="number"
                      value={block.image.height}
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          image: {
                            ...block.image,
                            height: Number(event.target.value),
                          },
                        })
                      }
                    />
                  </Field>
                </>
              ) : null}
              {block.type === "quote" ? (
                <>
                  <Field label="Quote" wide>
                    <TextArea
                      value={block.quote}
                      onChange={(event) =>
                        update(index, { ...block, quote: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Attribution" wide>
                    <TextInput
                      value={block.attribution}
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          attribution: event.target.value,
                        })
                      }
                    />
                  </Field>
                </>
              ) : null}
              {block.type === "stats" ? (
                <Field
                  label="Statistics"
                  hint="Value | Label, one per line"
                  wide
                >
                  <TextArea
                    value={block.items
                      .map((item) => `${item.value} | ${item.label}`)
                      .join("\n")}
                    onChange={(event) =>
                      update(index, {
                        ...block,
                        items: event.target.value.split("\n").map((line) => {
                          const separator = line.indexOf("|");
                          return {
                            value: line
                              .slice(0, separator < 0 ? undefined : separator)
                              .trim(),
                            label:
                              separator < 0
                                ? ""
                                : line.slice(separator + 1).trim(),
                          };
                        }),
                      })
                    }
                  />
                </Field>
              ) : null}
              {block.type === "technical-summary" ? (
                <>
                  <Field label="Title">
                    <TextInput
                      value={block.title}
                      onChange={(event) =>
                        update(index, { ...block, title: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Body">
                    <TextArea
                      value={block.body}
                      onChange={(event) =>
                        update(index, { ...block, body: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Items" hint="One per line" wide>
                    <TextArea
                      value={block.items.join("\n")}
                      onChange={(event) =>
                        update(index, {
                          ...block,
                          items: event.target.value.split("\n"),
                        })
                      }
                    />
                  </Field>
                </>
              ) : null}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="border-border mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row">
        <Select
          aria-label="New block type"
          value={newType}
          onChange={(event) =>
            setNewType(event.target.value as CaseStudyBlock["type"])
          }
        >
          {Object.keys(blankBlocks).map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </Select>
        <button
          className="border-border min-h-11 shrink-0 rounded-sm border px-4 text-sm"
          type="button"
          onClick={() =>
            setBlocks((current) => [
              ...current,
              structuredClone(blankBlocks[newType]),
            ])
          }
        >
          Add block
        </button>
      </div>
    </div>
  );
}

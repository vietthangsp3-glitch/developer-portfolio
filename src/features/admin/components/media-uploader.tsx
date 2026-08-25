"use client";

import { useState, useTransition } from "react";

import { registerCloudinaryMediaAction } from "@/features/admin/actions/media";

type Authorization = {
  cloudName: string;
  apiKey: string;
  folder: string;
  public_id: string;
  timestamp: number;
  signature: string;
  maxBytes: number;
  allowedFormats: string[];
};

export function MediaUploader({ enabled }: { enabled: boolean }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  if (!enabled)
    return (
      <div className="border-border border p-5">
        <p className="text-muted-foreground text-sm">
          Cloudinary credentials are not configured. The media library remains
          usable for existing local assets.
        </p>
      </div>
    );
  return (
    <form
      className="border-border border p-5"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const file = (form.elements.namedItem("file") as HTMLInputElement)
          .files?.[0];
        const altText = (form.elements.namedItem("altText") as HTMLInputElement)
          .value;
        if (!file) return;
        startTransition(async () => {
          try {
            setMessage("Requesting secure upload…");
            const authorizationResponse = await fetch("/api/media/sign", {
              method: "POST",
            });
            const authorization =
              (await authorizationResponse.json()) as Authorization & {
                error?: string;
              };
            if (!authorizationResponse.ok)
              throw new Error(
                authorization.error || "Upload authorization failed.",
              );
            if (
              file.size > authorization.maxBytes ||
              !authorization.allowedFormats.includes(
                (file.name.split(".").pop() || "").toLowerCase(),
              )
            )
              throw new Error(
                "Choose a supported JPG, PNG, WebP, or AVIF image under 10 MB.",
              );
            const body = new FormData();
            body.set("file", file);
            body.set("api_key", authorization.apiKey);
            body.set("timestamp", String(authorization.timestamp));
            body.set("signature", authorization.signature);
            body.set("folder", authorization.folder);
            body.set("public_id", authorization.public_id);
            const uploadResponse = await fetch(
              `https://api.cloudinary.com/v1_1/${authorization.cloudName}/image/upload`,
              { method: "POST", body },
            );
            const upload = await uploadResponse.json();
            if (!uploadResponse.ok)
              throw new Error("Cloudinary rejected the image.");
            await registerCloudinaryMediaAction(upload, altText);
            form.reset();
            setMessage("Image uploaded.");
          } catch (error) {
            setMessage(
              error instanceof Error ? error.message : "Upload failed.",
            );
          }
        });
      }}
    >
      <h2 className="text-lg font-medium">Upload image</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-medium">Image</span>
          <input
            className="border-border mt-2 block min-h-11 w-full border p-2 text-sm"
            required
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
          />
        </label>
        <label className="text-sm">
          <span className="font-medium">Alt text</span>
          <input
            className="border-border bg-surface mt-2 min-h-11 w-full border px-3"
            name="altText"
            maxLength={300}
          />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <button
          disabled={pending}
          className="bg-accent text-accent-foreground min-h-11 px-4 text-sm font-semibold disabled:opacity-60"
          type="submit"
        >
          {pending ? "Uploading…" : "Upload"}
        </button>
        <p className="text-muted-foreground text-sm" role="status">
          {message}
        </p>
      </div>
    </form>
  );
}

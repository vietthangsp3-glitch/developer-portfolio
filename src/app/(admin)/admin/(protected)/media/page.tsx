import Image from "next/image";

import {
  deleteMediaAction,
  updateMediaAltAction,
} from "@/features/admin/actions/media";
import { ActionForm } from "@/features/admin/components/action-form";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DeleteControl } from "@/features/admin/components/delete-control";
import { Field, TextInput } from "@/features/admin/components/form-controls";
import { MediaUploader } from "@/features/admin/components/media-uploader";
import { requireAdmin } from "@/server/auth/session";
import { getMediaReferenceCounts, listAdminMedia } from "@/server/dal/cms";
import { isCloudinaryConfigured } from "@/server/media/cloudinary";

export default async function AdminMediaPage() {
  await requireAdmin();
  const media = await listAdminMedia();
  const references = await Promise.all(
    media.map((item) => getMediaReferenceCounts(item.id)),
  );
  return (
    <div>
      <AdminPageHeader
        eyebrow="Assets"
        title="Media"
        description="Upload signed images, maintain alt text, and delete only assets that are no longer referenced."
      />
      <div className="mt-8">
        <MediaUploader enabled={isCloudinaryConfigured()} />
      </div>
      {media.length ? (
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {media.map((item, index) => {
            const usage = references[index];
            const count = usage
              ? usage.projectMedia +
                usage.thumbnail +
                usage.hero +
                usage.testimonial
              : 0;
            return (
              <article key={item.id} className="border-border min-w-0 border">
                <div className="bg-surface relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.url}
                    alt=""
                    fill
                    sizes="(min-width:1280px) 30vw, (min-width:768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <p className="text-muted-foreground truncate font-mono text-xs uppercase">
                    {item.format} · {item.width}×{item.height} · {item.provider}
                  </p>
                  <ActionForm
                    action={updateMediaAltAction}
                    className="mt-4"
                    submitLabel="Save alt text"
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <Field label="Alt text" hint="Empty only if decorative">
                      <TextInput
                        name="altText"
                        maxLength={300}
                        defaultValue={item.altText}
                      />
                    </Field>
                  </ActionForm>
                  <div className="mt-5">
                    <DeleteControl
                      action={deleteMediaAction}
                      id={item.id}
                      label="media"
                      disabledReason={
                        count > 0
                          ? `Used by ${count} content relationship${count === 1 ? "" : "s"}. Remove references first.`
                          : undefined
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="border-border text-muted-foreground mt-8 border py-12 text-center text-sm">
          No media uploaded.
        </div>
      )}
    </div>
  );
}

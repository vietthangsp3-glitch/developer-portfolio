"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import type { AdminActionState } from "@/features/admin/action-state";
import { validationActionState } from "@/features/admin/action-state";
import { recordAuditEvent } from "@/server/audit";
import { assertAdmin } from "@/server/auth/session";
import {
  createAdminMedia,
  deleteAdminMediaRow,
  getAdminMedia,
  getMediaReferenceCounts,
  updateAdminMediaAlt,
} from "@/server/dal/cms";
import {
  destroyCloudinaryAsset,
  getMediaReferenceTotal,
  verifyCloudinaryUploadResponse,
} from "@/server/media/cloudinary";

const altSchema = z.string().trim().max(300);

export async function registerCloudinaryMediaAction(
  input: unknown,
  altText: string,
) {
  const session = await assertAdmin();
  const alt = altSchema.parse(altText);
  const upload = verifyCloudinaryUploadResponse(input);
  const row = await createAdminMedia({
    provider: "cloudinary",
    providerKey: upload.public_id,
    url: upload.secure_url,
    width: upload.width,
    height: upload.height,
    format: upload.format,
    bytes: upload.bytes,
    altText: alt,
    folder: "portfolio/projects",
  });
  await recordAuditEvent({
    actorUserId: session.user.id,
    action: "media.uploaded",
    entityType: "media",
    entityId: row.id,
    metadata: {
      provider: "cloudinary",
      format: upload.format,
      bytes: upload.bytes,
    },
  });
  revalidatePath("/admin/media");
  return { ok: true as const };
}

export async function updateMediaAltAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await assertAdmin();
  const id = z.string().uuid().safeParse(formData.get("id"));
  const alt = altSchema.safeParse(formData.get("altText"));
  if (!id.success || !alt.success)
    return validationActionState(
      "Enter valid alt text (or leave it empty only for decorative media).",
      alt.success
        ? undefined
        : { altText: alt.error.issues.map((issue) => issue.message) },
    );
  const row = await updateAdminMediaAlt(id.data, alt.data);
  if (!row) return validationActionState("The media item no longer exists.");
  await recordAuditEvent({
    actorUserId: session.user.id,
    action: "media.alt_updated",
    entityType: "media",
    entityId: row.id,
    metadata: { decorative: alt.data === "" },
  });
  revalidatePath("/admin/media");
  revalidatePath("/", "layout");
  updateTag("projects");
  return { status: "success", message: "Alt text saved." };
}

export async function deleteMediaAction(formData: FormData) {
  const session = await assertAdmin();
  const id = z.string().uuid().parse(formData.get("id"));
  if (formData.get("confirm") !== "delete") return;
  const [media, references] = await Promise.all([
    getAdminMedia(id),
    getMediaReferenceCounts(id),
  ]);
  if (!media || !references) return;
  const count = getMediaReferenceTotal(references);
  if (count > 0) return;
  if (media.provider === "cloudinary")
    await destroyCloudinaryAsset(media.providerKey);
  const deleted = await deleteAdminMediaRow(id);
  if (!deleted)
    throw new Error(
      "Provider asset was removed, but the database record could not be removed. Reconcile this media entry before retrying.",
    );
  await recordAuditEvent({
    actorUserId: session.user.id,
    action: "media.deleted",
    entityType: "media",
    entityId: id,
    metadata: { provider: media.provider },
  });
  revalidatePath("/admin/media");
}

"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import type { AdminActionState } from "@/features/admin/action-state";
import { validationActionState } from "@/features/admin/action-state";
import {
  entityIdSchema,
  inquiryStatusFormSchema,
  parseCsv,
  parseJsonField,
  parseSocialLinks,
  projectFormSchema,
  serviceFormSchema,
  settingsFormSchema,
  testimonialFormSchema,
} from "@/features/admin/schemas/cms";
import { recordAuditEvent } from "@/server/audit";
import { assertAdmin } from "@/server/auth/session";
import {
  createAdminProject,
  deleteAdminProject,
  deleteAdminService,
  deleteAdminTestimonial,
  getAdminInquiry,
  isProjectSlugAvailable,
  saveAdminService,
  saveAdminSiteSettings,
  saveAdminTestimonial,
  updateAdminInquiryStatus,
  updateAdminProject,
} from "@/server/dal/cms";
import { updateInquiryEmailDelivery } from "@/server/dal/inquiries";
import {
  isInquiryEmailConfigured,
  sendInquiryNotification,
} from "@/server/email/resend";

function checkbox(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

function safeFailure(message = "The change could not be saved. Try again.") {
  return validationActionState(message);
}

function revalidateProjects(slug?: string) {
  updateTag("projects");
  if (slug) updateTag(`project:${slug}`);
  revalidatePath("/");
  revalidatePath("/projects");
  if (slug) revalidatePath(`/projects/${slug}`);
  revalidatePath("/admin/projects");
}

export async function saveProjectAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await assertAdmin();
  const parsed = projectFormSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    subtitle: formData.get("subtitle"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    category: formData.get("category"),
    role: formData.get("role"),
    year: formData.get("year"),
    status: formData.get("status"),
    featured: checkbox(formData, "featured"),
    featuredRank: formData.get("featuredRank") || 0,
    sortOrder: formData.get("sortOrder") || 0,
    thumbnailMediaId: formData.get("thumbnailMediaId") ?? "",
    heroMediaId: formData.get("heroMediaId") ?? "",
    liveUrl: formData.get("liveUrl") ?? "",
    repositoryUrl: formData.get("repositoryUrl") ?? "",
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    technologies: parseCsv(formData.get("technologies")),
    mediaRelations: parseJsonField(formData.get("mediaRelations")),
    caseStudyContent: parseJsonField(formData.get("caseStudyContent")),
  });

  if (!parsed.success) {
    return validationActionState(
      "Review the highlighted project fields.",
      parsed.error.flatten().fieldErrors,
    );
  }
  if (!(await isProjectSlugAvailable(parsed.data.slug, parsed.data.id))) {
    return validationActionState(
      "That slug is already used by another project.",
      {
        slug: ["Choose a unique project slug."],
      },
    );
  }

  const { id, technologies, mediaRelations, featured, ...project } =
    parsed.data;
  try {
    const result = id
      ? await updateAdminProject(id, {
          project: {
            ...project,
            featuredRank: featured ? project.featuredRank : null,
          },
          technologies,
          mediaRelations,
        })
      : await createAdminProject({
          project: {
            ...project,
            featuredRank: featured ? project.featuredRank : null,
          },
          technologies,
          mediaRelations,
        });
    if (!result) return safeFailure("The project no longer exists.");

    await recordAuditEvent({
      actorUserId: session.user.id,
      action: id
        ? project.status === "published"
          ? "project.published"
          : project.status === "archived"
            ? "project.archived"
            : "project.updated"
        : "project.created",
      entityType: "project",
      entityId: result.id,
      metadata: { slug: result.slug, status: project.status },
    });
    revalidateProjects(result.slug);
    revalidatePath(`/admin/projects/${result.id}`);
    if (!id) redirect(`/admin/projects/${result.id}?created=1`);
    return { status: "success", message: "Project saved." };
  } catch (error) {
    if (error && typeof error === "object" && "digest" in error) throw error;
    return safeFailure();
  }
}

export async function deleteProjectAction(formData: FormData) {
  const session = await assertAdmin();
  const id = entityIdSchema.parse(formData.get("id"));
  if (formData.get("confirm") !== "delete") return;
  const row = await deleteAdminProject(id);
  if (!row) return;
  await recordAuditEvent({
    actorUserId: session.user.id,
    action: "project.deleted",
    entityType: "project",
    entityId: row.id,
    metadata: { slug: row.slug },
  });
  revalidateProjects(row.slug);
  redirect("/admin/projects?deleted=1");
}

export async function saveServiceAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await assertAdmin();
  const parsed = serviceFormSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    sortOrder: formData.get("sortOrder"),
    published: checkbox(formData, "published"),
    seoTitle: formData.get("seoTitle") || null,
    seoDescription: formData.get("seoDescription") || null,
  });
  if (!parsed.success)
    return validationActionState(
      "Review the service fields.",
      parsed.error.flatten().fieldErrors,
    );
  const { id, ...input } = parsed.data;
  try {
    const result = await saveAdminService(input, id);
    if (!result) return safeFailure("The service no longer exists.");
    await recordAuditEvent({
      actorUserId: session.user.id,
      action: id ? "service.updated" : "service.created",
      entityType: "service",
      entityId: result.id,
      metadata: { slug: result.slug, published: input.published },
    });
    revalidatePath("/");
    updateTag("services");
    revalidatePath("/admin/services");
    return { status: "success", message: "Service saved." };
  } catch {
    return safeFailure(
      "The service could not be saved. Check that its slug is unique.",
    );
  }
}

export async function deleteServiceAction(formData: FormData) {
  const session = await assertAdmin();
  const id = entityIdSchema.parse(formData.get("id"));
  if (formData.get("confirm") !== "delete") return;
  const row = await deleteAdminService(id);
  if (!row) return;
  await recordAuditEvent({
    actorUserId: session.user.id,
    action: "service.deleted",
    entityType: "service",
    entityId: id,
    metadata: {},
  });
  revalidatePath("/");
  updateTag("services");
  revalidatePath("/admin/services");
}

export async function saveTestimonialAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await assertAdmin();
  const parsed = testimonialFormSchema.safeParse({
    id: formData.get("id") || undefined,
    personName: formData.get("personName"),
    role: formData.get("role"),
    company: formData.get("company"),
    quote: formData.get("quote"),
    avatarMediaId: formData.get("avatarMediaId") || null,
    published: checkbox(formData, "published"),
    isDemo: checkbox(formData, "isDemo"),
    sortOrder: formData.get("sortOrder"),
  });
  if (!parsed.success)
    return validationActionState(
      "Review the testimonial fields.",
      parsed.error.flatten().fieldErrors,
    );
  const { id, ...input } = parsed.data;
  if (input.published && input.isDemo) {
    return validationActionState("Demo testimonials cannot be published.");
  }
  try {
    const result = await saveAdminTestimonial(input, id);
    if (!result) return safeFailure("The testimonial no longer exists.");
    await recordAuditEvent({
      actorUserId: session.user.id,
      action: id ? "testimonial.updated" : "testimonial.created",
      entityType: "testimonial",
      entityId: result.id,
      metadata: { published: input.published, demo: input.isDemo },
    });
    revalidatePath("/");
    updateTag("testimonials");
    revalidatePath("/admin/testimonials");
    return { status: "success", message: "Testimonial saved." };
  } catch {
    return safeFailure();
  }
}

export async function deleteTestimonialAction(formData: FormData) {
  const session = await assertAdmin();
  const id = entityIdSchema.parse(formData.get("id"));
  if (formData.get("confirm") !== "delete") return;
  const row = await deleteAdminTestimonial(id);
  if (!row) return;
  await recordAuditEvent({
    actorUserId: session.user.id,
    action: "testimonial.deleted",
    entityType: "testimonial",
    entityId: id,
    metadata: {},
  });
  revalidatePath("/");
  updateTag("testimonials");
  revalidatePath("/admin/testimonials");
}

export async function updateInquiryStatusAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await assertAdmin();
  const parsed = inquiryStatusFormSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success)
    return validationActionState("Choose a valid inquiry status.");
  const row = await updateAdminInquiryStatus(
    parsed.data.id,
    parsed.data.status,
  );
  if (!row) return safeFailure("The inquiry no longer exists.");
  await recordAuditEvent({
    actorUserId: session.user.id,
    action: "inquiry.status_changed",
    entityType: "inquiry",
    entityId: row.id,
    metadata: { status: parsed.data.status },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${row.id}`);
  return { status: "success", message: "Inquiry status updated." };
}

export async function retryInquiryNotificationAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await assertAdmin();
  const parsedId = entityIdSchema.safeParse(formData.get("id"));
  if (!parsedId.success) return safeFailure("The inquiry could not be found.");

  const inquiry = await getAdminInquiry(parsedId.data);
  if (!inquiry) return safeFailure("The inquiry no longer exists.");
  if (inquiry.emailDeliveryStatus === "sent") {
    return safeFailure("This notification was already sent.");
  }
  if (!isInquiryEmailConfigured()) {
    return safeFailure("Inquiry email is not configured on this deployment.");
  }

  try {
    await updateInquiryEmailDelivery(inquiry.id, "pending");
    const email = await sendInquiryNotification({
      name: inquiry.name,
      email: inquiry.email,
      company: inquiry.company,
      projectType: inquiry.projectType,
      budget: inquiry.budget,
      message: inquiry.message,
      source: inquiry.source,
    });
    await updateInquiryEmailDelivery(inquiry.id, "sent", email.id);
    await recordAuditEvent({
      actorUserId: session.user.id,
      action: "inquiry.notification_retried",
      entityType: "inquiry",
      entityId: inquiry.id,
      metadata: { deliveryStatus: "sent" },
    });
  } catch (error) {
    console.error("Admin inquiry notification retry failed", {
      inquiryId: inquiry.id,
      errorType: error instanceof Error ? error.name : "UnknownError",
    });
    try {
      await updateInquiryEmailDelivery(inquiry.id, "failed");
      await recordAuditEvent({
        actorUserId: session.user.id,
        action: "inquiry.notification_retried",
        entityType: "inquiry",
        entityId: inquiry.id,
        metadata: { deliveryStatus: "failed" },
      });
    } catch {
      // The stored inquiry remains authoritative even if delivery-state
      // reconciliation is temporarily unavailable.
    }
    return safeFailure(
      "The inquiry is safe, but notification delivery failed.",
    );
  }

  revalidatePath(`/admin/inquiries/${inquiry.id}`);
  revalidatePath("/admin/inquiries");
  return { status: "success", message: "Inquiry notification sent." };
}

export async function saveSettingsAction(
  _state: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const session = await assertAdmin();
  const parsed = settingsFormSchema.safeParse({
    siteName: formData.get("siteName"),
    siteTitle: formData.get("siteTitle"),
    siteDescription: formData.get("siteDescription"),
    availability: formData.get("availability"),
    contactEmail: formData.get("contactEmail"),
    socialLinks: parseSocialLinks(formData.get("socialLinks")),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  });
  if (!parsed.success)
    return validationActionState(
      "Review the settings fields.",
      parsed.error.flatten().fieldErrors,
    );
  const result = await saveAdminSiteSettings(parsed.data);
  await recordAuditEvent({
    actorUserId: session.user.id,
    action: "site_settings.updated",
    entityType: "site_settings",
    entityId: result.id,
    metadata: { settingsKey: "default" },
  });
  revalidatePath("/", "layout");
  updateTag("settings");
  revalidatePath("/admin/settings");
  return { status: "success", message: "Settings saved." };
}

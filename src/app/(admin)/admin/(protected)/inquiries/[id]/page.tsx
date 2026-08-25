import { notFound } from "next/navigation";

import {
  retryInquiryNotificationAction,
  updateInquiryStatusAction,
} from "@/features/admin/actions/cms";
import { ActionForm } from "@/features/admin/components/action-form";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { Field, Select } from "@/features/admin/components/form-controls";
import { entityIdSchema } from "@/lib/validation";
import { requireAdmin } from "@/server/auth/session";
import { getAdminInquiry } from "@/server/dal/cms";

export default async function InquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const parsedId = entityIdSchema.safeParse((await params).id);
  if (!parsedId.success) notFound();
  const inquiry = await getAdminInquiry(parsedId.data);
  if (!inquiry) notFound();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Inquiry"
        title={inquiry.name}
        description={`Received ${inquiry.createdAt.toLocaleString("en-GB")}`}
      />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
        <section
          className="border-border min-w-0 border-t pt-5"
          aria-labelledby="inquiry-message"
        >
          <h2 id="inquiry-message" className="text-lg font-medium">
            Message
          </h2>
          <p className="mt-5 text-sm leading-7 break-words whitespace-pre-wrap">
            {inquiry.message}
          </p>
        </section>
        <aside className="border-border border p-5">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs uppercase">Email</dt>
              <dd className="mt-1 break-all">
                <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase">
                Company
              </dt>
              <dd className="mt-1">{inquiry.company || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase">
                Project type
              </dt>
              <dd className="mt-1">{inquiry.projectType}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase">
                Budget
              </dt>
              <dd className="mt-1">{inquiry.budget || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase">
                Email delivery
              </dt>
              <dd className="mt-1">{inquiry.emailDeliveryStatus}</dd>
            </div>
            {inquiry.emailProviderMessageId ? (
              <div>
                <dt className="text-muted-foreground text-xs uppercase">
                  Provider message
                </dt>
                <dd className="mt-1 font-mono text-xs break-all">
                  {inquiry.emailProviderMessageId}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground text-xs uppercase">
                Workflow
              </dt>
              <dd className="mt-1 capitalize">{inquiry.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs uppercase">
                Last updated
              </dt>
              <dd className="mt-1">
                <time dateTime={inquiry.updatedAt.toISOString()}>
                  {inquiry.updatedAt.toLocaleString("en-GB")}
                </time>
              </dd>
            </div>
          </dl>
          <ActionForm
            action={updateInquiryStatusAction}
            className="mt-6"
            submitLabel="Update status"
          >
            <input type="hidden" name="id" value={inquiry.id} />
            <Field label="Workflow status">
              <Select name="status" defaultValue={inquiry.status}>
                <option value="received">Received</option>
                <option value="contacted">Contacted</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
          </ActionForm>
          {inquiry.emailDeliveryStatus === "failed" ||
          inquiry.emailDeliveryStatus === "not_requested" ? (
            <ActionForm
              action={retryInquiryNotificationAction}
              className="mt-5"
              submitLabel="Retry notification"
            >
              <input type="hidden" name="id" value={inquiry.id} />
              <p className="text-muted-foreground text-sm">
                Retry only after confirming the Resend sender and recipient.
              </p>
            </ActionForm>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

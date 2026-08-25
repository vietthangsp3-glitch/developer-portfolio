import {
  deleteServiceAction,
  saveServiceAction,
} from "@/features/admin/actions/cms";
import { ActionForm } from "@/features/admin/components/action-form";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { DeleteControl } from "@/features/admin/components/delete-control";
import {
  Checkbox,
  Field,
  FormSection,
  TextArea,
  TextInput,
} from "@/features/admin/components/form-controls";
import { requireAdmin } from "@/server/auth/session";
import { listAdminServices } from "@/server/dal/cms";

function ServiceFields({
  service,
}: {
  service?: Awaited<ReturnType<typeof listAdminServices>>[number];
}) {
  return (
    <>
      {service ? <input type="hidden" name="id" value={service.id} /> : null}
      <FormSection title={service ? "Service details" : "New service"}>
        <Field label="Title">
          <TextInput required name="title" defaultValue={service?.title} />
        </Field>
        <Field label="Slug">
          <TextInput required name="slug" defaultValue={service?.slug} />
        </Field>
        <Field label="Summary" wide>
          <TextArea required name="summary" defaultValue={service?.summary} />
        </Field>
        <Field label="Description" wide>
          <TextArea
            required
            name="description"
            defaultValue={service?.description}
          />
        </Field>
        <Field label="Order">
          <TextInput
            required
            type="number"
            min={0}
            name="sortOrder"
            defaultValue={service?.sortOrder ?? 0}
          />
        </Field>
        <Checkbox
          label="Published"
          name="published"
          defaultChecked={service?.published}
        />
        <Field label="SEO title">
          <TextInput name="seoTitle" defaultValue={service?.seoTitle ?? ""} />
        </Field>
        <Field label="SEO description">
          <TextArea
            name="seoDescription"
            defaultValue={service?.seoDescription ?? ""}
          />
        </Field>
      </FormSection>
    </>
  );
}

export default async function AdminServicesPage() {
  await requireAdmin();
  const services = await listAdminServices();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Services"
        description="Manage public service descriptions, ordering, and publication state."
      />
      <div className="mt-8 space-y-8">
        {services.map((service) => (
          <section key={service.id} className="border-border border p-5">
            <ActionForm action={saveServiceAction}>
              <ServiceFields service={service} />
            </ActionForm>
            <div className="mt-5">
              <DeleteControl
                action={deleteServiceAction}
                id={service.id}
                label="service"
                disabledReason={
                  service.published
                    ? "Unpublish this service before deleting it."
                    : undefined
                }
              />
            </div>
          </section>
        ))}
        <section className="border-border border p-5">
          <ActionForm action={saveServiceAction} submitLabel="Create service">
            <ServiceFields />
          </ActionForm>
        </section>
      </div>
    </div>
  );
}

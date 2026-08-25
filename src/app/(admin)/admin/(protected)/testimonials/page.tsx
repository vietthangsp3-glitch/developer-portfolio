import {
  deleteTestimonialAction,
  saveTestimonialAction,
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
import { listAdminTestimonials } from "@/server/dal/cms";

function TestimonialFields({
  item,
}: {
  item?: Awaited<ReturnType<typeof listAdminTestimonials>>[number];
}) {
  return (
    <>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <FormSection title={item ? "Testimonial details" : "New testimonial"}>
        <Field label="Person">
          <TextInput
            required
            name="personName"
            defaultValue={item?.personName}
          />
        </Field>
        <Field label="Role">
          <TextInput required name="role" defaultValue={item?.role} />
        </Field>
        <Field label="Company">
          <TextInput required name="company" defaultValue={item?.company} />
        </Field>
        <Field label="Order">
          <TextInput
            required
            type="number"
            min={0}
            name="sortOrder"
            defaultValue={item?.sortOrder ?? 0}
          />
        </Field>
        <Field label="Quote" wide>
          <TextArea required name="quote" defaultValue={item?.quote} />
        </Field>
        <Field label="Avatar media ID">
          <TextInput
            name="avatarMediaId"
            defaultValue={item?.avatarMediaId ?? ""}
          />
        </Field>
        <Checkbox
          label="Demo / pre-launch content"
          name="isDemo"
          defaultChecked={item?.isDemo}
        />
        <Checkbox
          label="Published"
          name="published"
          defaultChecked={item?.published}
        />
      </FormSection>
    </>
  );
}

export default async function AdminTestimonialsPage() {
  await requireAdmin();
  const items = await listAdminTestimonials();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Testimonials"
        description="Only verified, non-demo testimonials can appear publicly."
      />
      <div className="mt-8 space-y-8">
        {items.length ? (
          items.map((item) => (
            <section key={item.id} className="border-border border p-5">
              <ActionForm action={saveTestimonialAction}>
                <TestimonialFields item={item} />
              </ActionForm>
              <div className="mt-5">
                <DeleteControl
                  action={deleteTestimonialAction}
                  id={item.id}
                  label="testimonial"
                />
              </div>
            </section>
          ))
        ) : (
          <div className="border-border text-muted-foreground border py-10 text-center text-sm">
            No testimonials yet.
          </div>
        )}
        <section className="border-border border p-5">
          <ActionForm
            action={saveTestimonialAction}
            submitLabel="Create testimonial"
          >
            <TestimonialFields />
          </ActionForm>
        </section>
      </div>
    </div>
  );
}

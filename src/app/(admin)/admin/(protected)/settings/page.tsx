import { saveSettingsAction } from "@/features/admin/actions/cms";
import { ActionForm } from "@/features/admin/components/action-form";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
  Field,
  FormSection,
  TextArea,
  TextInput,
} from "@/features/admin/components/form-controls";
import { requireAdmin } from "@/server/auth/session";
import { getAdminSiteSettings } from "@/server/dal/cms";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getAdminSiteSettings();
  return (
    <div>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Site settings"
        description="Manage the typed public identity, availability, contact, social, and SEO defaults."
      />
      <ActionForm action={saveSettingsAction} className="mt-8 space-y-8">
        <FormSection title="Site identity">
          <Field label="Site name">
            <TextInput
              required
              name="siteName"
              defaultValue={settings?.siteName}
            />
          </Field>
          <Field label="Site title">
            <TextInput
              required
              name="siteTitle"
              defaultValue={settings?.siteTitle}
            />
          </Field>
          <Field label="Description" wide>
            <TextArea
              required
              name="siteDescription"
              defaultValue={settings?.siteDescription}
            />
          </Field>
          <Field label="Availability" wide>
            <TextInput
              required
              name="availability"
              defaultValue={settings?.availability}
            />
          </Field>
          <Field label="Contact email">
            <TextInput
              required
              type="email"
              name="contactEmail"
              defaultValue={settings?.contactEmail}
            />
          </Field>
        </FormSection>
        <FormSection title="Social links">
          <Field label="Links" hint="Label | https://url, one per line" wide>
            <TextArea
              name="socialLinks"
              defaultValue={settings?.socialLinks
                .map((link) => `${link.label} | ${link.url}`)
                .join("\n")}
            />
          </Field>
        </FormSection>
        <FormSection title="SEO defaults">
          <Field label="SEO title">
            <TextInput
              required
              name="seoTitle"
              defaultValue={settings?.seoTitle}
            />
          </Field>
          <Field label="SEO description">
            <TextArea
              required
              name="seoDescription"
              defaultValue={settings?.seoDescription}
            />
          </Field>
        </FormSection>
      </ActionForm>
    </div>
  );
}

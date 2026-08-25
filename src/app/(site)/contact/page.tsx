import type { Metadata } from "next";

import { PageIntro } from "@/components/layout/page-intro";
import { Container } from "@/components/ui/container";
import { ContactForm } from "@/features/inquiries/components/contact-form";
import { getResolvedPublicSiteSettings } from "@/server/dal/public";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a conversation about a website, digital product, or interactive project.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getResolvedPublicSiteSettings();
  return (
    <main id="main-content" tabIndex={-1}>
      <PageIntro
        label="Contact / Enquiry"
        title="Start with the real question."
        description="Share the context, the ambition, and where the current experience falls short. A thoughtful first note is enough."
      />
      <section className="pb-section">
        <Container>
          <div className="grid grid-cols-4 gap-x-4 gap-y-16 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
            <aside className="col-span-4 md:col-span-2 lg:col-span-3">
              <p className="text-label text-muted-foreground font-mono uppercase">
                Direct contact
              </p>
              <a
                className="mt-4 inline-block break-all underline underline-offset-4"
                href={`mailto:${settings.contactEmail}`}
              >
                {settings.contactEmail}
              </a>
              <p className="text-muted-foreground mt-5 max-w-[24ch] text-sm">
                {settings.availability}. Replies are typically considered within
                two working days.
              </p>
            </aside>
            <ContactForm />
          </div>
        </Container>
      </section>
    </main>
  );
}

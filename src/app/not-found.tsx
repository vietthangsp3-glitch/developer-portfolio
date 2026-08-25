import { Container } from "@/components/ui/container";
import { TextLink } from "@/components/ui/text-link";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="py-section flex min-h-[70vh] items-center"
    >
      <Container>
        <div className="border-border grid grid-cols-4 gap-x-4 gap-y-8 border-t pt-5 md:grid-cols-8 md:gap-x-6 lg:grid-cols-12">
          <p className="text-label text-accent col-span-2 font-mono uppercase">
            Error / 404
          </p>
          <div className="col-span-4 md:col-span-6 md:col-start-3 lg:col-span-7 lg:col-start-6">
            <h1 className="text-heading font-medium text-balance">
              This page is not part of the index.
            </h1>
            <p className="text-lead text-muted-foreground mt-6 max-w-[48ch]">
              The address may have changed, or the page may not exist yet.
            </p>
            <TextLink className="mt-8" href="/">
              Return home
            </TextLink>
          </div>
        </div>
      </Container>
    </main>
  );
}

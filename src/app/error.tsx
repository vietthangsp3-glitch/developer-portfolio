"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function Error({ retry }: { retry: () => void }) {
  return (
    <main
      id="main-content"
      className="py-section flex min-h-[70vh] items-center"
    >
      <Container>
        <div className="max-w-reading border-border border-t pt-5">
          <p className="text-label text-accent font-mono uppercase">
            Unexpected error
          </p>
          <h1 className="text-heading mt-6 font-medium text-balance">
            Something interrupted the page.
          </h1>
          <p className="text-lead text-muted-foreground mt-6 max-w-[52ch]">
            Try loading this part of the site again. If the problem continues,
            return to the homepage.
          </p>
          <Button className="mt-8" onClick={retry}>
            Try again
          </Button>
        </div>
      </Container>
    </main>
  );
}

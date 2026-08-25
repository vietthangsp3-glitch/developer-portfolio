# Phased Implementation Plan

Each phase requires explicit user approval. A phase is complete only when its acceptance criteria pass; do not begin the next phase automatically.

## Planning/bootstrap — complete in this change

- Inspect the repository, current configuration, project instructions, and Next.js 16 local documentation.
- Finalize application structure, dependency policy, design tokens, visual/motion direction, data/auth/security/media/email/SEO/performance architecture.
- Replace `AGENTS.md` with permanent project instructions while retaining the Next.js-generated rules.
- Record this phased plan.

No application UI, dependency installation, database setup, or major configuration change belongs to this phase.

## Phase 1 — foundation and static shell — complete

Goal: establish a clean, production-ready visual and engineering foundation without building homepage content sections or advanced motion.

### Scope

1. Move the route tree from `app/` to `src/app/`; update `@/*` to `./src/*`; establish `(site)` route group without changing public URLs.
2. Replace starter metadata and assets with centralized typed site configuration placeholders that are clearly marked for owner-provided values.
3. Implement the semantic color, typography, spacing, grid, radius, focus, and motion tokens from the architecture in Tailwind v4/global CSS.
4. Configure Geist and Geist Mono through `next/font`; create the base document, body, selection, link, focus, reduced-motion, and accessibility styles.
5. Build only foundational primitives with immediate use: `Container`, `Section`, `SectionLabel`, `Button`/`TextLink`, and `VisuallyHidden`.
6. Build the public root layout, skip link, restrained desktop navigation, accessible mobile navigation, and footer.
7. Add accessible `not-found`, `error`, and `global-error` foundations. Add loading UI only if a real asynchronous boundary exists.
8. Add `.env.example` with safe documented placeholders and validate that `.gitignore` excludes secrets.
9. Add Prettier plus Tailwind plugin and scripts. Add Vitest only if Phase 1 has meaningful token/config/interactive-menu units to test; do not add empty test machinery.
10. Rewrite README with purpose, prerequisites, commands, architecture links, environment setup, and phase status.
11. Apply only immediately necessary `next.config.ts` hardening; do not preconfigure Cloudinary, auth, CSP, or database behavior before those exist.

### Explicit exclusions

- No homepage hero, work grid, capability content, about content, testimonials, or contact form.
- No GSAP, Lenis, Motion, Three.js, database, authentication, admin, Cloudinary, Resend, analytics, or speculative API routes.
- No theme switcher and no large visual asset production.

### Acceptance criteria

- Navigation and footer are semantic, keyboard accessible, responsive, and visually aligned with the defined system.
- Design tokens are reusable and raw values are not duplicated through components.
- Server Components remain the default; the mobile-menu client boundary is minimal.
- The layout has no horizontal overflow at 360, 768, 1024, 1440, and 1920px.
- `npm run lint`, strict type checking, relevant tests, and `npm run build` pass.
- No starter copy/assets remain in rendered UI and no unapproved dependency is installed.

## Phase 2 — static public content and case studies

Status: completed 2026-08-24. Phase 3 remains gated pending user approval.

Goal: make the static design excellent before animation or CMS integration.

- Implement homepage sections: hero, selected work, capabilities, featured case study, about, technologies, testimonials, and contact CTA using typed local fixture data.
- Implement `/work`, `/work/[slug]`, `/about`, `/services`, and `/contact` static routes.
- Establish project/case-study schemas and presentational components without database coupling.
- Use final-quality content structure, responsive media placeholders, semantic headings, and strong empty/fallback states.
- Add component tests for interactive UI and render-critical schemas.

Acceptance: all public routes and local slugs render; visual hierarchy works without animation; content is readable with CSS/JS disabled as applicable; no generic card-wall treatment.

## Phase 3 — responsive and accessibility refinement

Status: completed 2026-08-24. Phase 4 remains gated pending user approval.

Goal: intentionally compose every breakpoint before motion increases QA complexity.

- Audit mobile navigation, grids, typography, touch targets, media crops, long content, and landscape/tablet behavior.
- Test keyboard navigation, focus order, zoom/reflow, contrast, screen-reader labels, reduced-motion baseline, and form semantics.
- Add Playwright and representative responsive/keyboard smoke tests.
- Fix CLS risks and establish responsive image `sizes` contracts with local fixtures.

Acceptance: no horizontal overflow or hover dependency; WCAG 2.2 AA issues found by automated and manual checks are resolved or documented; supported viewport smoke tests pass.

## Phase 4 — selective motion

Status: completed 2026-08-24. Phase 5 remains gated pending user approval.

Focused refinement: the approved post-phase review replaces the generic hero
statement with an identity-led, configured-name composition and adds an
accessible, dependency-free, pointer-only word scramble. This refinement does
not open Phase 5 scope.

Selected Work refinement: the homepage project presentation uses a connected
dark technical grid with masked background imagery and equivalent hover/focus
feedback. Its entrance motion is reduced to avoid competing with interaction;
the `/work` index and Phase 5 scope remain unchanged.

Approved visual-system refinement: all public routes now share one restrained
dark-charcoal theme and a wider visual shell while retaining capped reading
widths. Selected Work uses compact, near-connected cells with a subtle grid gap;
this remains a Phase 4 presentation refinement and does not open Phase 5.

Background-depth refinement: the public route group uses one static, fixed CSS
dot-grid and ambient layer behind scrolling content. The layer is decorative,
pointer-transparent, dependency-free, and intentionally has no parallax or new
animation lifecycle.

Goal: add restrained Kiran-inspired choreography to the finished static design.

- Install GSAP and Lenis only.
- Build a small motion boundary and shared reveal primitives/tokens.
- Implement the three approved moments: hero reveal, selected-work interactions, featured-case-study transition.
- Add subtle shared section reveals only where they improve hierarchy; omit
  count-up behavior because the current content has no meaningful statistic.
- Synchronize Lenis/ScrollTrigger without duplicate RAF loops; clean up on navigation.
- Provide complete reduced-motion and native-scroll fallbacks; dynamically load heavy animation paths.

Acceptance: motion never blocks content/navigation, reduced-motion presents final states, keyboard states match hover intent, no cleanup leaks, and performance remains within budget. Do not add Motion or Three.js unless separately approved.

## Phase 5 — Neon and backend foundation

Status: completed 2026-08-24. The initial migration was applied and verified on
the user-confirmed non-production Neon development branch. Phase 6 remains
gated pending user approval.

Goal: establish the secure, CMS-ready data foundation without changing the
approved public site or beginning authentication/admin UI.

- Install Drizzle ORM/Kit, Neon serverless driver, Zod, `server-only`, dotenv,
  and the TypeScript seed runner only.
- Add lazy validated server environment and a Neon HTTP Drizzle client under
  `src/server`; static fixture-driven routes remain database-independent.
- Define projects, technologies, project media, provider-neutral media assets,
  services, non-demo testimonials, inquiries, one structured settings row,
  audit logs, and fixed-window rate-limit tables.
- Use generated UUID identities, unique slugs, timezone-aware timestamps,
  database-managed update timestamps, useful indexes, enum/check constraints,
  and explicit foreign-key deletion behavior.
- Preserve the existing case-study block contract in versioned JSONB and
  validate it before writes and after database reads.
- Add server-only public DAL reads returning minimal DTOs. Do not wire public
  pages or introduce cache semantics until the database-backed presentation
  phase is approved.
- Add a parameterized atomic PostgreSQL rate-limit primitive and caller-supplied
  HMAC identifier helper without activating contact submission.
- Generate and review the initial migration; add a guarded, idempotent
  development seed that excludes placeholder testimonials.

Acceptance: schema generation/check passes without a connection; migration SQL
is reviewable; validation/DTO/HMAC/window tests pass; the public production build
and E2E suite remain unchanged. Applying migrations or seeds requires explicit
confirmation of a non-production branch.

## Phase 6 — authentication and admin foundation

Status: implemented 2026-08-24. Auth migrations were applied to the
user-confirmed Neon development branch. The guarded initial-admin bootstrap and
authenticated dashboard/logout browser QA were verified against that branch.

Goal: add secure administrator access and the protected application shell on top
of the Phase 5 data foundation, without starting CMS CRUD.

- Install Better Auth and generate/review its supported Drizzle schema.
- Implement email/password login, disabled public registration, database
  sessions, explicit admin role, trusted origins, and secure cookie settings.
- Add optimistic `src/proxy.ts` navigation redirects plus authoritative
  session/role checks in pages, DAL methods, and every Server Action.
- Build a compact responsive admin shell, real database overview counts, and
  explicit placeholder routes for projects, services, testimonials, inquiries,
  media, and settings.
- Reuse the PostgreSQL/HMAC login limiter, record redacted login/logout audit
  events, and provide a guarded official-CLI initial administrator bootstrap.
- Defer all content editors, CRUD actions, media workflows, and public database
  integration to later approved work.

Acceptance: unauthenticated/non-admin access fails server-side; public signup is
disabled; login/logout, safe return URLs, persistent login limiting, admin-only
dashboard data, noindex metadata, and responsive navigation are covered without
adding a CMS editor.

## Phase 7 — CMS, media, and public database integration

Status: implemented 2026-08-25. The six approved projects and four services were
imported into the confirmed Neon development branch. Demo testimonials remain
excluded. Signed Cloudinary upload, provider-response verification, Neon media
registration, reference checks, and provider/database deletion were live-tested
against the configured development account.

Goal: turn the protected shell into the practical content system and make Neon
the public source of truth.

- Implement authenticated project, service, testimonial, inquiry, media, and
  structured singleton-settings management with Zod, DAL authorization, audit
  events, and safe destructive confirmations.
- Preserve the versioned structured case-study model with accessible add,
  remove, edit, and reorder controls; keep project technology/media relations.
- Configure signed direct Cloudinary uploads, server-verified response metadata,
  fixed namespace/limits, alt text, reference-aware deletion, and `next/image`
  remote patterns without adding an SDK.
- Import the six fixture projects and service content idempotently while
  excluding fictional testimonials, then remove fixture imports from runtime
  public pages.
- Cache published DTO reads for one hour and immediately invalidate relevant
  tags/paths after CMS mutations. Drafts, archives, demo testimonials, inquiry
  bodies, and security metadata never cross public boundaries.
- Keep public contact submission, Resend, and inquiry email delivery deferred by
  the explicit user phase gate.

Acceptance: unauthorized mutations fail closed; CMS validation/publication,
slug uniqueness, structured content, media boundaries, audit events, and draft/
demo exclusion are covered. Authenticated browser QA proves create, publish,
public visibility, update, archive, and deletion without public visual regressions.

## Phase 8 — SEO, security, accessibility, and performance hardening

Status: implemented 2026-08-25. Contact delivery is active against the confirmed
Neon development branch. Resend remains environment-gated pending verified
sender credentials; local/E2E behavior safely stores without outbound email.

Goal: harden the complete feature set based on the real runtime surface.

- Activate the accessible contact Server Action with shared Zod validation,
  honeypot, privacy-preserving atomic rate limiting, DB-first persistence,
  optional Resend notification, delivery state, and safe user feedback.
- Add private inquiry filtering, detail workflow, restore, email status/manual
  retry, and redacted audit events without public cache invalidation.
- Complete Metadata API, canonical URLs, published-project metadata, OG/Twitter images, sitemap, robots, manifest, and accurate JSON-LD.
- Add security headers and a report-only CSP with the final provider allowlist; enforce only after reports and preview/production testing are clean.
- Review CSRF/origin handling, redirects, upload boundaries, authorization/IDOR, DTOs, secret exposure, logs, and dependency advisories.
- Run bundle analysis, image/font audits, Core Web Vitals profiling, and animation performance testing.
- Defer Vercel Analytics because no approved measurement goal/privacy disclosure
  currently justifies its client script.

Acceptance: production-like Lighthouse targets are met or evidence-backed exceptions recorded; metadata validates; admin is noindex; CSP/security headers do not break Next.js or providers; critical a11y/security findings are closed.

Measured local production evidence (2026-08-25): Chrome DevTools recorded
desktop LCP 556 ms / CLS 0.00 and a 390 px mobile Fast-4G, 4× CPU trace at
LCP 827 ms / CLS 0.00. Mobile Lighthouse scored accessibility 100 and best
practices 100. Local SEO scored 69 solely under the intentional fail-closed
`noindex` policy; the ≥95 SEO launch target requires an HTTPS Vercel production
deployment with the canonical origin before it can be truthfully validated.
The trace found 28.5 kB potential below-fold image savings and 37 ms forced
reflow with no estimated LCP/FCP savings, so neither justified a visual or motion
change in this phase. CSP remains report-only pending real preview/production
reports.

## Phase 9 — visual QA and deployment

Goal: ship a verified production release.

- Cross-browser and real-device QA across mobile, tablet, laptop, desktop, and large desktop.
- Validate error, empty, loading, offline/provider-failure, long-content, and reduced-motion states.
- Run full unit/integration/e2e suite, lint, strict types, and production build.
- Validate Vercel preview/production environment separation, Neon branches/migrations, Cloudinary restrictions, optional all-or-none Resend configuration, auth origin/cookies, backups, and rollback procedure.
- Perform final content, link, privacy, SEO, accessibility, and performance review.

Acceptance: critical user/admin flows pass in production-like conditions; deployment and rollback are documented; no secrets or draft/private material are exposed.

Repository readiness adds a fail-closed production environment preflight,
target-confirmed production content import and admin bootstrap, the launch and
recovery runbook, seven-width responsive coverage, provider asset-render
verification, error/metadata endpoint checks, and security-header assertions. A
real deployment remains gated on an explicitly identified Vercel project,
dedicated production Neon branch, and canonical HTTPS origin. A verified Resend
sender is recommended but optional.

Final local production evidence (2026-08-25): 36 unit/component tests and 18
Chromium E2E tests pass, including authenticated CMS/cache flows and a real
signed Cloudinary upload/render/delete cycle. Lighthouse 13.4.1 scored mobile
94/100/100/69 and desktop 96/100/100/69 for
performance/accessibility/best-practices/SEO. Mobile LCP was 1.72 s, desktop LCP
588 ms, and CLS was 0.00 in both. Local SEO remains 69 only because the required
fail-closed `noindex` policy is active. Firefox/WebKit binaries and a real
indexable production origin were unavailable, so those checks remain launch
gates rather than inferred passes. CSP remains report-only pending real
preview/production observation.

### Focused production hardening follow-up

Status: implemented 2026-08-25 without adding product features or deploying.

- Project rows and their technology/media relations commit through one Neon
  HTTP batch transaction with canonical technology slugs.
- Authenticated E2E is isolated behind an explicit development confirmation,
  exact Neon-host match, and required admin credentials; public E2E remains the
  safe default.
- Resend is optional in production but retains all-or-none validation. Public
  settings drive site identity metadata, shell contact/availability, and the
  Contact page through one cached fallback-aware resolver.
- Malformed admin UUIDs stop before DAL queries; bounded request readers no
  longer trust `Content-Length`; expired rate-limit rows are removed in small,
  time-gated batches.
- Media deletion atomically removes only an unreferenced DB row before provider
  deletion and restores metadata if provider deletion fails. CSP remains
  report-only until real deployment reports are clean.

## Post-launch gate — optional 3D evaluation

Only after Phase 9 measurements, decide whether one lazy-loaded WebGL enhancement materially improves the hero or a single showcase. Approval requires a clear creative concept, bundle/performance budget, mobile/reduced-motion/non-WebGL fallback, and evidence it does not lower usability or SEO. Default decision: do not add it.

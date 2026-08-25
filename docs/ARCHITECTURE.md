# Developer Portfolio Architecture

Status: approved blueprint with Phase 9 repository production safeguards implemented  
Baseline inspected: 2026-08-24  
Runtime baseline: Next.js 16.3.2, React 19.2.8, TypeScript 5, Tailwind CSS 4

## 1. Architectural outcome

This is one Next.js application deployed to Vercel, with two intentionally different surfaces:

- A public, content-led portfolio optimized for static delivery, SEO, accessibility, and small client bundles.
- A private, utility-led admin CMS optimized for safe content management rather than visual spectacle.

Neon PostgreSQL is the system of record. Drizzle owns application schema and queries. Better Auth owns admin authentication and database sessions. Resend optionally sends inquiry notifications when a complete verified sender is configured. Cloudinary stores and transforms portfolio media. Server Components render by default; narrowly scoped Client Components provide forms, menus, and motion.

The public site must work without JavaScript for reading and navigation wherever Next.js permits. Animation is progressive enhancement. Admin mutations and contact submission use Server Actions; explicit HTTP endpoints exist only where a provider or protocol requires them.

## 2. Repository assessment

The repository now has its approved public experience and Phase 6 auth/admin foundation:

- `src/app/` is the only App Router tree; the root starter `app/` directory has been removed.
- The `(site)` route group owns the public shell without changing public URLs.
- Semantic design tokens, Geist typography, shared UI primitives, responsive navigation/footer, and error foundations are implemented.
- The homepage and all public routes use centralized typed fixtures; six static case studies render through a discriminated content-block model.
- Local generated project media is delivered through `next/image` with explicit aspect ratios and responsive `sizes`.
- Editorial project layouts alternate wide and standard media contracts without changing the typed content model.
- Playwright separates safe public/read-only coverage from authenticated mutations. The admin suite refuses production and requires explicit development confirmation, credentials, and an exact expected Neon hostname.
- GSAP is dynamically imported inside scoped leaf Client Components for the hero, selected-projects, and closing-contact reveals.
- The homepage hero is an identity-led first viewport: the configured owner name forms the primary visual object, while compact role, introduction, and selected-work metadata provide context without agency-style sales framing.
- Each major hero-name word owns a small dependency-free scramble island. The visual layer is ignored by assistive technology, retains stable width, runs only for precise hover pointers, and always resolves to the original text.
- The homepage is a one-page portfolio ordered Hero, About, Selected Projects,
  Services, Technology, Testimonials, and Contact. About, Services, and Contact
  are addressable by stable anchors; only featured projects appear on the
  homepage. Both Selected Projects and the scalable `/projects` index use the
  dark connected technical grid with masked imagery and equivalent hover/focus
  clarification.
- Lenis is a progressive desktop wheel-scroll enhancement, synchronized through GSAP's ticker and disabled for reduced motion and coarse pointers.
- Automated browser coverage verifies the animated hero settles, reduced-motion content remains final and navigable, and the homepage produces no runtime errors.
- `tsconfig.json` is strict and maps `@/*` to `src/*`.
- `next.config.ts` removes the identifying `X-Powered-By` header and uses Next.js's documented TypeScript compiler-API fallback because the CLI checker cannot capture output under the current Node 24 runtime.
- Development tooling includes Prettier, Vitest/Testing Library, and Playwright; runtime dependencies add only GSAP and Lenis for the approved motion phase.
- `.env.example` documents the public canonical origin plus pooled runtime and direct migration Neon connection names without credentials.
- Neon HTTP and Drizzle now provide a lazy server-only database client, normalized application schema, generated migration, validation schemas, minimal public DTOs, DAL reads, atomic rate-limit primitive, and guarded development seed.
- Public project/service/settings reads use cached Neon DTOs. Better Auth, CMS
  mutations, the database-first contact pipeline, optional Resend notification,
  SEO metadata routes, and report-only CSP are active. Cloudinary and Resend stay
  behind complete environment credential gates; analytics and Three.js remain
  deferred.

## 3. Final folder structure

Folders are created only when their phase begins; this is the intended mature tree, not a request to add empty placeholders.

```text
.
├── docs/                         # architecture, implementation, production runbook
├── drizzle/                      # reviewed SQL migrations and metadata
├── public/images/                # local fallback and seeded project media
├── scripts/                      # guarded production/auth commands
├── src/
│   ├── app/
│   │   ├── (site)/               # public pages and shell
│   │   ├── (admin)/admin/
│   │   │   ├── login/            # only public admin route
│   │   │   └── (protected)/      # dashboard and CMS routes
│   │   ├── api/
│   │   │   ├── auth/[...all]/
│   │   │   ├── csp-report/
│   │   │   └── media/sign/
│   │   ├── error.tsx
│   │   ├── global-error.tsx
│   │   ├── globals.css
│   │   ├── icon.svg
│   │   ├── layout.tsx
│   │   ├── manifest.ts
│   │   ├── not-found.tsx
│   │   ├── robots.ts
│   │   └── sitemap.ts
│   ├── components/               # shared animation, layout, SEO, and UI primitives
│   ├── config/                   # environment, production, site, SEO, and fonts
│   ├── features/                 # admin, auth, content, home, inquiries, media,
│   │                             # projects, services, settings, testimonials, audit
│   ├── lib/                      # cross-feature validation
│   ├── server/
│   │   ├── auth/
│   │   ├── dal/
│   │   ├── db/schema/
│   │   ├── email/
│   │   ├── media/
│   │   ├── rate-limit/
│   │   └── security/
│   └── proxy.ts
├── tests/                         # Vitest plus split public/admin Playwright suites
├── playwright.config.ts          # public/read-only E2E
├── playwright.admin.config.ts    # guarded authenticated/mutating E2E
├── drizzle.config.ts
├── next.config.ts
└── package.json
```

`src/components` contains genuinely shared UI. Feature-specific components remain inside their feature. `src/server` is a `server-only` boundary and owns secrets, database access, auth verification, email, media signing, and abuse prevention. Route files stay thin.

## 4. Routes and rendering

### Public routes

- `/`: canonical one-page portfolio with cached featured projects, published
  services/testimonials, and the contact Server Action at `#contact`.
- `/projects`: cached index of every published project.
- `/projects/[slug]`: published case study or `notFound()`; metadata derives
  from a safe project SEO DTO.
- `/work`, `/work/[slug]`, `/about`, `/services`, and `/contact` are permanent
  compatibility redirects to their canonical project or homepage-anchor URLs.

Public project pages use Server Components and direct DAL calls. Admin publication mutations invalidate the project list, affected slug, sitemap, and homepage tags/paths. Draft projects never appear in public queries or metadata.

### Admin routes

- `/admin/login` is the only unauthenticated admin page.
- `/admin` and nested CMS pages verify a real database session and `admin` role close to their data access.
- `src/proxy.ts` may redirect visitors lacking a session cookie, but this is optimistic UX only. It must not be the authorization boundary.
- Admin pages are dynamic, private, `noindex`, and never placed in public caches.

### Mutation boundary

Use Server Actions for same-origin contact and CMS forms. Each action performs this sequence:

1. Parse and normalize untrusted input.
2. Apply Zod validation.
3. Apply rate limiting if applicable.
4. Authenticate and authorize if private.
5. Call a `server-only` service/DAL function inside a transaction where needed.
   Project content and all technology/media relations use one Neon HTTP batch
   transaction; audit and cache invalidation occur only after it succeeds.
6. Write an audit event for admin mutations.
7. Invalidate relevant cache paths/tags only after commit.
8. Return a small discriminated result with safe messages.

Use Route Handlers for Better Auth's required catch-all endpoint, signed Cloudinary HTTP contracts, and future verified provider webhooks. Server Components never fetch the app's own Route Handlers.

## 5. Dependency decisions

### Already required and retained

| Dependency                             | Responsibility                             |
| -------------------------------------- | ------------------------------------------ |
| `next`, `react`, `react-dom`           | Application/runtime foundation.            |
| `tailwindcss`, `@tailwindcss/postcss`  | Tailwind v4 styling and token consumption. |
| `typescript`, React/Node type packages | Strict static typing.                      |
| `eslint`, `eslint-config-next`         | Framework and accessibility lint baseline. |

### Add only in the phase that first uses it

| Dependency                                                           | Phase | Reason                                                                        |
| -------------------------------------------------------------------- | ----- | ----------------------------------------------------------------------------- |
| `gsap`                                                               | 4     | Timelines, ScrollTrigger, hero and section choreography.                      |
| `lenis`                                                              | 4     | Small native-scroll enhancement synchronized with GSAP.                       |
| `drizzle-orm`                                                        | 5     | Typed, SQL-forward, serverless-ready ORM with low abstraction cost.           |
| `@neondatabase/serverless`                                           | 5     | Neon-supported serverless PostgreSQL driver.                                  |
| `server-only`                                                        | 5     | Build-time guard around database, environment, and DAL modules.               |
| `better-auth`                                                        | 6     | Mature email/password authentication and database-backed sessions.            |
| `zod`                                                                | 5     | Shared runtime validation for env, content schemas, forms, and action inputs. |
| `resend`                                                             | 8     | Focused, typed inquiry-notification client.                                   |
| `drizzle-kit` (dev)                                                  | 5     | Generated, reviewable PostgreSQL migrations.                                  |
| `dotenv`, `tsx` (dev)                                                | 5     | Load CLI environment and run the guarded TypeScript development seed.         |
| `prettier`, `prettier-plugin-tailwindcss` (dev)                      | 1     | Deterministic formatting and Tailwind class ordering.                         |
| `vitest` (dev)                                                       | 1     | Fast unit tests for tokens/config/utilities; expands with features.           |
| `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` (dev) | 2     | Accessible component behavior tests.                                          |
| `@playwright/test` (dev)                                             | 3     | Responsive and critical-flow browser verification.                            |

Zod is installed in Phase 5 unless Phase 1 implements runtime environment parsing; it may be pulled forward only for that concrete use.

### Explicitly deferred or rejected

- `motion` / `framer-motion`: not selected initially. CSS covers simple state transitions and GSAP covers choreographed motion. Reconsider only if a real presence/layout transition is awkward in both.
- `three`, `@react-three/fiber`, `@react-three/drei`: prohibited until the post-Phase-9 evaluation.
- `cloudinary`: no SDK initially. Use Web Crypto/Node crypto plus `fetch` for signed upload/destroy requests and Cloudinary delivery URLs. Add the SDK only if verified asset-management requirements justify it.
- Form/state stacks (`react-hook-form`, TanStack Query), component kits, icon libraries, carousel libraries, `clsx`, `tailwind-merge`, and CVA: unnecessary for the baseline.
- Separate rate-limit vendor/package: an atomic PostgreSQL limiter is sufficient for expected portfolio traffic. Re-evaluate managed Redis only if measured abuse or scale warrants another service.
- Heavy analytics and tag managers: rejected. Add Vercel Analytics only after consent/privacy review and only if useful.

Versions will be pinned through the lockfile when installed; installation must use current mutually compatible stable releases and pass a production build.

## 6. Design system

### Visual direction

The site takes Kobe Michael's discipline rather than surface decoration: oversized but readable typography, numbered/editorial sections, asymmetrical grid moments, large media, thin dividers, concise metadata, generous negative space, and projects treated as the primary proof. Its independent identity comes from a restrained dark-charcoal palette, controlled rust accent, precise engineering annotations, and a quieter rhythm.

Kiran Naragund contributes only selective motion language: masked line reveals, staggered metadata, count-up statistics, image crop/scale reactions, and carefully sequenced section entrances. Exclude Kiran's loader, custom cursor, many themes, chart-heavy UI, complex page wipes, and animation density.

### Color tokens

The approved public-site baseline is a single dark theme. It uses lifted charcoal surfaces rather than pure black, with soft off-white type and quiet structural contrast. Theme switching remains out of scope.

A single decorative fixed layer sits behind the public route group. CSS radial
gradients create a low-contrast dot matrix and faint cool-neutral ambient
variation; a mask softens the pattern toward the viewport edges. The layer is
non-interactive and stationary. Public section wrappers remain transparent so
the layer reads as one continuous canvas; spacing, type hierarchy, and thin
rules provide section separation. Opaque or semi-opaque surfaces are reserved
for functional UI such as project panels, form controls, dialogs, and media
fallbacks. It does not use scroll listeners, canvas, image assets, or parallax.

```css
--background: #111310; /* near-black charcoal canvas */
--surface: #171a17; /* subtly lifted section/card surface */
--surface-strong: #1e221e; /* hover and inset regions */
--foreground: #f1efe8; /* soft off-white primary type */
--muted: #292d28; /* quiet fills */
--muted-foreground: #a7aca3; /* supporting copy */
--border: #363b35; /* structural rules */
--accent: #d07151; /* controlled rust */
--accent-foreground: #15120f; /* dark type on accent */
--focus: #75a7ff; /* unmistakable accessible focus */
--danger: #ff8b82;
--success: #7fc99d;
```

Rust is used for key actions, active indicators, small editorial marks, and occasional project emphasis—not large decorative washes. Focus blue is functional and need not match the brand accent. All text pairings require WCAG AA validation at their actual size and weight.

### Typography

- Display/body: Geist via `next/font`; one family reduces font requests and creates cohesion.
- Technical labels: Geist Mono, already available through `next/font`, used sparingly.
- Display range: `clamp(3.5rem, 10vw, 9.5rem)`, line-height `0.88–0.96`, tracking `-0.055em` to `-0.035em` depending on size.
- H1 secondary pages: `clamp(3rem, 7vw, 7rem)`.
- H2: `clamp(2.25rem, 5vw, 5rem)`.
- H3: `clamp(1.4rem, 2vw, 2rem)`.
- Lead: `clamp(1.125rem, 1.6vw, 1.5rem)`, line-height `1.45`.
- Body: `clamp(1rem, 0.4vw + 0.9rem, 1.125rem)`, line-height `1.65`.
- Label: `0.75–0.8125rem`, uppercase only for short metadata, tracking `0.08em–0.12em`.

Avoid ultra-light body weights. Use 400 for body, 500 for controls/labels, and 500–600 for display where optical balance requires it. Cap prose at approximately 65 characters.

### Grid, spacing, shape, and depth

- Breakpoints are content-led; verify at 360, 768, 1024, 1440, and 1920 CSS pixels.
- Desktop: 12 columns; tablet: 8; mobile: 4. Page gutters use `clamp(1rem, 2.5vw, 3rem)`.
- The wide shell may reach 1920px and otherwise fills the viewport inside its gutters. Reading columns remain capped at 720px so prose does not inherit the visual shell width.
- Base spacing unit: 4px. Semantic sequence: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, with fluid section spacing `clamp(5rem, 10vw, 10rem)`.
- Corners: mostly 0–8px; pills only for status/tags/compact actions. Do not turn every region into a rounded card.
- Depth comes primarily from layering, cropping, borders, and contrast. Shadows are rare and soft.
- Dividers and indices establish rhythm. Project layouts alternate without sacrificing predictable scanning.

### Core primitives

Build only reusable primitives with demonstrated use: `Container`, `Section`, `SectionLabel`, `Heading`, `TextLink`, `Button`, `Tag`, `ProjectMedia`, `FormField`, `Textarea`, `Select`, `FormStatus`, and `VisuallyHidden`. Navigation, footer, project cards, and admin controls are composed patterns rather than an all-purpose component framework.

## 7. Motion architecture

### Responsibility split

- CSS: links, buttons, focus, menu icon, small image transforms, and color/opacity transitions.
- GSAP: hero timeline, masked text lines, selected-project reveals, coordinated
  contact reveal, and ScrollTrigger behavior.
- Lenis: optional smooth-scroll enhancement on capable devices; native scroll remains the fallback.

Do not use JavaScript for motion that CSS expresses cleanly. GSAP code lives in leaf Client Components and is dynamically imported where this prevents unrelated routes from receiving it.

### Motion tokens

```css
--duration-instant: 120ms;
--duration-fast: 200ms;
--duration-base: 360ms;
--duration-slow: 700ms;
--duration-cinematic: 1100ms;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
--ease-expo: cubic-bezier(0.16, 1, 0.3, 1);
--stagger-tight: 40ms;
--stagger-base: 80ms;
```

### Homepage motion moments

1. Hero: a single load sequence revealing the configured owner name as two masked lines, then role, introduction, and selected-work cue. Each name word may scramble independently on precise pointer hover. No blocking preloader.
2. Selected projects: technical cells react with restrained image clarity/scale
   and metadata movement; keyboard focus receives the equivalent state.
3. Contact: the closing section uses the shared subtle reveal without a pinned
   or scroll-linked takeover.

The implemented motion layer leaves About, Services, Technology, and
Testimonials static; only the closing Contact section uses the shared subtle
reveal. Statistics remain static because the current content has no value that
benefits from interpolation. No custom cursor, scroll hijacking, endless loops,
or mobile-only spectacle.

The hero uses a roughly one-second two-line name reveal followed by metadata and
the projects cue. Its dependency-free character scramble preserves the original
accessible text, does not change layout width, and never runs on touch/coarse
pointers or reduced motion. Selected-project cells use a short image fade plus
restrained metadata translation; CSS independently owns hover/focus blur,
opacity, and scale so the entrance timeline never overrides interaction state.
Every animated element is present in its readable final state before JavaScript
runs.

Reduced-motion mode disables Lenis, scrub/pin effects, parallax, count-up interpolation, and stagger delays. It presents final states immediately while retaining small functional focus/color feedback. GSAP uses scoped contexts and cleanup; Lenis and ScrollTrigger share one ticker where introduced.

## 8. Backend and database

### Database choice

Choose Drizzle over Prisma. Drizzle better matches a small serverless application: it is SQL-forward, has a smaller runtime surface, integrates directly with Neon's serverless driver, keeps migrations reviewable, and avoids a generated client engine. The tradeoff is more explicit query/relation code, which is desirable for this limited schema.

Use separate Neon branches/databases for local development, preview/staging, and production. Vercel environments receive scoped secrets. Production schema changes are migration-only and run once as a deployment operation—not opportunistically during a request.

Before any production mutation, `production:check` validates a complete HTTPS
origin, exact auth-origin alignment, a matched Neon pooled/direct pair, distinct
auth/HMAC secrets, complete Cloudinary configuration, and either a complete
Resend configuration or none without printing secret values. Initial content
import and administrator bootstrap each require
their own production confirmation plus the exact expected Neon hostname. The
operator sequence and recovery path live in `docs/PRODUCTION_RUNBOOK.md`.

### Tables

Better Auth manages `user`, `session`, `account`, and `verification` tables using its current Drizzle schema. Add `role` (default non-admin), `banned`, and timestamps only through supported auth schema customization.

Application tables:

- `projects`: UUID, unique slug, editorial fields, `draft|published|archived`
  status, nullable featured rank, ordering, thumbnail/hero media references,
  versioned case-study JSONB, safe external URLs, SEO fields, and publication and
  audit timestamps.
- `technologies`: reusable UUID-backed technology records with unique names and
  slugs; `project_technologies` supplies the ordered many-to-many relationship.
- `project_media`: ordered project-to-asset relationship with
  `cover|hero|gallery|case_study` role, optional alt override, and caption.
- `media_assets`: provider-neutral UUID record with provider/key, delivery URL,
  dimensions, format, bytes, alt text, optional folder, and timestamps. Later
  Cloudinary integration populates this contract without changing project rows.
- `services`: unique slug, summary/details, ordering, publication flag, SEO
  fields, and timestamps.
- `testimonials`: person, role/company, quote, optional avatar asset,
  publication/demo flags, ordering, and timestamps. Public reads exclude demo
  records even if incorrectly marked published.
- `inquiries`: bounded contact fields, workflow status, separate email delivery
  state/provider message ID, source, optional HMAC network identifier, optional
  short user-agent excerpt, read timestamp, and audit timestamps.
- `site_settings`: one explicit structured row for identity, availability,
  contact email, validated social links, and SEO defaults.
- `audit_logs`: nullable future actor UUID, action, entity type/UUID, validated
  redacted metadata JSONB, and creation timestamp.
- `rate_limits`: scope plus HMAC identifier plus fixed-window start as a
  composite primary key, request count, and expiry timestamp.

Phase 5 implements eleven application tables; Phase 6 adds Better Auth's
`user`, `session`, `account`, and `verification` tables. UUIDs use database-generated
`gen_random_uuid()` defaults; public routes use slugs only as alternate unique
identifiers. All temporal columns are timezone-aware and mutable entities share
a migration-owned `updated_at` trigger.

Runtime queries use Drizzle's Neon HTTP driver with the pooled `DATABASE_URL`,
which suits one-shot serverless reads. Drizzle Kit prefers
`DATABASE_URL_UNPOOLED` for migration operations and falls back to
`DATABASE_URL` only when necessary. The client and environment are initialized
lazily, so unrelated static routes do not require a database at build time.

`site_settings` is one constrained structured row rather than an open-ended
key/value CMS: explicit columns cover identity, availability, contact, social
links, and SEO defaults, while the fixed `default` key enforces the singleton.
One cached resolver applies these values to public metadata, JSON-LD, header,
footer, and Contact, with `src/config/site.ts` as the static fallback.
Auth-linked actor/creator columns remain nullable and now reference Better Auth's
user table with `ON DELETE SET NULL`, preserving audit/content history.

Indexes cover public project status/published date, featured rank/order,
category, project media order, service/testimonial publication and order,
inquiry status/created date, audit actor/date and entity/date, and rate-limit
expiry. Better Auth indexes cover account/user lookup, session user/expiry, and
verification identifiers. Foreign-key
deletion behavior is explicit: cascade project join rows, restrict assets still
in use, and retain/redact audit records.

### Structured case studies

`caseStudyContent` is versioned JSON validated by a discriminated Zod union. It
stores no arbitrary HTML, scripts, inline styles, or executable embeds. This
preserves layout control and enables migrations as content evolves.

The version-one schema exactly preserves the current narrative,
image, quote, stats, and technical-summary block contracts. Seeds wrap fixture
blocks in `{ version: 1, blocks }`; public detail mapping validates the JSONB
again when it crosses the database boundary.

## 9. Authentication and admin

Better Auth 1.7 uses email/password with eight-hour database sessions through
its Drizzle adapter and Admin plugin. Public registration is disabled. The first
administrator is created by a guarded official CLI command that prompts for the
password and refuses production execution.

- Passwords use Better Auth's maintained password hashing defaults; never implement hashing locally.
- Cookies are HTTP-only, secure in production, host-only, SameSite Lax, and use explicit expiry/rotation.
- Configure a fixed base URL and allowlisted trusted origins; never disable origin checks or allow arbitrary callback URLs.
- Login messages do not reveal whether an email exists.
- Login uses a tighter atomic rate limit keyed by HMAC(network identifier + normalized email), plus audit events for meaningful failures/successes.
- Better Auth IP tracking is disabled so its optional session column never stores
  raw network addresses; the HMAC limiter remains the abuse-control source.
- A validated session and `admin` role are required within every private DAL method/action, not only at proxy/page/layout level.
- `src/proxy.ts` checks only the namespaced session-cookie presence and preserves
  a local `/admin` return path; it never replaces database authorization.
- Better Auth is mounted only at `/api/auth/[...all]`. The sign-in endpoint is
  wrapped by the existing atomic limiter, while signup stays disabled.
- Admin list/detail DTOs exclude auth tokens, password material, provider data, and secrets.
- Admin pages carry `noindex, nofollow`, avoid public caching, and have a visually separate compact design system based on the same tokens.

## 10. Contact, rate limiting, email, and media

### Contact flow

`FormData → normalize → Zod → honeypot → atomic rate limit → store inquiry → optionally attempt Resend notification → safe result`.

The stored inquiry is authoritative. With Resend disabled, it records
`not_requested` and remains fully manageable in admin. A transient provider
failure records `failed` and permits an explicit audited retry. When enabled,
the notification is plain text, sent from a verified domain, and uses the
validated visitor email as `replyTo`. No confirmation email is sent to the visitor.

### Atomic rate limiting

Use a short fixed-window Postgres upsert keyed by `scope`, HMAC identifier, and window start. A single `INSERT ... ON CONFLICT ... DO UPDATE ... WHERE count < limit RETURNING` decides admission atomically. Contact allows four validated attempts per 15 minutes. On Vercel, the platform-supplied `x-vercel-forwarded-for` value is immediately HMAC-derived and discarded; local development uses one synthetic identity. No raw IP is stored or logged. Apply separate policies to login, media signing, and other sensitive mutations. Expired rows are opportunistically deleted in batches of at most 250, gated to one attempt per five minutes per runtime instance. Return generic errors and `Retry-After` where the transport supports it.

### Cloudinary media

Admin requests a narrow server signature for a predetermined folder and transformation contract, then uploads directly to Cloudinary to avoid routing large files through Vercel. The server records the returned asset only after validating the signed response/public ID. Deletion first atomically removes only an unreferenced database row, so new foreign-key references cannot attach, then deletes the provider asset. Provider failure restores the database metadata; an unlikely restore conflict can still leave an unreferenced provider orphan for manual reconciliation, never a published broken database reference. Destruction and metadata changes are server-only.

Allow JPEG, PNG, WebP, and AVIF; verify signature/content rather than trusting browser MIME. Initial limits: 10 MB, 600–6000px per dimension, images only. Reject SVG and active formats. Generate safe public IDs, strip or avoid sensitive metadata, require meaningful alt text before publication, store dimensions, and deliver through configured `next/image` `remotePatterns` with responsive `sizes` and transformations.

## 11. Security architecture

- Validate all action, URL, query, header, and provider payloads. Normalize emails/URLs/text and enforce maximum lengths before persistence.
- Use parameterized Drizzle queries and transactions. No SQL string concatenation with user data.
- React escaping is the default XSS defense; structured content is rendered by an allowlisted component map. Never use `dangerouslySetInnerHTML` for CMS content.
- Server-only modules own secrets and return minimal DTOs. Consider React tainting as defense in depth only after stable-version verification; it never replaces DTO filtering.
- Verify authentication, role, and resource authorization at the mutation/DAL boundary to prevent IDOR.
- Restrict outbound URLs to `https:` (plus intentional development exceptions), use `rel="noopener noreferrer"` for new tabs, and allowlist internal redirect targets.
- Cloudinary signing and deletion remain server-only; uploads are constrained as described above.
- Log structured error IDs server-side and show generic errors publicly. Redact PII and secrets. Do not log contact message bodies or credentials.
- Security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, restrictive `Permissions-Policy`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, and HSTS after HTTPS-only verification.
- CSP is report-only with explicit same-origin and Cloudinary allowances, a
  bounded same-origin report endpoint, and no client allowance for Resend or
  analytics. It remains report-only until preview and production reports are
  clean. Nonce CSP is rejected because Next.js 16 documents that it forces
  dynamic rendering and disables static optimization.
- Keep dependencies minimal, lock versions, review advisories, and rotate compromised secrets. `.env*` stays ignored; `.env.example` contains names and safe descriptions only.

## 12. SEO, accessibility, and performance

### SEO

- Root Metadata API config uses `metadataBase`, a title template, default description, canonical, Open Graph, and Twitter metadata from `src/config/site.ts`.
- Project metadata is generated only from published DTOs and uses a project-specific social image when available.
- `robots.ts` disallows all crawling outside an explicit HTTPS Vercel production
  deployment and disallows admin/API routes in production. `sitemap.ts` includes
  public static routes and database-backed published projects only.
- JSON-LD is limited to accurate `Person`/`WebSite` data and `CreativeWork`/`SoftwareApplication` where a project genuinely fits. Serialize safely and never include claims not visible on-page.
- Use semantic headings, crawlable links, descriptive alt text, and meaningful case-study copy. Admin is `noindex`.

### Accessibility

Target WCAG 2.2 AA: semantic landmarks, skip link, logical headings, keyboard-complete controls, persistent focus visibility, 44px touch targets where practical, labeled inputs, associated errors, live form status, sufficient contrast, and no hover-only content. Decorative images receive empty alt text; project imagery receives editorial alt text. Reduced motion is a first-class mode.

### Performance budgets

- Targets: Lighthouse performance ≥90 and accessibility/best-practices/SEO ≥95 on representative production pages, backed by measurement.
- LCP: one correctly sized priority hero asset at most; self-hosted `next/font`; no preloader; reserve media space.
- CLS: explicit image dimensions/aspect ratios, stable type metrics, no post-load injected banners.
- INP: small client islands, no site-wide state store, no unnecessary animation libraries, bounded scroll work.
- JavaScript: public static sections are Server Components; GSAP/Lenis load only where used; admin code is route-split from public pages.
- Images: Cloudinary transformations plus `next/image`, accurate `sizes`, modern formats, lazy loading below the fold, conservative quality.
- Third parties: no analytics until selected; no client-side email/database SDKs; no Three.js baseline.

Measure mobile and desktop production builds, inspect route bundle output, and test real low-power/mobile conditions in addition to Lighthouse.

## 13. Error handling and observability

Provide accessible `not-found`, route `error`, `global-error`, and targeted `loading` UI. Avoid loading screens for content that can render statically. Server errors receive a correlation ID and redacted structured log; users receive an actionable generic message. Admin operations show success/failure state without leaking database/provider errors.

Vercel runtime logs are the initial observability layer. Add Sentry or another client telemetry SDK only after real operational need and privacy/bundle review. Vercel Analytics was evaluated in Phase 8 and remains deferred: there is no approved measurement goal or privacy disclosure that justifies another client script yet.

## 14. Deliberate non-decisions

- No theme switcher or alternate light theme in the baseline.
- No internationalization until content requires it.
- No public account system.
- No generic CMS/rich-text editor in the first admin version; structured fields/blocks come first.
- No separate API service, queue, Redis, object store, or global state library without measured need.
- No Three.js decision until after Phase 9 deployment verification.

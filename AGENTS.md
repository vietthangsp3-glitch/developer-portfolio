<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Developer Portfolio: permanent project instructions

## Mission and phase gate

Build a production-quality personal developer portfolio for international freelance clients. The result must feel premium, editorial, restrained, fast, accessible, secure, and credible as both a design artifact and an engineering case study.

Work only in the phase the user has approved. Do not begin a later phase, install deferred packages, add speculative abstractions, or introduce Three.js without explicit approval. The source of truth for decisions is `docs/ARCHITECTURE.md`; the delivery sequence and acceptance criteria live in `docs/IMPLEMENTATION_PLAN.md`.

## Required preflight

Before changing application code:

1. Read this file, `CLAUDE.md`, `README.md`, `package.json`, and the relevant sections of `docs/ARCHITECTURE.md` and `docs/IMPLEMENTATION_PLAN.md`.
2. Inspect `git status` and preserve user changes.
3. Read the relevant local Next.js 16 guide in `node_modules/next/dist/docs/` before using or changing a framework API. Do not rely on older Next.js conventions.
4. Confirm the current phase and avoid unrelated cleanup.

## Product and visual rules

- English copy must be concise, confident, specific, and human. Avoid generic AI/SaaS phrases.
- Visual direction is 75–80% Kobe Michael: typographic hierarchy, editorial composition, generous spacing, restrained palette, project-first storytelling, and quiet polish.
- Motion direction is 20–25% Kiran Naragund: selective staggered reveals, scroll choreography, statistics, and project interactions. Do not copy either reference.
- Keep the experience 80% professional and 20% expressive. Limit the homepage to three major moments: hero reveal, selected-work interaction, and featured-case-study transition.
- Use the single dark-charcoal theme and controlled rust accent defined in the architecture. Do not add theme switching, pure-black expanses, glassmorphism, pervasive gradients, decorative dashboards, custom cursors, preloaders, or 3D in the approved baseline.
- Mobile is an intentionally composed layout, not a scaled desktop design. Never make essential information hover-only.

## Architecture boundaries

- Use the Next.js App Router under `src/app`. Public pages live in `(site)` and admin pages in `(admin)` route groups.
- Prefer Server Components. Add `"use client"` only at the smallest interactive or animation boundary. Never turn a page or layout into a Client Component merely to animate a descendant.
- Pages compose features and sections; they do not contain database queries or large content objects.
- Feature code belongs in `src/features/<feature>`. Cross-feature primitives belong in `src/components`; server infrastructure belongs in `src/server`; shared configuration belongs in `src/config`.
- Import server modules through `server-only` boundaries. Do not import database, auth, email, media, rate-limit, or environment modules into Client Components.
- Access PostgreSQL through the Drizzle data-access layer. Return minimal DTOs rather than raw rows. Do not mix ORMs or query the app's own Route Handlers from Server Components.
- Server Actions handle first-party form mutations. Route Handlers are reserved for Better Auth, signed media operations/webhooks, or endpoints that require an HTTP contract.
- Treat every Server Action and Route Handler as a public endpoint: validate input and re-check authentication/authorization inside it. Proxy and layout checks are navigation conveniences, not security boundaries.
- On Next.js 16 use `src/proxy.ts`, not `middleware.ts`. Keep proxy logic fast and optimistic; enforce admin access again in the DAL/actions.

## Data, content, and cache rules

- Neon PostgreSQL plus Drizzle is the only application database/ORM pair.
- Better Auth owns its user, account, session, and verification schema. Public self-registration is disabled; only explicit admin accounts may access the CMS.
- Project case-study content is structured JSON validated by Zod. Never render arbitrary stored HTML. Plain text is escaped by React; any future rich-text renderer must use an allowlisted schema.
- All schema changes require generated, reviewed, committed migrations. Never use schema push against production.
- Use unique slugs, foreign keys, intentional deletion behavior, and indexes documented in the architecture.
- Public reads may be cached and invalidated after admin mutations. Admin/session/inquiry reads are always private and uncached. Adopt Next.js 16 cache APIs only after reading the installed-version guide and testing invalidation.
- Centralize site identity, navigation, contact details, and SEO defaults in `src/config/site.ts`.

## Styling and component rules

- Tailwind CSS v4 and CSS custom properties are the styling foundation. Keep semantic tokens in `src/app/globals.css` and map them through `@theme inline`.
- Use Geist for display and body typography; Geist Mono is limited to labels, indices, years, and technical metadata. Do not add a second downloaded family without a measured design need.
- Consume semantic tokens (`background`, `surface`, `foreground`, `muted`, `border`, `accent`) instead of scattering raw color values.
- Use fluid `clamp()` type/space tokens, a 12-column desktop grid, and the documented content widths.
- Components must remain focused, typed, composable, and accessible. Split a component when it owns multiple independent responsibilities; do not create one-use abstraction layers preemptively.
- Use native semantic elements first. Preserve visible focus, correct button/link semantics, labels, logical heading order, sufficient contrast, and keyboard operation.

## Motion and performance rules

- CSS handles hover, focus, opacity, and simple transforms. GSAP + ScrollTrigger handles timelines and scroll choreography. Lenis handles optional enhanced scrolling. Do not install Motion unless a later implementation proves it necessary.
- Dynamically load animation code where practical and keep it out of static sections. Animate `transform` and `opacity`; avoid layout-triggering properties.
- Respect `prefers-reduced-motion`. Content and navigation must remain complete when animations and smooth scrolling are disabled.
- Clean up GSAP contexts, ScrollTriggers, timers, observers, listeners, and Lenis instances during unmount/navigation.
- Do not add Three.js, React Three Fiber, or Drei before the post-launch evaluation gate. Any approved 3D must be one lazy-loaded enhancement with a non-WebGL fallback.
- Protect Core Web Vitals: use `next/font`, `next/image`, explicit media dimensions/aspect ratios, responsive sizes, restrained priority loading, Server Components, and minimal client JavaScript.

## Security and external services

- Validate environment variables server-side. Only variables intentionally exposed to browsers may use the `NEXT_PUBLIC_` prefix.
- Never expose or log `DATABASE_URL`, `BETTER_AUTH_SECRET`, `RESEND_API_KEY`, `CLOUDINARY_API_SECRET`, or rate-limit HMAC secrets.
- Contact and login flows require server validation, normalized inputs, generic error messages, honeypot/timing checks where appropriate, and atomic rate limits. Store only an HMAC of a normalized network identifier when abuse tracking is needed; never store a raw IP.
- Cloudinary uploads must be signed server-side and restricted by allowlisted type, verified content, byte size, dimensions, and destination folder. Persist public IDs and metadata, not secret delivery credentials.
- Add security headers deliberately. Start CSP in report-only mode, account for Next.js/Vercel/Cloudinary/analytics sources, then enforce after production verification. Do not adopt nonce CSP for the public site because it would force dynamic rendering.
- Audit logs record admin mutations and security-relevant events without secrets, passwords, session tokens, message bodies, or raw IPs.

## Verification and completion

- Run the checks appropriate to the touched scope. The baseline is `npm run lint`, strict type checking, relevant tests, and `npm run build` before a phase is called complete.
- Add automated coverage alongside behavior: unit tests for schemas/utilities, integration tests for DAL/actions, and Playwright for critical public/admin flows.
- Verify responsive layouts, keyboard use, reduced motion, error/empty/loading states, metadata, and failure paths—not only the happy path.
- Do not claim Lighthouse or accessibility targets without measuring a production build.
- Update architecture/plan documentation when an approved decision changes, and explain the reason. Stop at the phase gate and wait for approval before proceeding.

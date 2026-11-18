# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

This file defines project context, architectural conventions, verification
requirements, Git rules, and deployment boundaries. Follow applicable nested
`AGENTS.md` files when present. Deployment restrictions apply repository-wide.

## Project

Marketing site and product catalog for VFD (Vladimirskaya Fabrika Dverey),
a door salon and aluminum partition business in Chelyabinsk, Russia.

- Production domain: `https://vfd74.ru`
- Content and product data are primarily in Russian.
- Stack: Astro 7 (`^7.3.2` in `package.json`), Vue 3 islands, and Tailwind CSS v4.
- Verify current dependency versions in `package.json` and the lockfile.
- The site is statically built and deployed to a VPS. The resulting `dist/`
  directory is synchronized to the nginx web root through rsync.

## Operating principles

- Inspect the relevant components, data sources, shared modules, and existing
  patterns before making changes.
- Preserve the existing architecture. Prefer extending established patterns over
  introducing a new approach.
- Check `git status` before editing. Preserve unrelated user changes; never
  revert, overwrite, or discard work you did not create.
- Keep changes focused on the requested task. Do not perform unrelated
  refactoring, formatting churn, dependency upgrades, or speculative cleanup.
- Respond to the user in Russian unless they request another language. Keep code,
  identifiers, comments, commit messages, and technical documentation in English
  unless the repository or user explicitly requires another language.
- Use shared modules for product names, descriptions, prices, calculations,
  image paths, contact details, and other repeated business data. Do not
  duplicate this information in individual components.
- Verify product claims, prices, dates, specifications, and contact information
  against project data. Never invent facts, characteristics, prices, dates, or
  legal details.
- Treat ambiguous requirements as an opportunity to inspect the code first.
  Ask a focused question only when the ambiguity materially affects correctness,
  security, data integrity, SEO, accessibility, or product behavior.
- Clearly distinguish verified results from assumptions. Never claim that a
  command, build, type check, visual check, or deployment succeeded unless it
  actually did.

## Commands

```bash
npm run dev                 # Local Astro development server
npm run build               # Static build into dist/; postbuild performs media checks
npm run preview             # Local preview of the production build
npm run gen:renders         # Generate public/renders/alum-covers/*.webp from public/media
npm run media:sync          # Localize Supabase/cloud media URLs and generate model thumbnails
npm run gen:model-thumbs    # Generate catalog thumbnails in public/renders/models/
npm run gen:responsive      # Generate srcset variants for slides, promos, categories, and baseboard schema
npm run media:check         # Verify that referenced /media/... assets exist in sources and the database
npm run deploy              # git push production main; production deployment action
```

## Supabase and data security

- The shared client is `src/lib/supabase.ts`; do not create duplicate clients in
  pages or components. `@supabase/supabase-js` is already installed.
- The current environment variables are `PUBLIC_SUPABASE_URL` and
  `PUBLIC_SUPABASE_ANON_KEY`. Keep their values only in ignored local environment
  files or deployment environment variables. Never hard-code or log API keys.
- The site queries Supabase while Astro generates static pages. Do not move the
  Supabase client into browser-side Vue code unless the product explicitly needs
  client-side database access and the security implications have been reviewed.
- A publishable or legacy anon key is a low-privilege public identifier, not a
  secret. It must never be treated as the database security boundary. Never put a
  `service_role`, `sb_secret_...`, database password, or other privileged
  credential in client code, a `PUBLIC_...` variable, a committed file, logs, or
  chat output.
- Enable Row Level Security on every table exposed through the Data API. Grant
  `anon` and `authenticated` only the minimum required privileges. Public catalog
  tables may allow the reads needed to build the site; anonymous insert, update,
  and delete access must remain disabled unless explicitly required and reviewed.
- Product catalog facts rendered into static HTML are public by design. Personal,
  operational, and other sensitive data must not be queried into generated pages
  or exposed through anonymous Supabase policies.
- Repository inspection cannot prove the live RLS configuration. When changing
  tables, grants, or policies, verify the live policies and Supabase Security
  Advisor findings before claiming that database access is secure.
- A production build requires network access to Supabase. The Yandex feed refuses
  to publish when Supabase returns no models; preserve this fail-closed behavior.

## Markdoc and related content

- Markdoc tags are defined in `markdoc.config.ts`.
- Use existing tags and components rather than recreating their behavior.
- For article, FAQ, workflow, portfolio, and product content, source facts from
  the site's data modules.
- Verify numerical claims against the relevant module before including them.
- For prices, prefer `linePrices` and `coatingPrices` over hard-coded values.
- Do not invent specifications, availability, dates, guarantees, or legal claims.
- Preserve the factual distinction between the VFD manufacturer and the VFD
  dealer salon in Chelyabinsk.
- Do not present dealer-specific services, prices, stock availability, or
  installation terms as universal manufacturer guarantees.

## SEO

SEO infrastructure is part of the site architecture. Preserve it when changing
pages, routes, metadata, content, or navigation.

### Head and sitemap

- `BaseLayout.astro` centralizes Open Graph and Twitter metadata, canonical URLs,
  favicons, JSON-LD through the `structuredData` prop, font preloading,
  Yandex Metrica, and the Federal Law No. 152 cookie-consent banner.
- `astro.config.mjs` configures `@astrojs/sitemap` with custom `serialize()` and
  `filter()` functions.
- Preserve intentional sitemap rules, including priority and change-frequency
  settings and the exclusion of `/privacy`.
- When adding routes, ensure they are represented consistently in the sitemap
  and metadata model.
- Do not create duplicate canonical URLs, conflicting metadata, or unstable slugs.
- Preserve absolute URLs for canonical links, Open Graph images, and structured
  data where required by the existing implementation.

### Landing pages

- Catalog landing pages under `/catalog/<slug>` use the `DoorCategory` structure
  from `door-categories.ts` and the `DoorCategoryLanding.astro` template.
- Add a new SEO category as a data object, not as a separate page unless it
  requires a real product grid sourced from Supabase.
- Type- and price-based collections such as `/catalog/nedorogie-dveri/`,
  `/catalog/dveri-so-steklom/`, and `/catalog/glukhie-dveri/` are defined as
  objects in `style-categories.ts`.
- Use `cardFilter` fields such as `hasGlass` and `maxPrice`, plus
  `linkGroup: 'type'`, to define these collections.
- In `intro`, `metaTitle`, and `metaDescription`, use the placeholders
  `{count}`, `{models}`, `{minPrice}`, and `{coatings}`.
- `StyleCategoryLanding` fills these placeholders from the active collection.
  Do not hard-code model counts, prices, or coating names.
- For a new catalog landing page, end its slug with `-dveri`; the sitemap
  assigns such URLs a priority of `0.8`.
- Preserve existing Russian-language SEO copy, terminology, and user intent.
- Do not create thin, duplicated, or automatically generated landing pages
  without a clear product or informational purpose.

### Headings

- Keep `<title>` values to approximately 70 characters or fewer, since longer
  titles may be truncated in search results.
- For models, `productTitle()` in `src/lib/product-text.ts` shortens titles
  using a stepped pattern. Do not change `productName`, which is used by the feed.
- Series pages use equivalent title-shortening logic in
  `src/pages/catalog/series/[slug].astro`.
- For portfolio items and articles with long titles, set the optional
  `seoTitle` field in `PortfolioWork` or article frontmatter.
- `seoTitle` is a short `<title>` without the brand suffix; ` | ВФД` is added
  automatically.
- Keep the full `title` as the visible `H1`.
- Maintain a logical heading hierarchy: one primary `H1` per page, meaningful
  `H2` sections, and `H3` only for subsections or card-level headings.
- Do not use heading tags for visual styling alone.

## Internal linking

- `Header` and `Footer` use `client:only` and are absent from static HTML.
- The server-rendered “Site sections” block is
  `src/components/layout/SiteLinks.astro`, included by `BaseLayout`.
- Do not remove `SiteLinks.astro` as duplicate navigation: it provides direct
  server-rendered links to major sections and landing pages.
- Its data source is `src/lib/site-links.ts`.
- Coating, color, and style landing links are derived from `door-categories.ts`,
  `color-categories.ts`, and `style-categories.ts`.
- Hidden-door scenarios and “About the salon” links are listed directly in
  `site-links.ts`.
- Add new top-level pages or new hidden-door scenarios to `site-links.ts`.
- Cross-links between landing pages use `components/ui/RelatedLinks.astro` and
  `relatedLandings()`.
- Model-page recommendations use `components/catalog/RelatedModels.astro` and
  `lib/related-models.ts`.
- Related models use a deterministic window of eight price-adjacent models
  within the same series.
- Each model receives at least four inbound links.
- Related-model data uses the same `ModelEntry` records as the model page and feed.
- Preserve this deterministic linking principle when changing recommendations.
- Use descriptive link text. Avoid generic labels such as “click here” or
  “read more” when a more specific label is available.
- Do not create circular or orphaned navigation structures.

## Analytics

- Yandex Metrica counter ID: `106993554`.
- The delegated click handler in
  `components/analytics/YandexMetrika.astro` sends JavaScript goals only in
  production.
- Existing goal identifiers:

  - `phone_click` — `tel:` links
  - `email_click` — `mailto:` links
  - `telegram_click`
  - `vk_click`
  - `max_click`
  - `whatsapp_click`
  - `route_click` — short Yandex Maps link on the salon card
  - `review_platform_click` — 2GIS or Yandex Maps search links

- To add a new contact-link type, add its identifier to `GOALS`.
- A code change does not create the corresponding Yandex Metrica goal.
- The goal must also be created in Yandex Metrica under
  “Goals → JavaScript event” with the same identifier.
- If a new goal requires Metrica configuration, state that requirement in the
  final response.
- Do not send analytics events in development or preview environments unless the
  existing implementation explicitly supports it.
- Do not expose analytics identifiers, tokens, or private configuration values
  in committed files.

## Styling and typography

- Tailwind CSS v4 is integrated through `@tailwindcss/vite`.
- There is no `tailwind.config.*` file.
- Design tokens are declared through `@theme` in `src/styles/global.css`,
  for example `--color-ink` and `--color-body`.
- Use token-based utilities such as `text-ink` and `bg-ink`.
- Page-specific CSS, such as `src/styles/partitions.css`, is imported directly
  by the page that needs it.
- Do not introduce a global Tailwind configuration file unless the task
  explicitly requires a structural change.

Typography roles:

- Page `H1`: `.t-h1`
- Section `H2`: `.t-h2`; use one consistent size for all sections on a page
- Card headings: `.t-h3`

Do not replace these roles with arbitrary heading sizes such as
`text-3xl md:text-5xl`.

Do not add small eyebrow labels above headings. Eyebrow labels have been removed
site-wide. Communicate status or context through the heading itself or the main
body copy.

Use Russian typography and wording consistently with the existing site. Do not
mix transliteration styles, inconsistent product names, or unofficial brand
wording.

## Buttons and links

- Use the interface palette: graphite, white, and warm gray tones.
- Do not use teal.
- Do not add link underlines.
- Preserve strikethrough styling for previous prices.
- Shared button variants, focus styles, and animations are defined in
  `src/styles/controls.css`.
- For Astro, use `components/ui/Action.astro`.
- For Vue, use the same `.btn` classes.
- Follow `docs/design-system.md`; do not duplicate CTA styling in components.
- Maintain at least 44 px touch targets, support long label wrapping, and respect
  `prefers-reduced-motion`.
- Use meaningful, action-oriented button labels.
- Preserve existing focus-visible behavior and keyboard operability.
- Do not introduce decorative animations that interfere with reading, scrolling,
  or reduced-motion preferences.

## Company details

- `src/lib/contacts-data.ts` is the single source of required company details:
  sole-proprietor legal information, address, business hours, and phone numbers.
- Contacts, footer, and structured data consume this module.
- Update this module rather than duplicating company details in components.
- Do not alter legal information, addresses, phone numbers, working hours, or
  guarantees without a verified source in the repository or explicit user approval.

## Frontend quality

- Follow the existing Astro component structure, Vue island boundaries, Tailwind
  conventions, and design system documented in `docs/design-system.md`.
- Keep client-side JavaScript limited to islands that require interactivity.
- Preserve existing performance practices, including lazy loading, responsive
  images, `srcset`, preloading, and avoidance of unnecessary client JavaScript.
- Maintain accessibility: semantic HTML, keyboard operability, visible focus
  states, sufficient contrast, and respect for `prefers-reduced-motion`.
- Account for responsive layouts and relevant loading, empty, error, and success
  states.
- For user-visible UI changes, inspect the rendered interface with browser tools
  when available. Do not claim visual verification based solely on source review.
- Do not introduce layout shift, horizontal overflow, or broken responsive
  behavior.
- Preserve existing image optimization practices and avoid oversized images.
- Do not add third-party scripts, fonts, trackers, or external services without
  an explicit requirement.

## Git workflow

- Before editing, determine the current branch and inspect the working tree.
- Prefer a focused feature or fix branch for substantive work when appropriate.
- Keep commits small, coherent, and reversible.
- Before committing, inspect the staged diff and ensure it contains only the
  intended changes.
- Use concise, conventional commit messages that describe the actual change.
- Never amend, rebase, force-push, or rewrite shared history without explicit
  permission.
- Never run destructive Git commands, discard changes, reset branches, or delete
  branches without explicit permission.
- Do not commit generated media, build output, dependencies, credentials, or
  temporary files unless the repository convention explicitly requires it.
- Do not push to any remote without explicit user authorization.

## Deployment boundary

**Do not push to the `production` remote or run `npm run deploy` unless the user
explicitly requests deployment in the current conversation.**

A request to fix, build, test, type-check, commit, or push code does not by
itself authorize a production deployment. By default, limit work to local
verification and preview.

`npm run deploy` runs `git push production main`. On the VPS, a `post-receive`
hook checks out `main`, runs `npm ci && npm run build`, and synchronizes `dist/`
to the nginx web root with rsync.

Do not circumvent this boundary by directly running the deployment hook, rsync,
or an equivalent publishing command.

Infrastructure context:

- Hosting provider: HostingRussia, Moscow.
- The project was migrated from Beget after a service disruption in November 2026.
- `deploy/setup-server.sh` is intended for provisioning a new Ubuntu 24.04 VPS.
- DNS is managed through reg.ru.
- This context does not authorize server reinstallation, DNS changes, credential
  rotation, or infrastructure modifications.

## Deployment procedure

When the user explicitly requests deployment:

1. Confirm the intended branch is `main` and inspect `git status`.
2. Run relevant local verification, at minimum `npm run build`; run
   `npm run astro -- check` when its dependencies are available.
3. Inspect the changes that will be deployed.
4. Run `npm run deploy`.
5. Report the command result and any verification performed.
6. Do not claim a successful deployment unless the deployment command completed
   successfully and relevant verification passed.

If verification fails, do not deploy. Report the failure, the affected command,
and the recommended next step.

## Task completion checklist

Before declaring a task complete, verify the applicable items:

- Changes use shared data sources and components rather than duplicating logic.
- New media is localized; required derived assets are generated and included in
  the change when applicable.
- Publication dates, prices, SEO metadata, links, and structured data follow
  the rules above.
- Relevant checks have been performed, especially `npm run build` for site
  changes.
- Type checking has been performed when its dependencies are available.
- No secrets, credentials, temporary files, debug output, or unrelated generated
  artifacts are included in the change.
- Production deployment and server configuration changes occur only after an
  explicit user request.

In the final response, state:

- What changed.
- Which checks were performed and their results.
- Which required actions or checks remain incomplete, if any.

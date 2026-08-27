# <koded_by_keith/>

Phase 1 implementation for Keith Potter’s small-business web-development site.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

## Content architecture

All editable business copy and structured data are kept in `content/`, rather than inside display components:

- `site.ts` — brand, navigation, credentials, homepage messaging, needs, and services
- `packages.ts` — web-build, Website Care, and accessibility pricing
- `privacy.ts` — privacy-page text
- `types.ts` — small TypeScript interfaces shared by content models

Components render those structures, so replacing local TypeScript content with a CMS adapter later does not require a UI rewrite.

## Phase 1 scope

Implemented: homepage, responsive navigation, privacy page, design tokens, replaceable hero portrait, pricing, accessibility positioning, and the keyboard-accessible project-needs selector. The selector carries its choice into the visual contact form.

The contact form is intentionally a visual prototype. It provides client-side validation and shows a local confirmation state, but does not submit information. Google Sheets, server validation, email delivery, spam controls, SEO automation, sitemap, robots, and deployment configuration are reserved for later phases.

## Replace before launch

- Update the portrait referenced by `site.portrait` in `content/site.ts`. The current generated placeholder is `public/images/keith-placeholder.png`.
- Review all copy, pricing, the Y3TI referral URL, and the privacy policy with Keith.

## Environment

Copy `.env.example` to `.env` for local use. `NUXT_PUBLIC_SITE_URL` is used as the public site URL configuration. Phase 3 will add private variables for lead delivery; none are required for this visual phase.

## Accessibility QA

Run the automated WCAG A/AA axe scan with:

```bash
npm run test:a11y
```

The test runner uses locally installed Google Chrome. If Chrome is not installed on a development machine, run `npx playwright install chromium` once.

Automated testing catches only some problems. Before launch, also test keyboard-only navigation, a screen-reader smoke test, 200% zoom, responsive reflow, reduced motion, contrast, invalid form submissions, mobile navigation, and every option in the “What Do You Need?” selector.

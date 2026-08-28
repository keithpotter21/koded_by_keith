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

## Site scope

Implemented: homepage, responsive navigation, privacy page, design tokens, replaceable hero portrait, pricing, accessibility positioning, and the keyboard-accessible project-needs selector. The selector carries its choice into the visual contact form.

The contact form validates in both the browser and on the server. Valid submissions are sent server-side to Google Sheets and a Resend email notification. Until the required environment variables are configured, the form fails safely with a clear email fallback rather than claiming success.

## Replace before launch

- Review all copy, pricing, the Y3TI referral URL, and the privacy policy with Keith.

## Environment

Copy `.env.example` to `.env` for local use. `NUXT_PUBLIC_SITE_URL` is public; every other variable is server-only and must be configured in Netlify before deployment.

## Contact delivery setup

### 1. Create the Google Sheet

Create a sheet named `Leads` with this header row, in order:

```text
Timestamp | Name | Business Name | Email | Phone | Website | Interested In | Message | Source Page | UTM Source | UTM Medium | UTM Campaign | User Agent
```

Open **Extensions → Apps Script**, replace the editor contents with [scripts/google-sheets-contact-form.gs](scripts/google-sheets-contact-form.gs), and save it. In **Project Settings → Script properties**, add `CONTACT_SHARED_SECRET` with a long random value. Deploy it as a **Web app** that executes as you and permits access to anyone. Copy the deployment URL into `GOOGLE_FORM_ENDPOINT`; use the same random value for `GOOGLE_FORM_SECRET`.

### 2. Configure Resend

Create a Resend API key with **Sending access**, restricted to the verified `send.keithpotter.net` domain. Set `RESEND_API_KEY`, `EMAIL_FROM` to `Koded by Keith <hello@send.keithpotter.net>`, and `CONTACT_NOTIFICATION_EMAIL` to `hello@keithpotter.net`. The notification is sent to the address in `CONTACT_NOTIFICATION_EMAIL` and uses the lead’s email as Reply-To.

### 3. Set production variables

Set every non-public variable in the Netlify site’s environment settings. Do not put these values in `NUXT_PUBLIC_*` variables, browser code, or Git.

### Delivery protections

The endpoint has a hidden honeypot, input length limits, allowlisted interest values, server-side validation, request timeouts, and a five-request-per-minute in-memory rate limit per IP. The in-memory limit is a baseline for serverless functions; add a shared edge or Redis rate limiter before high-volume campaigns.

## Accessibility QA

Run the automated WCAG A/AA axe scan with:

```bash
npm run test:a11y
```

The test runner uses locally installed Google Chrome. If Chrome is not installed on a development machine, run `npx playwright install chromium` once.

Automated testing catches only some problems. Before launch, also test keyboard-only navigation, a screen-reader smoke test, 200% zoom, responsive reflow, reduced motion, contrast, invalid form submissions, mobile navigation, and every option in the “What Do You Need?” selector.

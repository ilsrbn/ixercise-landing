# Umami Events Design

Date: 2026-04-29

## Context

Ixercise is a Nuxt 4 landing page with server-side rendering, two locales, a screenshot carousel, outbound GitHub links, and a waitlist form backed by `server/api/waitlist.post.ts`. Umami is already loaded from `https://cloud.umami.is/script.js` in `nuxt.config.ts`, but the site currently records only default pageviews and has no custom event instrumentation.

The goal is to add the most useful landing-page analytics without collecting personal data or adding noisy event streams.

## Recommended Approach

Use focused funnel tracking with privacy-safe event metadata.

This approach tracks the actions that answer practical product questions:

- Which CTA locations drive waitlist intent?
- Do visitors complete the waitlist form successfully?
- Which screenshots attract interaction?
- How much open-source interest comes from the landing page?
- How do English and Ukrainian visitors differ in conversion?

It avoids tracking typed content, user identifiers, high-cardinality values, and excessive low-signal interactions.

## Alternatives Considered

### Minimal Tracking

Track only waitlist success, waitlist error, and outbound GitHub clicks.

This is simple and very privacy-safe, but it misses important context such as CTA location, form attempt rate, and screenshot interest.

### Verbose Tracking

Track every tab view, carousel selection, section visibility, field focus, and external link.

This produces more data, but it is likely too noisy for a compact landing page and can encourage overfitting before the site has enough traffic.

## Event Taxonomy

Use stable snake_case event names and low-cardinality metadata.

### `waitlist_cta_click`

Records a visitor clicking a waitlist CTA before the page scrolls to the form.

Metadata:

- `location`: `"hero"` or `"footer"`
- `locale`: `"en"` or `"ua"`

### `waitlist_submit_attempt`

Records a waitlist form submission attempt before the async request starts.

Metadata:

- `locale`: `"en"` or `"ua"`
- `has_name`: boolean
- `has_note`: boolean

### `waitlist_submit_success`

Records a successful waitlist submission after the API request returns successfully.

Metadata:

- `locale`: `"en"` or `"ua"`
- `has_name`: boolean
- `has_note`: boolean
- `delivery`: `"email"` or `"log"` when available from the API response

### `waitlist_submit_error`

Records a failed waitlist submission after the client receives or infers the failure.

Metadata:

- `locale`: `"en"` or `"ua"`
- `error_type`: `"validation"`, `"network"`, `"server"`, or `"unknown"`

### `github_click`

Records outbound clicks to the Ixercise GitHub repository or related GitHub resources.

Metadata:

- `location`: `"hero"`, `"footer"`, `"footer_nav"`, or `"credit"`
- `locale`: `"en"` or `"ua"`

### `language_switch`

Records a deliberate language change from the language selector.

Metadata:

- `from_locale`: `"en"` or `"ua"`
- `to_locale`: `"en"` or `"ua"`

### `screenshot_select`

Records deliberate screenshot tab selection.

Metadata:

- `screenshot_id`: one of the ids from `screenshotItems`
- `source`: `"tab"`
- `locale`: `"en"` or `"ua"`

Initial implementation should track tab clicks only. Carousel-driven selection changes should be skipped at first because Embla can emit selection changes during initialization, looping, and programmatic scrolls, which would make the event noisy unless user intent is carefully distinguished.

## Metrics

Umami should be used to review:

- Waitlist conversion: `waitlist_submit_success / pageviews`
- CTA effectiveness: `waitlist_cta_click` grouped by `location`
- Form completion: `waitlist_submit_success / waitlist_submit_attempt`
- Failure rate: `waitlist_submit_error / waitlist_submit_attempt`
- Product interest: `screenshot_select` grouped by `screenshot_id`
- Open-source interest: `github_click` grouped by `location`
- Locale performance: conversion grouped by `locale`

## Architecture

Keep the existing Umami script setup in `nuxt.config.ts`, but move the website id into public runtime configuration:

- `NUXT_PUBLIC_UMAMI_WEBSITE_ID`

This keeps production, preview, and local environments configurable without source edits.

Add one client-safe analytics composable:

- `app/composables/useAnalyticsEvent.ts`

The composable should:

- no-op during server-side rendering
- no-op when Umami is unavailable, blocked, or not loaded yet
- expose a typed tracking function with known event names and metadata shapes
- catch and ignore tracking errors

Use explicit calls in `app/pages/index.vue` for dynamic events:

- waitlist CTA clicks
- waitlist submission attempt, success, and error
- language switch
- screenshot tab click
- GitHub outbound clicks where location is known

Simple static outbound links may use either the composable through click handlers or Umami `data-umami-event` attributes. Prefer one consistent pattern in the implementation plan; the composable is preferred for typed metadata and predictable behavior.

Do not add server-side Umami instrumentation for this scope. Client-side form success and failure events are sufficient for the landing-page funnel and avoid adding server analytics credentials or proxy behavior.

## Privacy Requirements

Custom event data must never include:

- email addresses
- names
- note text or any free-form typed content
- user agent strings
- referer strings
- full URLs or raw query strings
- generated visitor identifiers

Allowed custom event data is limited to fixed labels and booleans:

- `locale`
- `location`
- `screenshot_id`
- `source`
- `from_locale`
- `to_locale`
- `has_name`
- `has_note`
- `error_type`
- `delivery`

Do not call `umami.identify`.

## Error Handling

Analytics must never block or alter user-facing behavior.

If Umami is missing, blocked, still loading, or throws an exception, the composable should return without surfacing an error. Waitlist submission, language switching, navigation, and carousel interaction must continue normally.

## Testing And Verification

Because the repo does not currently include a test runner, verification should rely on:

- `npm run build`
- manual browser checks for click and submit paths
- console inspection to confirm analytics failures do not create user-visible errors

Manual checks should cover:

- hero waitlist CTA
- footer waitlist CTA
- GitHub links
- language switch
- screenshot tab selection
- waitlist submit success path
- waitlist submit error path

## Out Of Scope

- Section visibility or scroll-depth tracking
- Field focus or per-field form tracking
- Session identification through `umami.identify`
- Server-side event forwarding
- Collecting user-submitted content
- Adding a separate analytics dashboard inside the app

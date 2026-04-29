# Umami Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add privacy-safe Umami custom events for the Ixercise landing-page funnel.

**Architecture:** Keep Umami loading in Nuxt app head, but make the website id environment-driven. Add one typed client-safe analytics composable, then call it from `app/pages/index.vue` at the CTA, form, language, screenshot, and GitHub interaction points.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, TypeScript, Umami Cloud tracker, Nitro server route for waitlist submission.

---

## File Structure

- Modify `nuxt.config.ts`: move Umami website id from hard-coded script data into `NUXT_PUBLIC_UMAMI_WEBSITE_ID` and public runtime config.
- Modify `.env.example`: document `NUXT_PUBLIC_UMAMI_WEBSITE_ID`.
- Create `app/composables/useAnalyticsEvent.ts`: define allowed event names, allowed metadata shapes, and a safe `trackEvent` function.
- Modify `app/pages/index.vue`: call the composable from existing handlers and add click handlers for CTA/GitHub events.
- No server analytics file is needed. `server/api/waitlist.post.ts` remains the source of waitlist success response data, but it does not send analytics itself.

## Task 1: Configure Umami Website ID From Environment

**Files:**
- Modify: `nuxt.config.ts`
- Modify: `.env.example`

- [ ] **Step 1: Update `nuxt.config.ts` constants**

Replace the current first line:

```ts
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.ixercise.com').replace(/\/$/, '')
```

with:

```ts
const siteUrl = (process.env.NUXT_PUBLIC_SITE_URL || 'https://www.ixercise.com').replace(/\/$/, '')
const umamiWebsiteId = process.env.NUXT_PUBLIC_UMAMI_WEBSITE_ID || ''
```

- [ ] **Step 2: Update the Umami script block**

In `nuxt.config.ts`, replace the current `script` array inside `app.head`:

```ts
      script: [
        {
          src: 'https://cloud.umami.is/script.js',
          defer: true,
          'data-website-id': '1311d774-7582-4a83-a3ef-0a7727699d6c'
        }
      ],
```

with:

```ts
      script: umamiWebsiteId
        ? [
            {
              src: 'https://cloud.umami.is/script.js',
              defer: true,
              'data-website-id': umamiWebsiteId
            }
          ]
        : [],
```

- [ ] **Step 3: Add public runtime config**

In `nuxt.config.ts`, replace the `public` runtime config block:

```ts
    public: {
      waitlistEndpoint: process.env.NUXT_PUBLIC_WAITLIST_ENDPOINT || '',
      siteUrl
    }
```

with:

```ts
    public: {
      waitlistEndpoint: process.env.NUXT_PUBLIC_WAITLIST_ENDPOINT || '',
      siteUrl,
      umamiWebsiteId
    }
```

- [ ] **Step 4: Document the environment variable**

In `.env.example`, add this after `NUXT_PUBLIC_SITE_URL=https://www.ixercise.com`:

```dotenv
NUXT_PUBLIC_UMAMI_WEBSITE_ID=1311d774-7582-4a83-a3ef-0a7727699d6c
```

- [ ] **Step 5: Verify the config builds**

Run:

```bash
npm run build
```

Expected:

```text
Nuxt build completes without TypeScript or config errors.
```

- [ ] **Step 6: Commit**

```bash
git add nuxt.config.ts .env.example
git commit -m "chore: configure umami website id"
```

## Task 2: Add Typed Umami Analytics Composable

**Files:**
- Create: `app/composables/useAnalyticsEvent.ts`

- [ ] **Step 1: Create `app/composables/useAnalyticsEvent.ts`**

Add this complete file:

```ts
type LocaleCode = "en" | "ua";

type WaitlistLocation = "hero" | "footer";
type GithubLocation = "hero" | "footer" | "footer_nav" | "credit";
type WaitlistErrorType = "validation" | "network" | "server" | "unknown";
type WaitlistDelivery = "email" | "log";
type ScreenshotSource = "tab";

type AnalyticsEventPayloads = {
    waitlist_cta_click: {
        location: WaitlistLocation;
        locale: LocaleCode;
    };
    waitlist_submit_attempt: {
        locale: LocaleCode;
        has_name: boolean;
        has_note: boolean;
    };
    waitlist_submit_success: {
        locale: LocaleCode;
        has_name: boolean;
        has_note: boolean;
        delivery?: WaitlistDelivery;
    };
    waitlist_submit_error: {
        locale: LocaleCode;
        error_type: WaitlistErrorType;
    };
    github_click: {
        location: GithubLocation;
        locale: LocaleCode;
    };
    language_switch: {
        from_locale: LocaleCode;
        to_locale: LocaleCode;
    };
    screenshot_select: {
        screenshot_id: string;
        source: ScreenshotSource;
        locale: LocaleCode;
    };
};

type AnalyticsEventName = keyof AnalyticsEventPayloads;

type UmamiTracker = {
    track: (
        eventName: string,
        data?: Record<string, string | number | boolean | undefined>,
    ) => void | Promise<void>;
};

declare global {
    interface Window {
        umami?: UmamiTracker;
    }
}

export function useAnalyticsEvent() {
    function trackEvent<Name extends AnalyticsEventName>(
        eventName: Name,
        data: AnalyticsEventPayloads[Name],
    ) {
        if (import.meta.server) {
            return;
        }

        try {
            window.umami?.track(eventName, data);
        } catch {
            // Analytics must never affect the visitor flow.
        }
    }

    return { trackEvent };
}
```

- [ ] **Step 2: Verify auto-import and global type compilation**

Run:

```bash
npm run build
```

Expected:

```text
Nuxt build completes without TypeScript errors from the new composable.
```

- [ ] **Step 3: Commit**

```bash
git add app/composables/useAnalyticsEvent.ts
git commit -m "feat: add umami analytics composable"
```

## Task 3: Track Waitlist CTA And Form Funnel

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Add analytics helpers in `<script setup>`**

In `app/pages/index.vue`, after the existing `const route = useRoute();`, add:

```ts
const { trackEvent } = useAnalyticsEvent();
```

After the `const waitlistMessage = ref("");` line, add:

```ts
type WaitlistResponse = {
    ok: boolean;
    delivery?: "email" | "log";
    id?: string;
    greetingId?: string;
};

type WaitlistSnapshot = {
    locale: "en" | "ua";
    has_name: boolean;
    has_note: boolean;
};

function getAnalyticsLocale(): "en" | "ua" {
    return currentLocale.value === "ua" ? "ua" : "en";
}

function getWaitlistSnapshot(): WaitlistSnapshot {
    return {
        locale: getAnalyticsLocale(),
        has_name: waitlistForm.name.trim().length > 0,
        has_note: waitlistForm.note.trim().length > 0,
    };
}

function trackWaitlistCta(location: "hero" | "footer") {
    trackEvent("waitlist_cta_click", {
        location,
        locale: getAnalyticsLocale(),
    });
}

function getWaitlistErrorType(error: unknown) {
    const responseStatus =
        typeof error === "object" && error !== null && "response" in error
            ? (error as { response?: { status?: number } }).response?.status
            : undefined;
    const statusCode =
        typeof error === "object" && error !== null && "statusCode" in error
            ? (error as { statusCode?: number }).statusCode
            : undefined;
    const status = statusCode || responseStatus;

    if (status === 400 || status === 422) {
        return "validation";
    }

    if (status && status >= 500) {
        return "server";
    }

    if (!status) {
        return "network";
    }

    return "unknown";
}
```

- [ ] **Step 2: Update `joinWaitlist()`**

Replace the whole `joinWaitlist()` function with:

```ts
async function joinWaitlist() {
    waitlistStatus.value = "idle";
    waitlistMessage.value = "";
    isSubmittingWaitlist.value = true;

    const waitlistSnapshot = getWaitlistSnapshot();

    trackEvent("waitlist_submit_attempt", waitlistSnapshot);

    try {
        const response = await $fetch<WaitlistResponse>(waitlistEndpoint, {
            method: "POST",
            body: {
                name: waitlistForm.name.trim(),
                email: waitlistForm.email.trim(),
                note: waitlistForm.note.trim(),
                company: waitlistForm.company,
            },
        });

        trackEvent("waitlist_submit_success", {
            ...waitlistSnapshot,
            delivery: response.delivery,
        });

        waitlistStatus.value = "success";
        waitlistMessage.value = t("waitlist.success");
        waitlistForm.name = "";
        waitlistForm.email = "";
        waitlistForm.note = "";
    } catch (error) {
        trackEvent("waitlist_submit_error", {
            locale: waitlistSnapshot.locale,
            error_type: getWaitlistErrorType(error),
        });

        waitlistStatus.value = "error";
        waitlistMessage.value = t("waitlist.error");
    } finally {
        isSubmittingWaitlist.value = false;
    }
}
```

- [ ] **Step 3: Track hero CTA click**

Replace the hero waitlist CTA:

```vue
<a class="button button--primary" :href="waitlistTarget">
```

with:

```vue
<a
    class="button button--primary"
    :href="waitlistTarget"
    @click="trackWaitlistCta('hero')"
>
```

- [ ] **Step 4: Track footer CTA click**

Replace the footer waitlist CTA:

```vue
<a class="button button--primary" :href="waitlistTarget">
```

with:

```vue
<a
    class="button button--primary"
    :href="waitlistTarget"
    @click="trackWaitlistCta('footer')"
>
```

There are two waitlist CTA anchors in the file. The first one is in the hero section and should use `"hero"`. The second one is in the footer section and should use `"footer"`.

- [ ] **Step 5: Verify waitlist funnel typing**

Run:

```bash
npm run build
```

Expected:

```text
Nuxt build completes without TypeScript errors from waitlist analytics.
```

- [ ] **Step 6: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat: track waitlist funnel events"
```

## Task 4: Track Language, Screenshot, And GitHub Interactions

**Files:**
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Add interaction tracking helpers**

In `app/pages/index.vue`, after `trackWaitlistCta()`, add:

```ts
function trackGithubClick(
    location: "hero" | "footer" | "footer_nav" | "credit",
) {
    trackEvent("github_click", {
        location,
        locale: getAnalyticsLocale(),
    });
}

function trackScreenshotSelect(screenshotId: string) {
    trackEvent("screenshot_select", {
        screenshot_id: screenshotId,
        source: "tab",
        locale: getAnalyticsLocale(),
    });
}
```

- [ ] **Step 2: Update `switchLanguage()`**

Replace the current `switchLanguage()` function with:

```ts
async function switchLanguage(event: Event) {
    const nextLocale = (event.target as HTMLSelectElement).value;
    const fromLocale = getAnalyticsLocale();
    const toLocale = nextLocale === "ua" ? "ua" : "en";

    if (nextLocale && nextLocale !== currentLocale.value) {
        trackEvent("language_switch", {
            from_locale: fromLocale,
            to_locale: toLocale,
        });

        await $switchLocale(nextLocale);
    }
}
```

- [ ] **Step 3: Update screenshot tab tracking**

Replace the current `scrollToScreenshot()` function:

```ts
function scrollToScreenshot(index: number) {
    activeIndex.value = index;
    screenshotsEmblaApi.value?.scrollTo(index);
}
```

with:

```ts
function scrollToScreenshot(index: number) {
    const screenshot = screenshots.value[index];

    if (screenshot) {
        trackScreenshotSelect(screenshot.id);
    }

    activeIndex.value = index;
    screenshotsEmblaApi.value?.scrollTo(index);
}
```

- [ ] **Step 4: Track hero GitHub click**

In the hero GitHub anchor, add:

```vue
@click="trackGithubClick('hero')"
```

The final opening tag should be:

```vue
<a
    class="button button--secondary"
    :href="githubUrl"
    target="_blank"
    rel="noopener noreferrer"
    @click="trackGithubClick('hero')"
>
```

- [ ] **Step 5: Track footer GitHub click**

In the footer GitHub button anchor, add:

```vue
@click="trackGithubClick('footer')"
```

The final opening tag should be:

```vue
<a
    class="button button--secondary"
    :href="githubUrl"
    target="_blank"
    rel="noopener noreferrer"
    @click="trackGithubClick('footer')"
>
```

- [ ] **Step 6: Track footer nav GitHub links**

Add `@click="trackGithubClick('footer_nav')"` to these footer nav anchors:

```vue
<a
    :href="`${githubUrl}/blob/main/PRIVACY_POLICY.md`"
    target="_blank"
    rel="noopener noreferrer"
    @click="trackGithubClick('footer_nav')"
>
```

```vue
<a
    :href="`${githubUrl}/blob/main/LICENSE`"
    target="_blank"
    rel="noopener noreferrer"
    @click="trackGithubClick('footer_nav')"
>
```

```vue
<a
    :href="githubUrl"
    target="_blank"
    rel="noopener noreferrer"
    @click="trackGithubClick('footer_nav')"
>
```

Do not add `github_click` tracking to the `mailto:` contact link.

- [ ] **Step 7: Track credit GitHub click**

Add `@click="trackGithubClick('credit')"` to the author GitHub link:

```vue
<a
    href="https://github.com/ilsrbn"
    target="_blank"
    rel="noopener noreferrer"
    @click="trackGithubClick('credit')"
    >Ilya Serbin</a
>
```

- [ ] **Step 8: Verify interaction typing**

Run:

```bash
npm run build
```

Expected:

```text
Nuxt build completes without TypeScript or Vue template errors.
```

- [ ] **Step 9: Commit**

```bash
git add app/pages/index.vue
git commit -m "feat: track landing page interaction events"
```

## Task 5: Manual Verification

**Files:**
- No code changes expected.

- [ ] **Step 1: Start the local dev server**

Run:

```bash
npm run dev
```

Expected:

```text
Nuxt dev server starts and prints a local URL.
```

- [ ] **Step 2: Verify the page loads**

Open the local URL from Step 1.

Expected:

```text
The Ixercise landing page loads with no console errors.
```

- [ ] **Step 3: Verify safe no-op behavior without Umami**

If `NUXT_PUBLIC_UMAMI_WEBSITE_ID` is not set locally, click these controls:

- hero waitlist CTA
- footer waitlist CTA
- screenshot tabs
- language selector
- GitHub links

Expected:

```text
All interactions still work. The browser console shows no analytics-related errors.
```

- [ ] **Step 4: Verify form success path**

With local email delivery unconfigured, submit a valid email to the waitlist form.

Expected:

```text
The form shows the success message because the local API returns { ok: true, delivery: "log" } when email delivery is not configured outside production.
```

- [ ] **Step 5: Verify form error path**

Temporarily submit an invalid direct API request in a separate terminal:

```bash
curl -i -X POST http://localhost:3000/api/waitlist \
  -H 'Content-Type: application/json' \
  --data '{"email":"invalid"}'
```

Expected:

```text
The API returns HTTP 400 with "A valid email is required."
```

Then use the browser form normally again.

Expected:

```text
The form still works after the failed API request. The browser console shows no analytics-related errors.
```

- [ ] **Step 6: Stop the dev server**

Press:

```text
Ctrl-C
```

Expected:

```text
The Nuxt dev server exits.
```

- [ ] **Step 7: Final build verification**

Run:

```bash
npm run build
```

Expected:

```text
Nuxt build completes successfully.
```

- [ ] **Step 8: Commit verification note if changes were needed**

If manual verification required code fixes, commit them:

```bash
git add app/pages/index.vue app/composables/useAnalyticsEvent.ts nuxt.config.ts .env.example
git commit -m "fix: stabilize umami event tracking"
```

If no code changes were needed, do not create an empty commit.

## Self-Review

- Spec coverage: the plan covers environment-driven Umami setup, the typed composable, all approved event names, allowed metadata, no server-side analytics, error no-op behavior, and build/manual verification.
- Red-flag scan: no task uses incomplete markers or unspecified "handle later" work.
- Type consistency: event names and metadata keys match the approved design and the composable payload map.

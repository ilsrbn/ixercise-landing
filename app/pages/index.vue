<script setup lang="ts">
import {
    Bell,
    Code,
    Github,
    Globe,
    Heart,
    Languages,
    Lock,
    Mail,
    Moon,
    Repeat,
    Smartphone,
    Timer,
    Wifi,
    X,
} from "lucide-vue-next";
import emblaCarouselVue from "embla-carousel-vue";
import type { EmblaCarouselType } from "embla-carousel";

const githubUrl = "https://github.com/ilsrbn/ixercise";
const contactEmail = "serbini271@gmail.com";
const waitlistTarget = "#waitlist";
const runtimeConfig = useRuntimeConfig();
const waitlistEndpoint =
    runtimeConfig.public.waitlistEndpoint || "/api/waitlist";
const { $t, $getLocale, $getLocales, $switchLocale } = useI18n();
const siteUrl = runtimeConfig.public.siteUrl.replace(/\/$/, "");
const route = useRoute();

function t(key: string) {
    return String($t(key));
}

const currentLocale = computed(() =>
    route.path.split("/").filter(Boolean)[0] === "ua" ? "ua" : $getLocale(),
);
const currentLocaleMeta = computed(() =>
    currentLocale.value === "ua"
        ? { path: "/ua", lang: "uk-UA", ogLocale: "uk_UA" }
        : { path: "/", lang: "en-US", ogLocale: "en_US" },
);
const localeOptions = computed(() =>
    $getLocales().map((locale) => ({
        code: locale.code,
        label: locale.displayName || locale.name || locale.code.toUpperCase(),
    })),
);

function localizeUrl(path: string) {
    return siteUrl ? `${siteUrl}${path}` : path;
}

function screenshotUrl(id: string, width = 400) {
    return `/screenshots/${id}-${width}.webp`;
}

function screenshotSrcset(id: string) {
    return [240, 400, 640]
        .map((width) => `${screenshotUrl(id, width)} ${width}w`)
        .join(", ");
}

async function switchLanguage(event: Event) {
    const nextLocale = (event.target as HTMLSelectElement).value;
    if (nextLocale && nextLocale !== currentLocale.value) {
        await $switchLocale(nextLocale);
    }
}

const heroScreenshots = computed(() => [
    {
        id: "hero-home",
        alt: t("screenshots.hero.homeAlt"),
        url: screenshotUrl("hero-home", 400),
        srcset: screenshotSrcset("hero-home"),
        sizes: "(max-width: 760px) 28vw, 256px",
        className: "phone--side phone--left",
    },
    {
        id: "hero-workout",
        alt: t("screenshots.hero.workoutAlt"),
        url: screenshotUrl("hero-workout", 400),
        srcset: screenshotSrcset("hero-workout"),
        sizes: "(max-width: 760px) 35vw, 320px",
        className: "phone--center",
    },
    {
        id: "hero-rest",
        alt: t("screenshots.hero.restAlt"),
        url: screenshotUrl("hero-rest", 400),
        srcset: screenshotSrcset("hero-rest"),
        sizes: "(max-width: 760px) 28vw, 256px",
        className: "phone--side phone--right",
    },
]);

const notFeatures = computed(() => [
    t("notFeatures.calorieTracking"),
    t("notFeatures.streaks"),
    t("notFeatures.socialFeed"),
    t("notFeatures.videoLessons"),
    t("notFeatures.accountRequired"),
    t("notFeatures.cloudSync"),
    t("notFeatures.analytics"),
]);

const featureItems = [
    {
        icon: Wifi,
        titleKey: "features.offline.title",
        descriptionKey: "features.offline.description",
    },
    {
        icon: Lock,
        titleKey: "features.noAccount.title",
        descriptionKey: "features.noAccount.description",
    },
    {
        icon: Repeat,
        titleKey: "features.repsTimers.title",
        descriptionKey: "features.repsTimers.description",
    },
    {
        icon: Timer,
        titleKey: "features.restCountdown.title",
        descriptionKey: "features.restCountdown.description",
    },
    {
        icon: Bell,
        titleKey: "features.reminders.title",
        descriptionKey: "features.reminders.description",
    },
    {
        icon: Smartphone,
        titleKey: "features.liveActivities.title",
        descriptionKey: "features.liveActivities.description",
    },
    {
        icon: Moon,
        titleKey: "features.themes.title",
        descriptionKey: "features.themes.description",
    },
    {
        icon: Globe,
        titleKey: "features.multilingual.title",
        descriptionKey: "features.multilingual.description",
    },
    {
        icon: Code,
        titleKey: "features.openSource.title",
        descriptionKey: "features.openSource.description",
    },
];

const features = computed(() =>
    featureItems.map((feature) => ({
        icon: feature.icon,
        title: t(feature.titleKey),
        description: t(feature.descriptionKey),
    })),
);

const screenshotItems = [
    {
        id: "home-light",
        labelKey: "screenshots.tabs.home",
        url: screenshotUrl("home-light", 400),
        srcset: screenshotSrcset("home-light"),
    },
    {
        id: "home-scheduled",
        labelKey: "screenshots.tabs.scheduled",
        url: screenshotUrl("home-scheduled", 400),
        srcset: screenshotSrcset("home-scheduled"),
    },
    {
        id: "exercise-reps",
        labelKey: "screenshots.tabs.exercise",
        url: screenshotUrl("exercise-reps", 400),
        srcset: screenshotSrcset("exercise-reps"),
    },
    {
        id: "exercise-timer",
        labelKey: "screenshots.tabs.timer",
        url: screenshotUrl("exercise-timer", 400),
        srcset: screenshotSrcset("exercise-timer"),
    },
    {
        id: "editor",
        labelKey: "screenshots.tabs.editor",
        url: screenshotUrl("editor", 400),
        srcset: screenshotSrcset("editor"),
    },
    {
        id: "exercise-picker",
        labelKey: "screenshots.tabs.exercises",
        url: screenshotUrl("exercise-picker", 400),
        srcset: screenshotSrcset("exercise-picker"),
    },
    {
        id: "schedule",
        labelKey: "screenshots.tabs.schedule",
        url: screenshotUrl("schedule", 400),
        srcset: screenshotSrcset("schedule"),
    },
    {
        id: "done",
        labelKey: "screenshots.tabs.complete",
        url: screenshotUrl("done", 400),
        srcset: screenshotSrcset("done"),
    },
];

const screenshots = computed(() =>
    screenshotItems.map((screenshot) => ({
        ...screenshot,
        label: t(screenshot.labelKey),
    })),
);

const activeIndex = ref(0);
const [screenshotsEmblaRef, screenshotsEmblaApi] = emblaCarouselVue({
    align: "center",
    containScroll: "trimSnaps",
    loop: true,
});
const waitlistForm = reactive({
    name: "",
    email: "",
    note: "",
    company: "",
});
const isSubmittingWaitlist = ref(false);
const waitlistStatus = ref<"idle" | "success" | "error">("idle");
const waitlistMessage = ref("");

function selectScreenshot(api: EmblaCarouselType) {
    activeIndex.value = api.selectedScrollSnap();
}

function scrollToScreenshot(index: number) {
    activeIndex.value = index;
    screenshotsEmblaApi.value?.scrollTo(index);
}

watch(screenshotsEmblaApi, (api, previousApi) => {
    if (previousApi) {
        previousApi.off("select", selectScreenshot);
        previousApi.off("reInit", selectScreenshot);
    }

    if (api) {
        selectScreenshot(api);
        api.on("select", selectScreenshot);
        api.on("reInit", selectScreenshot);
    }
});

onBeforeUnmount(() => {
    const api = screenshotsEmblaApi.value;

    if (api) {
        api.off("select", selectScreenshot);
        api.off("reInit", selectScreenshot);
    }
});

async function joinWaitlist() {
    waitlistStatus.value = "idle";
    waitlistMessage.value = "";
    isSubmittingWaitlist.value = true;

    try {
        await $fetch(waitlistEndpoint, {
            method: "POST",
            body: {
                name: waitlistForm.name.trim(),
                email: waitlistForm.email.trim(),
                note: waitlistForm.note.trim(),
                company: waitlistForm.company,
            },
        });

        waitlistStatus.value = "success";
        waitlistMessage.value = t("waitlist.success");
        waitlistForm.name = "";
        waitlistForm.email = "";
        waitlistForm.note = "";
    } catch {
        waitlistStatus.value = "error";
        waitlistMessage.value = t("waitlist.error");
    } finally {
        isSubmittingWaitlist.value = false;
    }
}

useSeoMeta({
    title: () => t("seo.title"),
    description: () => t("seo.description"),
    ogTitle: () => t("seo.title"),
    ogDescription: () => t("seo.description"),
    ogType: "website",
    ogImage: () => localizeUrl("https://www.ixercise.com/og.png"),
    ogImageWidth: 1731,
    ogImageHeight: 909,
    twitterCard: "summary_large_image",
    twitterTitle: () => t("seo.title"),
    twitterDescription: () => t("seo.description"),
    twitterImage: () => localizeUrl("https://www.ixercise.com/og.png"),
});

useHead(() => ({
    htmlAttrs: {
        lang: currentLocaleMeta.value.lang,
        dir: "ltr",
    },
    link: [
        { rel: "canonical", href: localizeUrl(currentLocaleMeta.value.path) },
        { rel: "alternate", hreflang: "en", href: localizeUrl("/") },
        { rel: "alternate", hreflang: "en-US", href: localizeUrl("/") },
        { rel: "alternate", hreflang: "ua", href: localizeUrl("/ua") },
        { rel: "alternate", hreflang: "uk-UA", href: localizeUrl("/ua") },
        { rel: "alternate", hreflang: "x-default", href: localizeUrl("/") },
    ],
    meta: [
        { property: "og:locale", content: currentLocaleMeta.value.ogLocale },
        {
            property: "og:locale:alternate",
            content: currentLocale.value === "ua" ? "en_US" : "uk_UA",
        },
        {
            property: "og:url",
            content: localizeUrl(currentLocaleMeta.value.path),
        },
    ],
    script: [
        {
            type: "application/ld+json",
            innerHTML: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "Ixercise",
                applicationCategory: "HealthApplication",
                operatingSystem: "iOS",
                offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD",
                },
                description: t("seo.schemaDescription"),
            }),
        },
    ],
}));
</script>

<template>
    <main>
        <section class="hero">
            <div class="hero__glow" aria-hidden="true" />

            <div
                class="language-switcher"
                :aria-label="t('language.ariaLabel')"
            >
                <Languages aria-hidden="true" :size="18" />
                <select
                    :value="currentLocale"
                    :aria-label="t('language.selectLabel')"
                    @change="switchLanguage"
                >
                    <option
                        v-for="locale in localeOptions"
                        :key="locale.code"
                        :value="locale.code"
                        :selected="locale.code === currentLocale"
                    >
                        {{ locale.label }}
                    </option>
                </select>
            </div>

            <div class="hero__content">
                <picture>
                    <source
                        srcset="/logo-160.webp 160w, /logo-320.webp 320w"
                        type="image/webp"
                        sizes="160px"
                    />
                    <img
                        class="hero__logo"
                        src="/logo.png"
                        alt="Ixercise"
                        width="160"
                        height="160"
                    />
                </picture>
                <h1>Ixercise</h1>
                <p class="hero__tagline">
                    {{ t("hero.taglineLine1") }}<br class="mobile-break" />
                    {{ t("hero.taglineLine2") }}<br class="mobile-break" />
                    {{ t("hero.taglineLine3") }}
                </p>
                <p class="hero__description">
                    {{ t("hero.description") }}
                </p>

                <div class="actions" :aria-label="t('hero.actionsLabel')">
                    <a class="button button--primary" :href="waitlistTarget">
                        <Mail aria-hidden="true" :size="22" />
                        {{ t("actions.joinWaitlist") }}
                    </a>
                    <a
                        class="button button--secondary"
                        :href="githubUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Github aria-hidden="true" :size="20" />
                        {{ t("actions.viewOnGithub") }}
                    </a>
                </div>

                <div
                    class="hero-phones"
                    :aria-label="t('screenshots.hero.ariaLabel')"
                >
                    <div
                        v-for="phone in heroScreenshots"
                        :key="phone.id"
                        class="phone"
                        :class="phone.className"
                    >
                        <img
                            :src="phone.url"
                            :srcset="phone.srcset"
                            :sizes="phone.sizes"
                            :alt="phone.alt"
                            width="320"
                            height="693"
                            loading="eager"
                            decoding="async"
                        />
                    </div>
                </div>
            </div>
        </section>

        <section class="section section--border">
            <div class="container philosophy">
                <div>
                    <p class="eyebrow">{{ t("philosophy.eyebrow") }}</p>
                    <h2>{{ t("philosophy.title") }}</h2>
                    <p class="section-copy">
                        {{ t("philosophy.copy") }}
                    </p>
                </div>

                <div class="not-card">
                    <p>{{ t("philosophy.notCardTitle") }}</p>
                    <ul>
                        <li v-for="feature in notFeatures" :key="feature">
                            <span aria-hidden="true"><X :size="16" /></span>
                            <s>{{ feature }}</s>
                        </li>
                    </ul>
                </div>
            </div>
        </section>

        <section class="section section--border">
            <div class="container">
                <div class="section-heading">
                    <p class="eyebrow">{{ t("features.eyebrow") }}</p>
                    <h2>{{ t("features.title") }}</h2>
                    <p class="section-copy">{{ t("features.copy") }}</p>
                </div>

                <div class="feature-grid">
                    <article
                        v-for="feature in features"
                        :key="feature.title"
                        class="feature-card"
                    >
                        <div class="feature-card__icon">
                            <component
                                :is="feature.icon"
                                :size="24"
                                aria-hidden="true"
                            />
                        </div>
                        <h3>{{ feature.title }}</h3>
                        <p>{{ feature.description }}</p>
                    </article>
                </div>
            </div>
        </section>

        <section class="section section--border screenshots-section">
            <div class="container">
                <div class="section-heading">
                    <p class="eyebrow">{{ t("screenshots.eyebrow") }}</p>
                    <h2>{{ t("screenshots.title") }}</h2>
                </div>

                <div
                    class="tabs"
                    role="tablist"
                    :aria-label="t('screenshots.tabsAriaLabel')"
                >
                    <button
                        v-for="(screenshot, index) in screenshots"
                        :key="screenshot.id"
                        type="button"
                        class="tab"
                        :class="{ 'tab--active': activeIndex === index }"
                        role="tab"
                        :aria-selected="activeIndex === index"
                        :aria-controls="`panel-${screenshot.id}`"
                        @click="scrollToScreenshot(index)"
                    >
                        {{ screenshot.label }}
                    </button>
                </div>

                <div class="screenshot-stage">
                    <div ref="screenshotsEmblaRef" class="screenshot-carousel">
                        <div class="screenshot-carousel__container">
                            <div
                                v-for="(screenshot, index) in screenshots"
                                :id="`panel-${screenshot.id}`"
                                :key="screenshot.id"
                                class="screenshot-carousel__slide"
                                role="tabpanel"
                                :aria-hidden="activeIndex !== index"
                            >
                                <div class="phone phone--display">
                                    <img
                                        :src="screenshot.url"
                                        :srcset="screenshot.srcset"
                                        sizes="(max-width: 760px) 256px, 384px"
                                        :alt="
                                            t('screenshots.stageAlt').replace(
                                                '{label}',
                                                screenshot.label,
                                            )
                                        "
                                        width="400"
                                        height="866"
                                        :loading="
                                            index === 0 ? 'eager' : 'lazy'
                                        "
                                        decoding="async"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="waitlist" class="section section--border waitlist-section">
            <div class="container waitlist">
                <div class="waitlist__copy">
                    <p class="eyebrow">{{ t("waitlist.eyebrow") }}</p>
                    <h2>{{ t("waitlist.title") }}</h2>
                    <p class="section-copy">
                        {{ t("waitlist.copy") }}
                    </p>
                </div>

                <form class="waitlist-form" @submit.prevent="joinWaitlist">
                    <div class="field">
                        <label for="waitlist-name">{{
                            t("waitlist.nameLabel")
                        }}</label>
                        <input
                            id="waitlist-name"
                            v-model="waitlistForm.name"
                            name="name"
                            type="text"
                            autocomplete="name"
                            :placeholder="t('waitlist.namePlaceholder')"
                        />
                    </div>

                    <div class="field">
                        <label for="waitlist-email">{{
                            t("waitlist.emailLabel")
                        }}</label>
                        <input
                            id="waitlist-email"
                            v-model="waitlistForm.email"
                            name="email"
                            type="email"
                            autocomplete="email"
                            inputmode="email"
                            :placeholder="t('waitlist.emailPlaceholder')"
                            required
                        />
                    </div>

                    <div class="field">
                        <label for="waitlist-note">{{
                            t("waitlist.noteLabel")
                        }}</label>
                        <textarea
                            id="waitlist-note"
                            v-model="waitlistForm.note"
                            name="note"
                            rows="4"
                            :placeholder="t('waitlist.notePlaceholder')"
                        />
                    </div>

                    <div class="field field--hidden" aria-hidden="true">
                        <label for="waitlist-company">{{
                            t("waitlist.companyLabel")
                        }}</label>
                        <input
                            id="waitlist-company"
                            v-model="waitlistForm.company"
                            name="company"
                            type="text"
                            tabindex="-1"
                        />
                    </div>

                    <button
                        class="button button--primary waitlist-form__submit"
                        type="submit"
                        :disabled="isSubmittingWaitlist"
                    >
                        <Mail aria-hidden="true" :size="20" />
                        {{
                            isSubmittingWaitlist
                                ? t("waitlist.joining")
                                : t("actions.joinWaitlist")
                        }}
                    </button>

                    <p
                        v-if="waitlistMessage"
                        class="form-status"
                        :class="{
                            'form-status--success':
                                waitlistStatus === 'success',
                            'form-status--error': waitlistStatus === 'error',
                        }"
                        role="status"
                    >
                        {{ waitlistMessage }}
                    </p>
                </form>
            </div>
        </section>

        <footer class="footer section--border">
            <div class="container footer__inner">
                <h2>{{ t("footer.title") }}</h2>
                <p class="section-copy">{{ t("footer.copy") }}</p>

                <div class="actions">
                    <a class="button button--primary" :href="waitlistTarget">
                        <Mail aria-hidden="true" :size="22" />
                        {{ t("actions.joinWaitlist") }}
                    </a>
                    <a
                        class="button button--secondary"
                        :href="githubUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Github aria-hidden="true" :size="20" />
                        {{ t("actions.viewSource") }}
                    </a>
                </div>

                <div class="footer__bar">
                    <div class="footer__brand">
                        <img
                            src="/logo-160.webp"
                            alt=""
                            width="40"
                            height="40"
                            aria-hidden="true"
                            loading="lazy"
                            decoding="async"
                        />
                        <span>Ixercise</span>
                    </div>
                    <nav :aria-label="t('footer.linksAriaLabel')">
                        <a :href="`mailto:${contactEmail}`">{{
                            t("footer.contact")
                        }}</a>
                        <a
                            :href="`${githubUrl}/blob/main/PRIVACY_POLICY.md`"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {{ t("footer.privacy") }}
                        </a>
                        <a
                            :href="`${githubUrl}/blob/main/LICENSE`"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {{ t("footer.license") }}
                        </a>
                        <a
                            :href="githubUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            >{{ t("footer.github") }}</a
                        >
                    </nav>
                    <p class="credit">
                        {{ t("footer.madeWith") }}
                        <Heart aria-hidden="true" :size="16" />
                        {{ t("footer.by") }}
                        <a
                            href="https://github.com/ilsrbn"
                            target="_blank"
                            rel="noopener noreferrer"
                            >Ilya Serbin</a
                        >
                    </p>
                </div>
            </div>
        </footer>
    </main>
</template>

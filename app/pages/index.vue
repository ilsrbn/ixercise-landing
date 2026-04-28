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
  X
} from 'lucide-vue-next'

const githubUrl = 'https://github.com/ilsrbn/ixercise'
const contactEmail = 'serbini271@gmail.com'
const waitlistTarget = '#waitlist'
const runtimeConfig = useRuntimeConfig()
const waitlistEndpoint = runtimeConfig.public.waitlistEndpoint || '/api/waitlist'
const { $t, $getLocale, $getLocales, $switchLocale } = useI18n()
const siteUrl = runtimeConfig.public.siteUrl.replace(/\/$/, '')
const route = useRoute()

function t(key: string) {
  return String($t(key))
}

const currentLocale = computed(() => (route.path.split('/').filter(Boolean)[0] === 'ua' ? 'ua' : $getLocale()))
const currentLocaleMeta = computed(() =>
  currentLocale.value === 'ua'
    ? { path: '/ua', lang: 'uk-UA', ogLocale: 'uk_UA' }
    : { path: '/', lang: 'en-US', ogLocale: 'en_US' }
)
const localeOptions = computed(() =>
  $getLocales().map((locale) => ({
    code: locale.code,
    label: locale.displayName || locale.name || locale.code.toUpperCase()
  }))
)

function localizeUrl(path: string) {
  return siteUrl ? `${siteUrl}${path}` : path
}

async function switchLanguage(event: Event) {
  const nextLocale = (event.target as HTMLSelectElement).value
  if (nextLocale && nextLocale !== currentLocale.value) {
    await $switchLocale(nextLocale)
  }
}

const heroScreenshots = computed(() => [
  {
    alt: t('screenshots.hero.homeAlt'),
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.35-dfTEpeO6stC6hf9fXZD3I1iw5T0YEq.png',
    className: 'phone--side phone--left'
  },
  {
    alt: t('screenshots.hero.workoutAlt'),
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.22-7QFrwEG5rKad37N3PwctIWtyqISpMm.png',
    className: 'phone--center'
  },
  {
    alt: t('screenshots.hero.restAlt'),
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.01-DoDgnbT7KDBySSXcs47DntVhs9MfFQ.png',
    className: 'phone--side phone--right'
  }
])

const notFeatures = computed(() => [
  t('notFeatures.calorieTracking'),
  t('notFeatures.streaks'),
  t('notFeatures.socialFeed'),
  t('notFeatures.videoLessons'),
  t('notFeatures.accountRequired'),
  t('notFeatures.cloudSync'),
  t('notFeatures.analytics')
])

const featureItems = [
  { icon: Wifi, titleKey: 'features.offline.title', descriptionKey: 'features.offline.description' },
  { icon: Lock, titleKey: 'features.noAccount.title', descriptionKey: 'features.noAccount.description' },
  { icon: Repeat, titleKey: 'features.repsTimers.title', descriptionKey: 'features.repsTimers.description' },
  { icon: Timer, titleKey: 'features.restCountdown.title', descriptionKey: 'features.restCountdown.description' },
  { icon: Bell, titleKey: 'features.reminders.title', descriptionKey: 'features.reminders.description' },
  { icon: Smartphone, titleKey: 'features.liveActivities.title', descriptionKey: 'features.liveActivities.description' },
  { icon: Moon, titleKey: 'features.themes.title', descriptionKey: 'features.themes.description' },
  { icon: Globe, titleKey: 'features.multilingual.title', descriptionKey: 'features.multilingual.description' },
  { icon: Code, titleKey: 'features.openSource.title', descriptionKey: 'features.openSource.description' }
]

const features = computed(() =>
  featureItems.map((feature) => ({
    icon: feature.icon,
    title: t(feature.titleKey),
    description: t(feature.descriptionKey)
  }))
)

const screenshotItems = [
  {
    id: 'home-light',
    labelKey: 'screenshots.tabs.home',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.06.43-Vh3UqGd3XwpamZPhQ0ywJYWM53h30c.png'
  },
  {
    id: 'home-scheduled',
    labelKey: 'screenshots.tabs.scheduled',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.09.10-OfZxfxrkvwHEgJdjmsRDoT0gH2UL8e.png'
  },
  {
    id: 'exercise-reps',
    labelKey: 'screenshots.tabs.exercise',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.07.57-BztysArEn24o79afNwHr13G0GUfP8w.png'
  },
  {
    id: 'exercise-timer',
    labelKey: 'screenshots.tabs.timer',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.05-nv1sxPkIMHpnVJx5tM6tkGiMailAS5.png'
  },
  {
    id: 'editor',
    labelKey: 'screenshots.tabs.editor',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.41-rJLAv5djJbjw5zZaRTJ1Me4CtVjKPN.png'
  },
  {
    id: 'exercise-picker',
    labelKey: 'screenshots.tabs.exercises',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.06.55-KBApjW9Xp4TQ1pyBwKRKn0FNYFBVvM.png'
  },
  {
    id: 'schedule',
    labelKey: 'screenshots.tabs.schedule',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.34-osPioyZ4ZoZStnGApUsYBzPMXw4EPi.png'
  },
  {
    id: 'done',
    labelKey: 'screenshots.tabs.complete',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.15-Wg3NO4hidvYpvtYct9U4AeEk5cGJfM.png'
  }
]

const screenshots = computed(() =>
  screenshotItems.map((screenshot) => ({
    ...screenshot,
    label: t(screenshot.labelKey)
  }))
)

const activeIndex = ref(0)
const activeScreenshot = computed(() => screenshots.value[activeIndex.value] || screenshots.value[0])
const waitlistForm = reactive({
  name: '',
  email: '',
  note: '',
  company: ''
})
const isSubmittingWaitlist = ref(false)
const waitlistStatus = ref<'idle' | 'success' | 'error'>('idle')
const waitlistMessage = ref('')

async function joinWaitlist() {
  waitlistStatus.value = 'idle'
  waitlistMessage.value = ''
  isSubmittingWaitlist.value = true

  try {
    await $fetch(waitlistEndpoint, {
      method: 'POST',
      body: {
        name: waitlistForm.name.trim(),
        email: waitlistForm.email.trim(),
        note: waitlistForm.note.trim(),
        company: waitlistForm.company
      }
    })

    waitlistStatus.value = 'success'
    waitlistMessage.value = t('waitlist.success')
    waitlistForm.name = ''
    waitlistForm.email = ''
    waitlistForm.note = ''
  } catch {
    waitlistStatus.value = 'error'
    waitlistMessage.value = t('waitlist.error')
  } finally {
    isSubmittingWaitlist.value = false
  }
}

useSeoMeta({
  title: () => t('seo.title'),
  description: () => t('seo.description'),
  ogTitle: () => t('seo.title'),
  ogDescription: () => t('seo.description'),
  ogType: 'website',
  ogImage: () => localizeUrl('https://www.ixercise.com/og.png'),
  ogImageWidth: 1731,
  ogImageHeight: 909,
  twitterCard: 'summary_large_image',
  twitterTitle: () => t('seo.title'),
  twitterDescription: () => t('seo.description'),
  twitterImage: () => localizeUrl('https://www.ixercise.com/og.png')
})

useHead(() => ({
  htmlAttrs: {
    lang: currentLocaleMeta.value.lang,
    dir: 'ltr'
  },
  link: [
    { rel: 'canonical', href: localizeUrl(currentLocaleMeta.value.path) },
    { rel: 'alternate', hreflang: 'en', href: localizeUrl('/') },
    { rel: 'alternate', hreflang: 'en-US', href: localizeUrl('/') },
    { rel: 'alternate', hreflang: 'ua', href: localizeUrl('/ua') },
    { rel: 'alternate', hreflang: 'uk-UA', href: localizeUrl('/ua') },
    { rel: 'alternate', hreflang: 'x-default', href: localizeUrl('/') }
  ],
  meta: [
    { property: 'og:locale', content: currentLocaleMeta.value.ogLocale },
    { property: 'og:locale:alternate', content: currentLocale.value === 'ua' ? 'en_US' : 'uk_UA' },
    { property: 'og:url', content: localizeUrl(currentLocaleMeta.value.path) }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Ixercise',
        applicationCategory: 'HealthApplication',
        operatingSystem: 'iOS',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD'
        },
        description: t('seo.schemaDescription')
      })
    }
  ]
}))
</script>

<template>
  <main>
    <section class="hero">
      <div class="hero__glow" aria-hidden="true" />

      <div class="language-switcher" :aria-label="t('language.ariaLabel')">
        <Languages aria-hidden="true" :size="18" />
        <select :value="currentLocale" :aria-label="t('language.selectLabel')" @change="switchLanguage">
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
        <img class="hero__logo" src="/logo.png" alt="Ixercise" width="160" height="160" />
        <h1>Ixercise</h1>
        <p class="hero__tagline">
          {{ t('hero.taglineLine1') }}<br class="mobile-break" />
          {{ t('hero.taglineLine2') }}<br class="mobile-break" />
          {{ t('hero.taglineLine3') }}
        </p>
        <p class="hero__description">
          {{ t('hero.description') }}
        </p>

        <div class="actions" :aria-label="t('hero.actionsLabel')">
          <a class="button button--primary" :href="waitlistTarget">
            <Mail aria-hidden="true" :size="22" />
            {{ t('actions.joinWaitlist') }}
          </a>
          <a class="button button--secondary" :href="githubUrl" target="_blank" rel="noopener noreferrer">
            <Github aria-hidden="true" :size="20" />
            {{ t('actions.viewOnGithub') }}
          </a>
        </div>

        <div class="hero-phones" :aria-label="t('screenshots.hero.ariaLabel')">
          <div v-for="phone in heroScreenshots" :key="phone.alt" class="phone" :class="phone.className">
            <img :src="phone.url" :alt="phone.alt" width="320" height="693" loading="eager" decoding="async" />
          </div>
        </div>
      </div>
    </section>

    <section class="section section--border">
      <div class="container philosophy">
        <div>
          <p class="eyebrow">{{ t('philosophy.eyebrow') }}</p>
          <h2>{{ t('philosophy.title') }}</h2>
          <p class="section-copy">
            {{ t('philosophy.copy') }}
          </p>
        </div>

        <div class="not-card">
          <p>{{ t('philosophy.notCardTitle') }}</p>
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
          <p class="eyebrow">{{ t('features.eyebrow') }}</p>
          <h2>{{ t('features.title') }}</h2>
          <p class="section-copy">{{ t('features.copy') }}</p>
        </div>

        <div class="feature-grid">
          <article v-for="feature in features" :key="feature.title" class="feature-card">
            <div class="feature-card__icon">
              <component :is="feature.icon" :size="24" aria-hidden="true" />
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
          <p class="eyebrow">{{ t('screenshots.eyebrow') }}</p>
          <h2>{{ t('screenshots.title') }}</h2>
        </div>

        <div class="tabs" role="tablist" :aria-label="t('screenshots.tabsAriaLabel')">
          <button
            v-for="(screenshot, index) in screenshots"
            :key="screenshot.id"
            type="button"
            class="tab"
            :class="{ 'tab--active': activeIndex === index }"
            role="tab"
            :aria-selected="activeIndex === index"
            :aria-controls="`panel-${screenshot.id}`"
            @click="activeIndex = index"
          >
            {{ screenshot.label }}
          </button>
        </div>

        <div :id="`panel-${activeScreenshot.id}`" class="screenshot-stage" role="tabpanel">
          <div class="phone phone--display">
            <img
              :key="activeScreenshot.id"
              :src="activeScreenshot.url"
              :alt="t('screenshots.stageAlt').replace('{label}', activeScreenshot.label)"
              width="400"
              height="866"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <div class="thumbnail-strip" :aria-label="t('screenshots.thumbnailAriaLabel')">
          <button
            v-for="(screenshot, index) in screenshots"
            :key="`thumb-${screenshot.id}`"
            type="button"
            class="thumbnail"
            :class="{ 'thumbnail--active': activeIndex === index }"
            :aria-label="t('screenshots.showScreenshot').replace('{label}', screenshot.label)"
            @click="activeIndex = index"
          >
            <img :src="screenshot.url" :alt="screenshot.label" width="128" height="277" loading="lazy" />
          </button>
        </div>
      </div>
    </section>

    <section id="waitlist" class="section section--border waitlist-section">
      <div class="container waitlist">
        <div class="waitlist__copy">
          <p class="eyebrow">{{ t('waitlist.eyebrow') }}</p>
          <h2>{{ t('waitlist.title') }}</h2>
          <p class="section-copy">
            {{ t('waitlist.copy') }}
          </p>
        </div>

        <form class="waitlist-form" @submit.prevent="joinWaitlist">
          <div class="field">
            <label for="waitlist-name">{{ t('waitlist.nameLabel') }}</label>
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
            <label for="waitlist-email">{{ t('waitlist.emailLabel') }}</label>
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
            <label for="waitlist-note">{{ t('waitlist.noteLabel') }}</label>
            <textarea
              id="waitlist-note"
              v-model="waitlistForm.note"
              name="note"
              rows="4"
              :placeholder="t('waitlist.notePlaceholder')"
            />
          </div>

          <div class="field field--hidden" aria-hidden="true">
            <label for="waitlist-company">{{ t('waitlist.companyLabel') }}</label>
            <input id="waitlist-company" v-model="waitlistForm.company" name="company" type="text" tabindex="-1" />
          </div>

          <button class="button button--primary waitlist-form__submit" type="submit" :disabled="isSubmittingWaitlist">
            <Mail aria-hidden="true" :size="20" />
            {{ isSubmittingWaitlist ? t('waitlist.joining') : t('actions.joinWaitlist') }}
          </button>

          <p
            v-if="waitlistMessage"
            class="form-status"
            :class="{ 'form-status--success': waitlistStatus === 'success', 'form-status--error': waitlistStatus === 'error' }"
            role="status"
          >
            {{ waitlistMessage }}
          </p>
        </form>
      </div>
    </section>

    <footer class="footer section--border">
      <div class="container footer__inner">
        <h2>{{ t('footer.title') }}</h2>
        <p class="section-copy">{{ t('footer.copy') }}</p>

        <div class="actions">
          <a class="button button--primary" :href="waitlistTarget">
            <Mail aria-hidden="true" :size="22" />
            {{ t('actions.joinWaitlist') }}
          </a>
          <a class="button button--secondary" :href="githubUrl" target="_blank" rel="noopener noreferrer">
            <Github aria-hidden="true" :size="20" />
            {{ t('actions.viewSource') }}
          </a>
        </div>

        <div class="footer__bar">
          <div class="footer__brand">
            <img src="/logo.png" alt="" width="40" height="40" aria-hidden="true" />
            <span>Ixercise</span>
          </div>
          <nav :aria-label="t('footer.linksAriaLabel')">
            <a :href="`mailto:${contactEmail}`">{{ t('footer.contact') }}</a>
            <a :href="`${githubUrl}/blob/main/PRIVACY_POLICY.md`" target="_blank" rel="noopener noreferrer">
              {{ t('footer.privacy') }}
            </a>
            <a :href="`${githubUrl}/blob/main/LICENSE`" target="_blank" rel="noopener noreferrer">
              {{ t('footer.license') }}
            </a>
            <a :href="githubUrl" target="_blank" rel="noopener noreferrer">{{ t('footer.github') }}</a>
          </nav>
          <p class="credit">
            {{ t('footer.madeWith') }} <Heart aria-hidden="true" :size="16" /> {{ t('footer.by') }}
            <a href="https://github.com/ilsrbn" target="_blank" rel="noopener noreferrer">Ilya Serbin</a>
          </p>
        </div>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import {
  Bell,
  Code,
  Github,
  Globe,
  Heart,
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
const waitlistTarget = '#waitlist'
const waitlistEndpoint = useRuntimeConfig().public.waitlistEndpoint || '/api/waitlist'

const heroScreenshots = [
  {
    alt: 'Ixercise home screen',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.35-dfTEpeO6stC6hf9fXZD3I1iw5T0YEq.png',
    className: 'phone--side phone--left'
  },
  {
    alt: 'Ixercise active workout',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.22-7QFrwEG5rKad37N3PwctIWtyqISpMm.png',
    className: 'phone--center'
  },
  {
    alt: 'Ixercise rest timer',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.01-DoDgnbT7KDBySSXcs47DntVhs9MfFQ.png',
    className: 'phone--side phone--right'
  }
]

const notFeatures = [
  'Calorie tracking',
  'Streaks',
  'Social feed',
  'Video lessons',
  'Account required',
  'Cloud sync',
  'Analytics'
]

const features = [
  {
    icon: Wifi,
    title: 'Fully Offline',
    description: 'Works without internet. Your workouts stay on your device.'
  },
  {
    icon: Lock,
    title: 'No Account',
    description: 'Start immediately. No sign-up, no login, no email required.'
  },
  {
    icon: Repeat,
    title: 'Reps & Timers',
    description: 'Support for both rep-based and timer-based exercises.'
  },
  {
    icon: Timer,
    title: 'Rest Countdown',
    description: 'Built-in rest timers between sets with adjustable duration.'
  },
  {
    icon: Bell,
    title: 'Reminders',
    description: 'Schedule your workouts with customizable notifications.'
  },
  {
    icon: Smartphone,
    title: 'Live Activities',
    description: 'Lock Screen widgets and Dynamic Island support on iOS.'
  },
  {
    icon: Moon,
    title: 'Dark & Light',
    description: 'Beautiful in any lighting. Automatic theme switching.'
  },
  {
    icon: Globe,
    title: 'Multilingual',
    description: 'Available in English and Ukrainian.'
  },
  {
    icon: Code,
    title: 'Open Source',
    description: 'Free forever. View the code on GitHub.'
  }
]

const screenshots = [
  {
    id: 'home-light',
    label: 'Home',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.06.43-Vh3UqGd3XwpamZPhQ0ywJYWM53h30c.png'
  },
  {
    id: 'home-scheduled',
    label: 'Scheduled',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.09.10-OfZxfxrkvwHEgJdjmsRDoT0gH2UL8e.png'
  },
  {
    id: 'exercise-reps',
    label: 'Exercise',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.07.57-BztysArEn24o79afNwHr13G0GUfP8w.png'
  },
  {
    id: 'exercise-timer',
    label: 'Timer',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.05-nv1sxPkIMHpnVJx5tM6tkGiMailAS5.png'
  },
  {
    id: 'editor',
    label: 'Editor',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.10.41-rJLAv5djJbjw5zZaRTJ1Me4CtVjKPN.png'
  },
  {
    id: 'exercise-picker',
    label: 'Exercises',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.06.55-KBApjW9Xp4TQ1pyBwKRKn0FNYFBVvM.png'
  },
  {
    id: 'schedule',
    label: 'Schedule',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.34-osPioyZ4ZoZStnGApUsYBzPMXw4EPi.png'
  },
  {
    id: 'done',
    label: 'Complete',
    url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Simulator%20Screenshot%20-%20iPhone%2017%20-%202026-04-25%20at%2016.08.15-Wg3NO4hidvYpvtYct9U4AeEk5cGJfM.png'
  }
]

const activeIndex = ref(0)
const activeScreenshot = computed(() => screenshots[activeIndex.value])
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
    waitlistMessage.value = "You're on the waitlist. I'll email you when Ixercise is ready."
    waitlistForm.name = ''
    waitlistForm.email = ''
    waitlistForm.note = ''
  } catch {
    waitlistStatus.value = 'error'
    waitlistMessage.value = 'Something went wrong. Please try again in a moment.'
  } finally {
    isSubmittingWaitlist.value = false
  }
}

useSeoMeta({
  title: 'Ixercise - Your Workout. Step by Step. Offline.',
  description:
    'Simple offline workout app for iOS. No account, no cloud, no tracking. Just your workout, step by step.',
  ogTitle: 'Ixercise - Your Workout. Step by Step. Offline.',
  ogDescription:
    'Simple offline workout app for iOS. No account, no cloud, no tracking. Just your workout, step by step.',
  ogType: 'website',
  ogImage: '/apple-icon.png',
  twitterCard: 'summary',
  twitterTitle: 'Ixercise - Your Workout. Step by Step. Offline.',
  twitterDescription:
    'Simple offline workout app for iOS. No account, no cloud, no tracking. Just your workout, step by step.',
  twitterImage: '/apple-icon.png'
})

useHead({
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
        description:
          'Simple offline workout app for iOS. No account, no cloud, no tracking.'
      })
    }
  ]
})
</script>

<template>
  <main>
    <section class="hero">
      <div class="hero__glow" aria-hidden="true" />

      <div class="hero__content">
        <h1>Ixercise</h1>
        <p class="hero__tagline">
          Your workout.<br class="mobile-break" />
          Step by step.<br class="mobile-break" />
          Offline.
        </p>
        <p class="hero__description">
          Simple workout app for iOS that guides you through your own routines. No account. No cloud. No tracking.
        </p>

        <div class="actions" aria-label="Primary actions">
          <a class="button button--primary" :href="waitlistTarget">
            <Mail aria-hidden="true" :size="22" />
            Join Waitlist
          </a>
          <a class="button button--secondary" :href="githubUrl" target="_blank" rel="noopener noreferrer">
            <Github aria-hidden="true" :size="20" />
            View on GitHub
          </a>
        </div>

        <div class="hero-phones" aria-label="Ixercise app screenshots">
          <div v-for="phone in heroScreenshots" :key="phone.alt" class="phone" :class="phone.className">
            <img :src="phone.url" :alt="phone.alt" width="320" height="693" loading="eager" decoding="async" />
          </div>
        </div>
      </div>
    </section>

    <section class="section section--border">
      <div class="container philosophy">
        <div>
          <p class="eyebrow">Philosophy</p>
          <h2>Not another fitness tracker.</h2>
          <p class="section-copy">
            Just your workout, step by step. We believe fitness apps should help you exercise, not distract you with
            features you never asked for.
          </p>
        </div>

        <div class="not-card">
          <p>What we don't have</p>
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
          <p class="eyebrow">Features</p>
          <h2>Simple by design.</h2>
          <p class="section-copy">Everything you need for your workout routine. Nothing you don't.</p>
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
          <p class="eyebrow">Screenshots</p>
          <h2>See it in action.</h2>
        </div>

        <div class="tabs" role="tablist" aria-label="Screenshot views">
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
              :alt="`${activeScreenshot.label} screen in Ixercise`"
              width="400"
              height="866"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        <div class="thumbnail-strip" aria-label="Screenshot thumbnails">
          <button
            v-for="(screenshot, index) in screenshots"
            :key="`thumb-${screenshot.id}`"
            type="button"
            class="thumbnail"
            :class="{ 'thumbnail--active': activeIndex === index }"
            :aria-label="`Show ${screenshot.label} screenshot`"
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
          <p class="eyebrow">Waitlist</p>
          <h2>Get notified when Ixercise launches.</h2>
          <p class="section-copy">
            Leave your email and I will send a short note when the app is available. No newsletter, no spam.
          </p>
        </div>

        <form class="waitlist-form" @submit.prevent="joinWaitlist">
          <div class="field">
            <label for="waitlist-name">Name</label>
            <input
              id="waitlist-name"
              v-model="waitlistForm.name"
              name="name"
              type="text"
              autocomplete="name"
              placeholder="Your name"
            />
          </div>

          <div class="field">
            <label for="waitlist-email">Email</label>
            <input
              id="waitlist-email"
              v-model="waitlistForm.email"
              name="email"
              type="email"
              autocomplete="email"
              inputmode="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div class="field">
            <label for="waitlist-note">What should I know?</label>
            <textarea
              id="waitlist-note"
              v-model="waitlistForm.note"
              name="note"
              rows="4"
              placeholder="Optional: platform, preferred language, or what you want from the app"
            />
          </div>

          <div class="field field--hidden" aria-hidden="true">
            <label for="waitlist-company">Company</label>
            <input id="waitlist-company" v-model="waitlistForm.company" name="company" type="text" tabindex="-1" />
          </div>

          <button class="button button--primary waitlist-form__submit" type="submit" :disabled="isSubmittingWaitlist">
            <Mail aria-hidden="true" :size="20" />
            {{ isSubmittingWaitlist ? 'Joining...' : 'Join Waitlist' }}
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
        <h2>Ready to simplify your workout?</h2>
        <p class="section-copy">Join the waitlist for the free launch. No sign up, no subscription, no nonsense.</p>

        <div class="actions">
          <a class="button button--primary" :href="waitlistTarget">
            <Mail aria-hidden="true" :size="22" />
            Join Waitlist
          </a>
          <a class="button button--secondary" :href="githubUrl" target="_blank" rel="noopener noreferrer">
            <Github aria-hidden="true" :size="20" />
            View Source
          </a>
        </div>

        <div class="footer__bar">
          <div class="footer__brand">Ixercise</div>
          <nav aria-label="Footer links">
            <a :href="`${githubUrl}/blob/main/PRIVACY_POLICY.md`" target="_blank" rel="noopener noreferrer">
              Privacy
            </a>
            <a :href="`${githubUrl}/blob/main/LICENSE`" target="_blank" rel="noopener noreferrer">MIT License</a>
            <a :href="githubUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>
          <p class="credit">
            Made with <Heart aria-hidden="true" :size="16" /> by
            <a href="https://github.com/ilsrbn" target="_blank" rel="noopener noreferrer">Ilya Serbin</a>
          </p>
        </div>
      </div>
    </footer>
  </main>
</template>

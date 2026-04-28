export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-04-28',
  devtools: { enabled: true },
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Ixercise - Your Workout. Step by Step. Offline.',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        {
          name: 'description',
          content:
            'Simple offline workout app for iOS. No account, no cloud, no tracking. Just your workout, step by step.'
        },
        { name: 'theme-color', content: '#111111' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Ixercise' },
        { property: 'og:title', content: 'Ixercise - Your Workout. Step by Step. Offline.' },
        {
          property: 'og:description',
          content:
            'Simple offline workout app for iOS. No account, no cloud, no tracking. Just your workout, step by step.'
        },
        { property: 'og:image', content: '/apple-icon.png' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Ixercise - Your Workout. Step by Step. Offline.' },
        {
          name: 'twitter:description',
          content:
            'Simple offline workout app for iOS. No account, no cloud, no tracking. Just your workout, step by step.'
        },
        { name: 'twitter:image', content: '/apple-icon.png' }
      ],
      link: [
        { rel: 'icon', href: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
        { rel: 'icon', href: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
        { rel: 'icon', href: '/icon.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/apple-icon.png' },
        { rel: 'preconnect', href: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com' }
      ]
    }
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    resendApiKey: process.env.RESEND_API_KEY || '',
    waitlistToEmail: process.env.WAITLIST_TO_EMAIL || '',
    waitlistFromEmail: process.env.WAITLIST_FROM_EMAIL || 'Ixercise Waitlist <onboarding@resend.dev>',
    public: {
      waitlistEndpoint: process.env.NUXT_PUBLIC_WAITLIST_ENDPOINT || ''
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/']
    }
  }
})

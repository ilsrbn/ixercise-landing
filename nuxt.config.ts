export default defineNuxtConfig({
  ssr: true,
  compatibilityDate: '2026-04-28',
  devtools: { enabled: true },
  modules: ['nuxt-i18n-micro'],
  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', og: 'en_US', dir: 'ltr', displayName: 'English' },
      { code: 'ua', iso: 'uk-UA', og: 'uk_UA', dir: 'ltr', displayName: 'Українська' }
    ],
    defaultLocale: 'en',
    fallbackLocale: 'en',
    translationDir: 'locales',
    disablePageLocales: true,
    strategy: 'prefix_except_default',
    autoDetectLanguage: true,
    autoDetectPath: '/',
    localeCookie: 'ixercise-locale',
    meta: false,
    metaBaseUrl: process.env.NUXT_PUBLIC_SITE_URL || '/'
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'theme-color', content: '#111111' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:site_name', content: 'Ixercise' }
      ],
      link: [
        { rel: 'icon', href: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
        { rel: 'icon', href: '/favicon.png', type: 'image/png', sizes: '64x64' },
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
      waitlistEndpoint: process.env.NUXT_PUBLIC_WAITLIST_ENDPOINT || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || ''
    }
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  }
})

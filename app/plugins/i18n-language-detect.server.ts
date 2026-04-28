import { getCookie, getHeader, getRequestURL } from 'h3'

const localeAliases: Record<string, 'en' | 'ua'> = {
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  ua: 'ua',
  uk: 'ua',
  'uk-ua': 'ua'
}

function getAcceptedLocales(header: string | undefined) {
  return (header || '')
    .split(',')
    .map((entry) => {
      const [language, quality = 'q=1'] = entry.trim().split(';')
      const weight = Number.parseFloat(quality.replace('q=', ''))

      return {
        language: language.toLowerCase(),
        weight: Number.isFinite(weight) ? weight : 1
      }
    })
    .filter((entry) => entry.language)
    .sort((a, b) => b.weight - a.weight)
}

export default defineNuxtPlugin({
  name: 'ixercise-i18n-language-detect',
  enforce: 'pre',
  order: -10,
  setup() {
    const event = useRequestEvent()
    if (!event) return

    const url = getRequestURL(event)
    const firstSegment = url.pathname.split('/').filter(Boolean)[0]
    if (firstSegment === 'en' || firstSegment === 'ua') return

    const existingLocale = getCookie(event, 'ixercise-locale')
    if (existingLocale === 'en' || existingLocale === 'ua') return

    const detectedLocale = getAcceptedLocales(getHeader(event, 'accept-language'))
      .map(({ language }) => localeAliases[language] || localeAliases[language.split('-')[0]])
      .find(Boolean)

    if (detectedLocale) {
      useI18nLocale().setLocale(detectedLocale)
    }
  }
})

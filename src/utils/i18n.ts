import { i18n, TFunction } from 'i18next'

const i18next: i18n = require('i18next').default

export async function initI18n() {
  await i18next.init({
    lng: 'de',
    resources: {
      de: { translation: require('../../assets/lang/de.json') }
    }
  })
}

export function t(key: string | string[], options?: any) {
  return i18next.t(key, options)
}

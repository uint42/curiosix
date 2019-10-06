import { i18n, TFunction } from 'i18next'

const i18next: i18n = require('i18next').default

export async function initI18n() {
  await i18next.init({
    lng: 'de',
    resources: {
      de: { translation: require('../../assets/lang/de.json') }
    }
  })
  translateDOM()
}

function translateDOM() {
  document.querySelectorAll('*[i18n]').forEach((element: HTMLElement) => {
    if (element.children.length > 0) {
      console.warn('Element with i18n attribute has children')
      return
    }
    element.innerText = t(element.innerText.toLowerCase())
  })
}

export function t(key: string | string[], options?: any) {
  return i18next.t(key, options)
}

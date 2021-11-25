import Vue from 'vue'
import VueI18n from 'vue-i18n'

import nl from '../../public/translations/nl.json'

Vue.use(VueI18n)

export const defaultLocale = 'nl'
export const availableLocales = [ 'nl', 'en' ]

export const i18n = new VueI18n({
  locale: defaultLocale,
  messages: { nl },
})
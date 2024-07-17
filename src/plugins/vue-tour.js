import Vue from 'vue'
import VueTour from 'vue-tour'
import 'vue-tour/dist/vue-tour.css'
import { i18n } from './i18n.js'

Vue.use(VueTour)

export const tourConfig = Vue.observable({
  useKeyboardNavigation: true,
  labels: {
    buttonNext: i18n.t('tourNext'),
    buttonPrevious: i18n.t('tourPrevious'),
    buttonSkip: i18n.t('tourSkip'),
    buttonStop: i18n.t('tourStop'),
  },
})

i18n.vm.$watch('locale', () => {
  tourConfig.labels.buttonNext = i18n.t('tourNext')
  tourConfig.labels.buttonPrevious = i18n.t('tourPrevious')
  tourConfig.labels.buttonSkip = i18n.t('tourSkip')
  tourConfig.labels.buttonStop = i18n.t('tourStop')
})

export let tourStepCount = null
export const generateTourSteps = (data) => ([
  {
    target: '[data-v-step="1"]',
    content: i18n.t('tour1a') + data.title.bold() + i18n.t('tour1b'),
    params: {
      enableScrolling: false,
      placement: 'bottom',
    },
    before: function() {
      tourStepCount = 1
    },
  },
  {
    target: '[data-v-step="2"]',
    content: i18n.t('tour2'),
    params: {
      enableScrolling: false,
      placement: 'top',
    },
    before: function() {
      tourStepCount = 2
    },
  },
  {
    target: '[data-v-step="3"]',
    content: i18n.t('tour3'),
    params: {
      enableScrolling: false,
      placement: 'right',
      modifiers: {
        offset: {
        enabled: true,
        offset: '0, 0',
        },
      },
    },
    before: function() {
      tourStepCount = 3
    },
  },
  {
    target: '[data-v-step="4"]',
    content: i18n.t('tour4'),
    params: {
      enableScrolling: false,
      placement: 'left',
      modifiers: {
        offset: {
        enabled: true,
        offset: '0, 0',
        },
      },
    },
    before: function() {
      tourStepCount = 4
    },
  },
  {
    target: '[data-v-step="5"]',
    content: i18n.t('tour5'),
    params: {
      enableScrolling: false,
      placement: 'bottom',
    },
    before: function() {
      tourStepCount = 5
    },
  },
  {
    target: '[data-v-step="6"]',
    content: i18n.t('tour6'),
    params: {
      enableScrolling: false,
      placement: 'bottom',
    },
    before: function() {
      tourStepCount = 6
    },
  },
  {
    target: '[data-v-step="7"]',
    content: i18n.t('tour7'),
    params: {
      enableScrolling: false,
      placement: 'bottom',
    },
    before: function() {
      tourStepCount = 7
    },
  },
])



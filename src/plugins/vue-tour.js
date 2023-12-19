import Vue from 'vue'
import VueTour from 'vue-tour'
import 'vue-tour/dist/vue-tour.css'
export const tourConfig = {
  useKeyboardNavigation: true,
}

Vue.use(VueTour)

export let tourStepCount = null

export const generateTourSteps = (data) => ([
  {
    target: '[data-v-step="1"]',
    content: 'Welcome to the <strong>'+ data.title +'</strong> platform!', // TODO: make the title of the platform in bold to take it automatically, like the viewer header title
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
    content: 'Select one or more layers to visualize',
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
    content: 'Change the order of the selected layers',
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
    content: 'View the legends of the layers',
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
    content: 'Download layers',
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
    content: 'Manage favourite layers',
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
    content: 'Control layer time',
    params: {
      enableScrolling: false,
      placement: 'bottom',
    },
    before: function() {
      tourStepCount = 7
    },
  },
])



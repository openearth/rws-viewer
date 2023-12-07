import Vue from 'vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
import piwik from './plugins/piwik-analytics'
import './plugins/composition-api'
import { i18n } from './plugins/i18n'
import './plugins/mapbox'
import './plugins/vue-tour'

import '@/css/tour.css'

import App from './App.vue'

Vue.config.productionTip = false

import './components/AppCore/index.scss'

Vue.use(piwik)

new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: h => h(App),
}).$mount('#app')

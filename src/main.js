import Vue from 'vue'
import router from './router'
import store from './store'

import vuetify from './plugins/vuetify'
import './plugins/composition-api'
import './plugins/axios'

const App = () => import('./App.vue')

Vue.config.productionTip = false

import './components/AppCore/index.scss'

new Vue({
  router,
  store,
  vuetify,
  render: h => h(App),
}).$mount('#app')

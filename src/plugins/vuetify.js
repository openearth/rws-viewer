import Vue from 'vue'
import Vuetify from 'vuetify/lib'
import themes from '@deltares/vuetify-theme'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    themes,
  },
})

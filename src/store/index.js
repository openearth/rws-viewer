import Vue from 'vue'
import Vuex from 'vuex'

import app from './modules/app'
import data from './modules/data'
import map from './modules/map'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    data,
    map,
  },
})

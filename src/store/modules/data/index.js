import configRepo from '~/repo/configRepo'
import { VALID_PLATFORMS } from '~/lib/constants'

export default {
  namespaced: true,

  state: () => ({
    layers: [],
  }),

  getters: {
    availableLayers(state) {
      return state.layers
    },
  },

  actions: {
    getAppData({ commit }, route) {
      const platform = route?.query?.platform
      const isValidPlatform = platform && VALID_PLATFORMS.includes(platform)
      const platformToUse = isValidPlatform ? platform : VALID_PLATFORMS[0]
      const { layers, name } = configRepo.getConfig(platformToUse)

      if (!isValidPlatform) {
        console.warn(`No (valid) platform provided in the query string, falling back to ${ platformToUse }`)
      }

      commit('app/SET_APP_NAME', { name }, { root: true })
      commit('SET_DATA_LAYERS', { layers })
    },
    setDataLayers({ commit }, { layers }) {
      commit('SET_DATA_LAYERS', { layers })
    },
  },

  mutations: {
    SET_DATA_LAYERS(state, { layers }) {
      state.layers = layers
    },
  },
}

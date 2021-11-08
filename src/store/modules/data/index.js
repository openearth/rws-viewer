import configRepo from '~/repo/configRepo'

export default {
  namespaced: true,

  state: () => ({
    originalLayers: [],
    displayLayers: [],
  }),

  getters: {
    displayLayers: state => state.displayLayers,
  },

  mutations: {
    SET_ORIGINAL_LAYERS(state, { layers }) {
      state.originalLayers = Object.freeze(layers)
    },
    SET_DISPLAY_LAYERS(state, { layers }) {
      state.displayLayers = Object.freeze(layers)
    },
  },

  actions: {
    getAppData({ commit, dispatch }, route) {
      const platform = route?.query?.platform
      const { layers, name } = configRepo.getConfig(platform)

      dispatch('app/setAppName', { name }, { root: true })
      commit('SET_ORIGINAL_LAYERS', { layers })
      commit('SET_DISPLAY_LAYERS', { layers })
    },

    resetDisplayLayers({ commit, state }) {
      commit('SET_DISPLAY_LAYERS', state.originalLayers)
    },

    setDisplayLayers({ commit }, { layers }) {
      commit('SET_DISPLAY_LAYERS', { layers })
    },
  },
}

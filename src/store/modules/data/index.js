import configRepo from '~/repo/configRepo'

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
    getAppData({ commit, dispatch }, route) {
      const platform = route?.query?.platform
      const { layers, name } = configRepo.getConfig(platform)

      dispatch('app/setAppName', { name }, { root: true })
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

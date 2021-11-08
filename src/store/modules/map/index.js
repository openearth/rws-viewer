import buildWmsLayer from '~/lib/build-wms-layer'

export default {
  namespaced: true,

  state: () => ({
    layers: [],
  }),

  getters: {},

  mutations: {
    SET_ACTIVE_LAYERS(state, { layers }) {
      const wmsLayers = layers.map(layer => buildWmsLayer(layer))
      state.layers = wmsLayers
    },
  },

  actions: {
    setActiveLayers({ commit }, { layers }) {
      commit('SET_ACTIVE_LAYERS', { layers })
    },
  },
}

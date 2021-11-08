import buildWmsLayer from '~/lib/build-wms-layer'

export default {
  namespaced: true,

  state: () => ({
    rasterLayers: [],
  }),

  getters: {},

  mutations: {
    SET_RASTER_LAYERS(state, { layers }) {
      const wmsLayers = layers.map(layer => buildWmsLayer(layer))
      state.rasterLayers = wmsLayers
    },
  },

  actions: {
    setRasterLayers({ commit }, { layers }) {
      commit('SET_RASTER_LAYERS', { layers })
    },
  },
}

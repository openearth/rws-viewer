import buildWmsLayer from '~/lib/build-wms-layer'

export default {
  namespaced: true,

  state: () => ({
    rasterLayers: [],
    drawMode: null,
  }),

  getters: {},

  mutations: {
    SET_RASTER_LAYERS(state, { layers }) {
      const wmsLayers = layers.map(layer => buildWmsLayer(layer))
      state.rasterLayers = wmsLayers
    },
    SET_DRAW_MODE(state, { mode }) {
      state.drawMode = mode
    },
  },

  actions: {
    setRasterLayers({ commit }, { layers }) {
      commit('SET_RASTER_LAYERS', { layers })
    },

    setDrawMode({ commit, state }, { mode }) {
      const modeToCommit = state.drawMode === mode ? null : mode
      commit('SET_DRAW_MODE', { mode: modeToCommit })
    },
  },
}

import buildWmsLayer from '~/lib/build-wms-layer'

export default {
  namespaced: true,

  state: () => ({
    rasterLayers: [],
    drawMode: null,
    drawnFeature: null,
  }),

  getters: {
    rasterLayers: state => state.rasterLayers,
    drawMode: state => state.drawMode,
    drawnFeature: state => state.drawnFeature,
  },

  mutations: {
    SET_RASTER_LAYERS(state, { layers }) {
      const wmsLayers = layers.map(layer => buildWmsLayer(layer))
      state.rasterLayers = wmsLayers
    },
    SET_DRAW_MODE(state, { mode }) {
      state.drawMode = mode
    },
    SET_DRAWN_FEATURE(state, feature) {
      state.drawnFeature = Object.freeze(feature)
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

    clearDrawnFeature({ commit }) {
      commit('SET_DRAWN_FEATURE', null)
    },

    setDrawnFeature({ commit, state }, feature) {
      if(state.drawMode) commit('SET_DRAW_MODE', { mode: null })
      commit('SET_DRAWN_FEATURE', feature)
    },
  },
}

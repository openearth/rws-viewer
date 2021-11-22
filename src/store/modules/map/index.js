import buildWmsLayer from '~/lib/build-wms-layer'

export default {
  namespaced: true,

  state: () => ({
    rasterLayers: [],
    drawMode: null,
    drawnFeature: null,
    selectedTemplateFeatures: [],
  }),

  getters: {
    rasterLayers: state => state.rasterLayers,
    drawMode: state => state.drawMode,
    drawnFeature: state => state.drawnFeature,
    selectedTemplateFeatures: state => state.selectedTemplateFeatures,
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
    SET_SELECTED_TEMPLATE_FEATURES(state, features) {
      state.selectedTemplateFeatures = features.map(Object.freeze)
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

    setSelectedTemplateFeatures({ commit }, features) {
      commit('SET_SELECTED_TEMPLATE_FEATURES', features)
    },
  },
}

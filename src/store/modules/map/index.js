import { update } from 'ramda'
import buildWmsLayer from '~/lib/build-wms-layer'
import mapLayerOpacity from '~/lib/map-layer-opacity'

export default {
  namespaced: true,

  state: () => ({
    rasterLayers: [],
    drawMode: null,
    drawnFeatures: Object.freeze({
      type: 'FeatureCollection',
      features: [],
    }),
  }),

  getters: {
    rasterLayers: state => state.rasterLayers,
    drawMode: state => state.drawMode,
    drawnFeatures: state => state.drawnFeatures,
  },

  mutations: {
    SET_RASTER_LAYERS(state, { layers }) {
      const wmsLayers = layers.map(layer => buildWmsLayer(layer))
      const mappedWmsLayers = mapLayerOpacity(state.rasterLayers, wmsLayers)

      state.rasterLayers = mappedWmsLayers
    },
    SET_DRAW_MODE(state, { mode }) {
      state.drawMode = mode
    },
    SET_DRAWN_FEATURES(state, featureCollection) {
      state.drawnFeatures = Object.freeze(featureCollection)
    },
    UPDATE_RASTER_LAYER_OPACITY(state, { id, opacity }) {
      const layerToUpdate = state.rasterLayers.find(layer => layer.id === id)
      const index = state.rasterLayers.findIndex(layer => layer.id === id)

      if (index === -1) {
        return
      }

      layerToUpdate.opacity = opacity

      state.rasterLayers = update(index, layerToUpdate, state.rasterLayers)
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

    setDrawnFeatures({ commit, state }, featureCollection) {
      if (state.drawMode) {
        commit('SET_DRAW_MODE', { mode: null })
      }
      commit('SET_DRAWN_FEATURES', featureCollection)
    },

    updateRasterLayerOpacity({ commit }, { id, opacity }) {
      commit('UPDATE_RASTER_LAYER_OPACITY', { id, opacity })
    },
  },
}

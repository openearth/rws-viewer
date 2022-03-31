import { difference, update } from 'ramda'
import buildWmsLayer from '~/lib/build-wms-layer'
import mapLayerOpacity from '~/lib/map-layer-opacity'
import mapLayersWithTimeFilter from '~/lib/map-layers-with-time-filter'

export default {
  namespaced: true,

  state: () => ({
    mapLoaded: false,
    rasterLayers: [],
    drawMode: null,
    drawnFeature: null,
    //perhaps add activeLayerToFilter ?
  }),

  getters: {
    mapLoaded: state => state.mapLoaded,
    rasterLayers: state => (state.mapLoaded && state.rasterLayers) || [], //layers that have been added on map
    rasterLayerIds: state => (state.rasterLayers || []).map(({ id }) => id),//id of layers that have been added on map
    rasterLayerWithTimeIds (state, getters) {
      if (!getters.rasterLayers) {
        return []
      }
      return getters.rasterLayers.filter(layer => layer?.timeFilter).map(({ id })=>id)
    },
    wmsLayers (state, getters, rootState)  { // derive from raster layers; mapbox layers format
      
      const { rasterLayers } = state
      
      const { selectedTimestamp } = rootState.data
      if (!rasterLayers) {
        return []
      }
      //If a layer has the timeOption true then add to it the selectdTimestamp
      // WRONG!! If I do that then I fall to the trap that all the layers with time option will have 
      // the same timestamp.
      // Introduce idLayerToFilter
      const mappedTimeFilterLayers = mapLayersWithTimeFilter(rasterLayers, selectedTimestamp)
      
      const wmsLayers = mappedTimeFilterLayers.map(layer => buildWmsLayer(layer))
      //const mappedWmsLayers = mapLayerOpacity(state.rasterLayers, wmsLayers)
      return wmsLayers
    },
    wmsLayerIds: state => (state.rasterLayers || []).map(({ id }) => id),
    drawMode: state => state.drawMode,
    drawnFeature: state => state.drawnFeature,
  },

  mutations: {
    SET_MAP_LOADED(state) {
      state.mapLoaded = true
    },
    SET_RASTER_LAYERS(state, { layers }) {
      state.rasterLayers = layers
    },
    ADD_RASTER_LAYER(state, { layer }) {
      state.rasterLayers = [ layer, ...state.rasterLayers ]
    },
    MOVE_RASTER_LAYER(state, { fromIndex, toIndex }) {
      var element = state.rasterLayers[fromIndex]
      state.rasterLayers.splice(fromIndex, 1)
      state.rasterLayers.splice(toIndex, 0, element)
    },
    REMOVE_RASTER_LAYER(state, { layer }) {
      state.rasterLayers = state.rasterLayers.filter(rasterLayer => rasterLayer.id !== layer.id)
    },
    SET_DRAW_MODE(state, { mode }) {
      state.drawMode = mode
    },
    SET_DRAWN_FEATURE(state, feature) {
      state.drawnFeature = Object.freeze(feature)
    },
    UPDATE_RASTER_LAYER_OPACITY(state, { id, opacity }) {
      const layerToUpdate = state.rasterLayers.find(layer => layer.id === id)
      const index = state.rasterLayers.findIndex(layer => layer.id === id)

      if (!layerToUpdate) {
        return
      }

      layerToUpdate.opacity = opacity

      state.rasterLayers = update(index, layerToUpdate, state.rasterLayers)
    },
  },

  actions: {
    setMapLoaded({ commit }) {
      commit('SET_MAP_LOADED')
    },

    setRasterLayers({ commit, state }, { layers }) {
  /*     const wmsLayers = layers.map(layer => buildWmsLayer(layer))
      const mappedWmsLayers = mapLayerOpacity(state.rasterLayers, wmsLayers) */

      //commit('SET_RASTER_LAYERS', { layers: mappedWmsLayers })
      commit('SET_RASTER_LAYERS', { layers: layers })
    },

    addRasterLayer({ commit, state }, { layers }) {
/*       const wmsLayers = layers.map(layer => buildWmsLayer(layer))
     
      const mappedWmsLayers = mapLayerOpacity(state.rasterLayers, wmsLayers)
      const layersToAdd = difference(mappedWmsLayers, state.rasterLayers)
      console.log('layersToAdd', layersToAdd)
      layersToAdd.forEach(layer => {
        commit('ADD_RASTER_LAYER', { layer })
      }) */
     
      const layersToAdd = difference(layers , state.rasterLayers)
     
      layersToAdd.forEach(layer => {
        commit('ADD_RASTER_LAYER', { layer })
      })
    },

    removeRasterLayer({ commit }, { layers }) {
      layers.forEach(layer => commit('REMOVE_RASTER_LAYER', { layer }))
    },

    moveRasterLayer({ commit }, { fromIndex, toIndex }) {
      commit('MOVE_RASTER_LAYER', { fromIndex, toIndex })
    },

    setDrawMode({ commit, state }, { mode }) {
      const modeToCommit = state.drawMode === mode ? null : mode
      commit('SET_DRAW_MODE', { mode: modeToCommit })
    },

    setDrawnFeature({ commit, state }, feature) {
      if (state.drawMode) {
        commit('SET_DRAW_MODE', { mode: null })
      }
      commit('SET_DRAWN_FEATURE', feature)
    },

    clearDrawnFeature({ commit }) {
      commit('SET_DRAWN_FEATURE', null)
    },

    updateRasterLayerOpacity({ commit }, { id, opacity }) {
      commit('UPDATE_RASTER_LAYER_OPACITY', { id, opacity })
    },
  },
}

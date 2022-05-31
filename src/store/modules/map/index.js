import { difference, update } from 'ramda'
import buildWmsLayer from '~/lib/build-wms-layer'
import mapLayerOpacity from '~/lib/map-layer-opacity'
import mapLayersWithFilter from '~/lib/map-layers-with-filter'
import { getWmsCapabilities, getLayerProperties } from '~/lib/get-capabilities'


export default {
  namespaced: true,

  state: () => ({
    mapLoaded: false,
    activeFlattenedLayers: [],
    drawMode: null,
    drawnFeature: null,
    filtersLayerId: null, // id of active layer to filter
  }),

  getters: {
    mapLoaded: state => state.mapLoaded,
    activeFlattenedLayers: state => (state.mapLoaded && state.activeFlattenedLayers) || [], //layers that have been added on map (not in wmsLayers format) TODO: the activeFlattenedLayers name is not reprsentative since they are not all activeFlattenedLayers
    activeFlattenedLayerIds: state => (state.activeFlattenedLayers || []).map(({ id }) => id),//id of layers that have been added on map
    activeFlattenedLayersIdsWithTimeOption (state, getters) {
      if (!getters.activeFlattenedLayers) {
        return []
      }
      return getters.activeFlattenedLayers.filter(layer => layer?.timeFilter).map(({ id })=>id)
    },
    wmsLayers (state, getters, rootState)  { // derive from raster layers; mapbox layers format
      
      const { activeFlattenedLayers, filtersLayerId } = state
      
      const { selectedTimestamp, cqlFilter } = rootState.data
      if (!activeFlattenedLayers) {
        return []
      }
   
      const mappedFilteredLayers = mapLayersWithFilter(activeFlattenedLayers, filtersLayerId, selectedTimestamp, cqlFilter)
      const wmsLayers = mappedFilteredLayers.map(layer => buildWmsLayer(layer))
      const mappedWmsLayers = mapLayerOpacity(state.activeFlattenedLayers, wmsLayers)
      
      return mappedWmsLayers
    },
    wmsLayerIds: state => (state.activeFlattenedLayers || []).map(({ id }) => id),
    drawMode: state => state.drawMode,
    drawnFeature: state => state.drawnFeature,
    filtersLayerId: state => state.filtersLayerId,
  },

  mutations: {
    SET_MAP_LOADED(state) {
      state.mapLoaded = true
    },
    SET_RASTER_LAYERS(state, { layers }) {
      state.activeFlattenedLayers = layers
    },
    ADD_RASTER_LAYER(state, layer) {
      state.activeFlattenedLayers = [ layer, ...state.activeFlattenedLayers ]
    },
    MOVE_RASTER_LAYER(state, { fromIndex, toIndex }) {
      var element = state.activeFlattenedLayers[fromIndex]
      state.activeFlattenedLayers.splice(fromIndex, 1)
      state.activeFlattenedLayers.splice(toIndex, 0, element)
    },
    REMOVE_RASTER_LAYER(state, { layer }) {
      state.activeFlattenedLayers = state.activeFlattenedLayers.filter(rasterLayer => rasterLayer.id !== layer.id)
    },
    SET_DRAW_MODE(state, { mode }) {
      state.drawMode = mode
    },
    SET_DRAWN_FEATURE(state, feature) {
      state.drawnFeature = Object.freeze(feature)
    },
    UPDATE_RASTER_LAYER_OPACITY(state, { id, opacity }) {
      const layerToUpdate = state.activeFlattenedLayers.find(layer => layer.id === id)
      const index = state.activeFlattenedLayers.findIndex(layer => layer.id === id)

      if (!layerToUpdate) {
        return
      }

      layerToUpdate.opacity = opacity
      state.activeFlattenedLayers = update(index, layerToUpdate, state.activeFlattenedLayers)
    },
    SET_FILTERS_LAYER_ID(state, id) {
      state.filtersLayerId = id
    },
    REMOVE_FILTERS_LAYER_ID(state) {
      state.filtersLayerId = null
    },
  },

  actions: {
    setMapLoaded({ commit }) {
      commit('SET_MAP_LOADED')
    },

    setactiveFlattenedLayers({ commit, state }, { layers }) {
  /*     const wmsLayers = layers.map(layer => buildWmsLayer(layer))
      const mappedWmsLayers = mapLayerOpacity(state.activeFlattenedLayers, wmsLayers) */

      //commit('SET_RASTER_LAYERS', { layers: mappedWmsLayers })
      
      commit('SET_RASTER_LAYERS', { layers: layers })
    },

    addRasterLayer({ commit, state }, { layers }) {
/*       const wmsLayers = layers.map(layer => buildWmsLayer(layer))
     
      const mappedWmsLayers = mapLayerOpacity(state.activeFlattenedLayers, wmsLayers)
      const layersToAdd = difference(mappedWmsLayers, state.activeFlattenedLayers)
      console.log('layersToAdd', layersToAdd)
      layersToAdd.forEach(layer => {
        commit('ADD_RASTER_LAYER', { layer })
      }) */
      
      const layersToAdd = difference(layers , state.activeFlattenedLayers)
  
      layersToAdd.forEach((layer) => {
        getWmsCapabilities(layer.url)
          .then(capabilities => getLayerProperties(capabilities, layer.layer))
          .then(({ serviceType, timeExtent }) => commit('ADD_RASTER_LAYER',  
          { ...layer, ...{ serviceType: serviceType }, ... { timeExtent: timeExtent } } ),
          )
      })  
    },

    removeRasterLayer({ commit }, { layers }) {
      layers.forEach(layer => commit('REMOVE_RASTER_LAYER', { layer }))
    },
    //TODO: I dont like this implementation 
    removeFiltersLayerId({ commit }) {
      commit('REMOVE_FILTERS_LAYER_ID')
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
    setFiltersLayerId({ commit }, id) {
      commit('SET_FILTERS_LAYER_ID', id)
    },
  },
}

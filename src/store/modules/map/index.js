import { difference, update } from 'ramda'
import buildWmsLayer from '~/lib/build-wms-layer'
import mapLayerOpacity from '~/lib/map-layer-opacity'
import addFilterAttributesToLayer from '~/lib/add-filter-attributes-to-layer'
import { getWmsCapabilities, getLayerProperties } from '~/lib/get-capabilities'


export default {
  namespaced: true,

  state: () => ({
    mapLoaded: false,
    activeFlattenedLayers: [],
    drawMode: null,
    drawnFeature: null,
    filteredLayerId: null, // id of active layer to filter
    wmsLayers: [], 
  }),

  getters: {
    mapLoaded: state => state.mapLoaded,
    activeFlattenedLayers: state => (state.mapLoaded && state.activeFlattenedLayers) || [], 
    activeFlattenedLayerIds: state => (state.activeFlattenedLayers || []).map(({ id }) => id),
    activeFlattenedLayersIdsWithTimeOption (state, getters) {
      if (!getters.activeFlattenedLayers) {
        return []
      }
      return getters.activeFlattenedLayers.filter(layer => layer?.timeFilter).map(({ id })=>id)
    },
    wmsLayers: state => state.wmsLayers,
/*     wmsLayers (state, getters, rootState)  { 
      
      const { activeFlattenedLayers, filteredLayerId } = state
      
      const { selectedTimestamp, cqlFilter } = rootState.data
      if (!activeFlattenedLayers) {
        return []
      }
   
      const mappedFilteredLayers = mapLayersWithFilter(activeFlattenedLayers, filteredLayerId, selectedTimestamp, cqlFilter)
      const wmsLayers = mappedFilteredLayers.map(layer => buildWmsLayer(layer))
      const mappedWmsLayers = mapLayerOpacity(state.activeFlattenedLayers, wmsLayers)
      
      return mappedWmsLayers
    }, */
    wmsLayerIds: state => (state.activeFlattenedLayers || []).map(({ id }) => id),
    drawMode: state => state.drawMode,
    drawnFeature: state => state.drawnFeature,
    filteredLayerId: state => state.filteredLayerId,
  },

  mutations: {
    SET_MAP_LOADED(state) {
      state.mapLoaded = true
    },
    SET_RASTER_LAYERS(state, { layers }) {
      state.activeFlattenedLayers = layers
    },
    ADD_ACTIVE_FLATTENED_LAYER(state, layer) {
      state.activeFlattenedLayers = [ layer, ...state.activeFlattenedLayers ]
    },
    MOVE_ACTIVE_FLATTENED_LAYER(state, { fromIndex, toIndex }) {
      var element = state.activeFlattenedLayers[fromIndex]
      state.activeFlattenedLayers.splice(fromIndex, 1)
      state.activeFlattenedLayers.splice(toIndex, 0, element)
    },
    REMOVE_ACTIVE_FLATTENED_LAYER(state, { layer }) {
      state.activeFlattenedLayers = state.activeFlattenedLayers.filter(activeLayer => activeLayer.id !== layer.id)
    },
    ADD_WMS_LAYER(state, layer) {
      state.wmsLayers = [ layer, ...state.wmsLayers ]
    },
    REMOVE_WMS_LAYER(state, layerId) {
      state.wmsLayers = state.wmsLayers.filter(wmsLayer => wmsLayer.id !== layerId)
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
      state.filteredLayerId = id
    },
    REMOVE_FILTERS_LAYER_ID(state) {
      state.filteredLayerId = null
    },
  },

  actions: {
    setMapLoaded({ commit }) {
      commit('SET_MAP_LOADED')
    },
    loadLayerOnMap({ commit, state }, { layers }) {
/*       const wmsLayers = layers.map(layer => buildWmsLayer(layer))
     
      const mappedWmsLayers = mapLayerOpacity(state.activeFlattenedLayers, wmsLayers)
      const layersToAdd = difference(mappedWmsLayers, state.activeFlattenedLayers)
      console.log('layersToAdd', layersToAdd)
      layersToAdd.forEach(layer => {
        commit('ADD_ACTIVE_FLATTENED_LAYER', { layer })
      }) */
      
      const layersToAdd = difference(layers , state.activeFlattenedLayers)
      console.log('layerToAdd', layersToAdd)
      layersToAdd.forEach((layer) => {
        getWmsCapabilities(layer.url)
          .then(capabilities => getLayerProperties(capabilities, layer.layer))
          .then(({ serviceType, timeExtent }) => {
            commit('ADD_ACTIVE_FLATTENED_LAYER', { ...layer, ...{ serviceType: serviceType }, ... { timeExtent: timeExtent } } )
            commit('ADD_WMS_LAYER', buildWmsLayer({ ...layer, ...{ serviceType: serviceType }, ... { timeExtent: timeExtent } }))
          }, 
          )
      })  
    },
    reloadLayerOnMap({ commit, state, rootState }) {
      /* If a layer has the time option true, 
      then in the filter tab the user can load on 
      the map the layer with a new time or a new cql filter */
      //remove layer from map to reload it with extra attributes
      const { filteredLayerId, activeFlattenedLayers } = state
      commit('REMOVE_WMS_LAYER', filteredLayerId)
      const { selectedTimestamp, cqlFilter } = rootState.data
      const layer = addFilterAttributesToLayer(activeFlattenedLayers, filteredLayerId, selectedTimestamp, cqlFilter )
      
      commit('ADD_WMS_LAYER', buildWmsLayer(layer))
    },
    removeLayerFromMap({ commit }, { layers }) {
      layers.forEach(layer => {
        commit('REMOVE_ACTIVE_FLATTENED_LAYER', { layer })
        commit('REMOVE_WMS_LAYER', layer.id)
      })
    },
    //TODO: I dont like this implementation 
    removefilteredLayerId({ commit }) {
      commit('REMOVE_FILTERS_LAYER_ID')
    },

    moveRasterLayer({ commit }, { fromIndex, toIndex }) {
      commit('MOVE_ACTIVE_FLATTENED_LAYER', { fromIndex, toIndex })
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
    setfilteredLayerId({ commit }, id) {
      commit('SET_FILTERS_LAYER_ID', id)
    },
  },
}

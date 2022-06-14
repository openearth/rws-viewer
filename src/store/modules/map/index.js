import { difference, update } from 'ramda'
import buildWmsLayer from '~/lib/build-wms-layer'
import addFilterAttributesToLayer from '~/lib/add-filter-attributes-to-layer'
import { getWmsCapabilities, getLayerProperties } from '~/lib/get-capabilities'
import { NEDERLANDS_MAP_CENTER, NEDERLANDAS_MAP_ZOOM } from '~/lib/constants'

export default {
  namespaced: true,

  state: () => ({
    mapLoaded: false,
    activeFlattenedLayers: [],
    drawMode: null,
    selectMode: null,
    drawnFeature: null,
    filtersLayerId: null, // id of active layer to filter
    selectedLayerForSelection: null,
    wmsLayers: [],
    mapCenter: NEDERLANDS_MAP_CENTER,
    mapZoom: NEDERLANDAS_MAP_ZOOM,
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
    wmsLayerIds: state => (state.activeFlattenedLayers || []).map(({ id }) => id),
    drawMode: state => state.drawMode,
    selectMode: state => state.selectMode,
    drawnFeature: state => state.drawnFeature,
    mapCenter: state => state.mapCenter,
    mapZoom: state => state.mapZoom,
    filtersLayerId: state => state.filtersLayerId,
    selectedLayerForSelection: state => state.selectedLayerForSelection,
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
    SET_SELECT_MODE(state, { mode }) {
      state.selectMode = mode
    },
    SET_DRAWN_FEATURE(state, feature) {
      state.drawnFeature = Object.freeze(feature)
    },
    UPDATE_WMS_LAYER_OPACITY(state, { id, opacity }) {
      const layerToUpdate = state.wmsLayers.find(layer => layer.id === id)
      const index = state.wmsLayers.findIndex(layer => layer.id === id)

      if (!layerToUpdate) {
        return
      }

      layerToUpdate.opacity = opacity
      state.wmsLayers = update(index, layerToUpdate, state.wmsLayers)
    },
    SET_FILTERS_LAYER_ID(state, id) {
      state.filteredLayerId = id
    },
    REMOVE_FILTERS_LAYER_ID(state) {
      state.filteredLayerId = null
    },
    SET_MAP_CENTER(state, coords) {
      state.mapCenter = coords
    },
    SET_MAP_ZOOM(state, zoom) {
      state.mapZoom = zoom
    },
    SET_SELECTED_LAYER_FOR_SELECTION(state, layer) {
      state.selectedLayerForSelection = layer
    },
  },

  actions: {
    setMapLoaded({ commit }) {
      commit('SET_MAP_LOADED')
    },
    loadLayerOnMap({ commit, state }, { layers }) {

      const layersToAdd = difference(layers , state.activeFlattenedLayers)

      layersToAdd.forEach((layer) => {
        getWmsCapabilities(layer.url)
          .then(capabilities => getLayerProperties(capabilities, layer.layer))
          .then(({ serviceType, timeExtent, wmsVersion }) => {
            commit('ADD_ACTIVE_FLATTENED_LAYER', { ...layer, ...{ serviceType: serviceType }, ... { timeExtent: timeExtent }, ... { version: wmsVersion } } )
            commit('ADD_WMS_LAYER', buildWmsLayer({ ...layer, ...{ serviceType: serviceType }, ... { timeExtent: timeExtent }, ... { version: wmsVersion } }))
          },
          )
      })
    },
    reloadLayerOnMap({ commit, state, rootState }) {
      /* If a layer has the time option true,
      then in the filter tab the user can load on
      the map the layer with a new time or a new cql filter */

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

    setSelectMode({ commit, state }, { mode }) {
      const modeToCommit = state.selectMode === mode ? null : mode
      commit('SET_SELECT_MODE', { mode: modeToCommit })
    },

    setDrawnFeature({ commit, state }, feature) {
      if (state.drawMode) {
        commit('SET_DRAW_MODE', { mode: null })
      }

      if (state.selectMode) {
        commit('SET_SELECT_MODE', { mode: null })
      }

      commit('SET_DRAWN_FEATURE', feature)
    },

    clearDrawnFeature({ commit }) {
      commit('SET_DRAWN_FEATURE', null)
    },

    updateWmsLayerOpacity({ commit }, { id, opacity }) {
      commit('UPDATE_WMS_LAYER_OPACITY', { id, opacity })
    },

    setFiltersLayerId({ commit }, id) {
      commit('SET_FILTERS_LAYER_ID', id)
    },

    setSelectedLayerForSelection({ commit }, layer) {
      commit('SET_SELECTED_LAYER_FOR_SELECTION', layer)
    },

    setMapCenter({ commit }, coords) {
      commit('SET_MAP_CENTER', coords)
    },
    setMapZoom({ commit }, zoom) {
      commit('SET_MAP_ZOOM', zoom)
    },
  },
}

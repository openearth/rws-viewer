import slugify from '@sindresorhus/slugify'
import { uniqBy, uniq, difference } from 'ramda'
import router from '../../../router'
import configRepo from '~/repo/configRepo'
import { getViewerConfiguration } from '~/repo/configRepo'
import { flattenLayers, getLayersTags, getLayersById, omitLayers } from '~/lib/layer-helpers.js'
import { apis } from '../../../../public/data/api.json'

export default {
  namespaced: true,

  state: () => ({
    displayLayers: [],
    flattenedLayers: [],
    layerTags: [],
    timeExtent: [], //array with isoString format, timeExtent of the selected layer in the filters tab
    selectedTimestamp: null, // needed in ISOstring format
    cqlFilter: null,
    apis,
    openedFolders: [], // folders that are open in the layer structure
  }),

  getters: {
    rawDisplayLayers: state => state.displayLayers,
    displayLayers: (state, getters) => getters.rawDisplayLayers.length === 1
      ? getters.rawDisplayLayers[0].children
      : getters.rawDisplayLayers,
    flattenedLayers: state => state.flattenedLayers,
    layerTags: state => state.layerTags,
    availableDisplayLayers: (state, getters, rootState, rootGetters) =>
      omitLayers(getters.displayLayers, rootGetters['map/activeFlattenedLayerIds']),
    availableFlattenedLayers: (state, getters, rootState, rootGetters) =>
      getters.flattenedLayers.filter(layer => !rootGetters['map/activeFlattenedLayerIds'].includes(layer.id)),
    loadedViewerConfigs: state => state.displayLayers.map(({ name }) => slugify(name)),
    timeExtent: state => state.timeExtent,
    selectedTimestamp: state => state.selectedTimestamp,
    cqlFilter: state => state.cqlFilter,
    openedFolders: state => state.openedFolders,
  },

  mutations: {
    SET_DISPLAY_LAYERS(state, { layers }) {
      state.displayLayers = Object.freeze(layers)
    },
    SET_FLATTENED_LAYERS(state, { layers }) {
      state.flattenedLayers = Object.freeze(layers)
    },
    SET_LAYER_TAGS(state, { tags }) {
      state.layerTags = Object.freeze(tags)
    },
    SET_TIME_EXTENT(state, extent) {
      state.timeExtent = extent
    },
    SET_SELECTED_TIMESTAMP(state, timestamp) {
      state.selectedTimestamp = timestamp
    },
    SET_CQL_FILTER(state, filter) {
      state.cqlFilter = filter
    },
    RESET_TIME_EXTENT(state) {
      state.timeExtent = []
    },
    SET_OPENED_FOLDERS(state, folders) {
      state.openedFolders = folders
    },
  },

  actions: {
    async getAppData({ dispatch, commit }, { route, locale }) {
      const viewer = route?.params?.config

      //Set viewer configuration
      const { mapCenter, mapZoom, defaultLayer, privacyStatement, userAgreement } = await getViewerConfiguration(viewer, locale)

      dispatch('map/setMapCenter', mapCenter, { root: true })
      dispatch('map/setMapZoom', mapZoom, { root: true })

      const { layers, name } = await dispatch('addViewerData', { viewer, locale })

      dispatch('app/setViewerName', { name }, { root: true })
      dispatch('app/setViewerPrivacyStatement', { privacyStatement }, { root: true })
      dispatch('app/setViewerUserAgreement', { userAgreement }, { root: true })

      const searchParams = new URLSearchParams(window.location.search)
      const initialLayerIds = (searchParams.get('layers') || '').split(',')
      const folders = (searchParams.get('folders') || '').split(',')
      //if there are folders in the url, store them in the openedFolders state
      commit('SET_OPENED_FOLDERS', folders)
      let layersById = getLayersById(layers, initialLayerIds)

      if (!layersById.length && defaultLayer?.id) {
        initialLayerIds.push(defaultLayer.id)
        layersById = getLayersById(layers, initialLayerIds)
      }

      if (layersById.length) {
        dispatch('map/loadLayerOnMap', { layers: layersById }, { root: true })
      }
    },

    async addViewerData({ commit }, { viewer, locale }) {
      const { layers: viewerLayers, name } = await configRepo.getConfig(viewer, locale)

      commit('SET_DISPLAY_LAYERS', { layers: [ ...viewerLayers ] })

      const flattenedViewerLayers = flattenLayers(viewerLayers)

      const flattenedLayers = uniqBy(layer => layer?.id, [...flattenedViewerLayers])
      commit('SET_FLATTENED_LAYERS', { layers: flattenedLayers })

      const viewerTags = getLayersTags(flattenedViewerLayers)
      const tags = uniq([ ...viewerTags ])
      commit('SET_LAYER_TAGS', { tags })

      const currentRoute = router.currentRoute
      const viewersInRoute = currentRoute.params.config.split(',')
      const newViewerParts = viewer.split(',')
      const viewerPartsToAdd = difference(newViewerParts, viewersInRoute)

      if (viewerPartsToAdd.length) {
        const config = [ currentRoute.params.config, viewerPartsToAdd.join(',') ].join(',')
        const params = { ...currentRoute.params, config }
        commit('app/SET_VIEWER_CONFIG', params.config, { root: true })
        router.replace({ ...currentRoute, ...{ params } })
      }

      return { layers: viewerLayers, name }
    },

    removeViewerData({ state, commit }, viewer) {
      const viewerLayers = state.displayLayers.find(layer => slugify(layer.name) === viewer)

      const flattenedViewerLayers = flattenLayers(viewerLayers)
      const flattenedViewerLayerIds = flattenedViewerLayers.map(({ id }) => id)
      const flattenedViewerLayersToRemain = state.flattenedLayers.filter(layer =>
        flattenedViewerLayerIds.includes(layer.id) === false,
      )
      commit('SET_FLATTENED_LAYERS', { layers: flattenedViewerLayersToRemain })

      const displayLayersToRemain = state.displayLayers.filter(layer => slugify(layer.name) !== viewer)
      commit('SET_DISPLAY_LAYERS', { layers: displayLayersToRemain })

      const viewerTags = getLayersTags(flattenedViewerLayers)
      const tagsToRemain = state.layerTags.filter(tag => viewerTags.includes(tag) === false)
      commit('SET_LAYER_TAGS', { tags: tagsToRemain })

      const currentRoute = router.currentRoute
      const config = currentRoute.params.config
        .split(',')
        .filter(name => name !== viewer)
        .join(',')
      commit('app/SET_VIEWER_CONFIG', config, { root: true })

      router.replace({ ...currentRoute, ...{ params: { ...currentRoute.params, ...{ config } } } })
    },

    setDisplayLayers({ commit }, { layers }) {
      commit('SET_DISPLAY_LAYERS', { layers })
    },
    //sets as timeExtent the timeExtent of the selectedLayer
    setTimeExtent( { commit }, extent) {
      commit('SET_TIME_EXTENT', extent)
    },
    //sets the selectedTimeStamp of the time slider
    setSelectedTimestamp( { commit }, timestamp) {
      const timestampISO = timestamp.toISOString()
      commit('SET_SELECTED_TIMESTAMP', timestampISO)
    }, 
    resetTimeExtent({ commit }) {
      commit('RESET_TIME_EXTENT')
    },
    setCQLFilter({ commit }, filter) {
      commit('SET_CQL_FILTER', filter)
    }, 
    setOpenedFolders({ commit }, folders) {
      commit('SET_OPENED_FOLDERS', folders)
    },
  },
}

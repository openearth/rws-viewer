import slugify from '@sindresorhus/slugify'
import { uniqBy, uniq, difference } from 'ramda'
import router from '../../../router'
import configRepo from '~/repo/configRepo'
import { flattenLayers, getLayersTags, getLayersById, omitLayers } from '~/lib/layer-helpers.js'

export default {
  namespaced: true,

  state: () => ({
    displayLayers: [],
    flattenedLayers: [],
    layerTags: [],
  }),

  getters: {
    rawDisplayLayers: state => state.displayLayers,
    displayLayers: (state, getters) => getters.rawDisplayLayers.length === 1 ? getters.rawDisplayLayers[0].children : getters.rawDisplayLayers,
    flattenedLayers: state => state.flattenedLayers,
    layerTags: state => state.layerTags,
    availableDisplayLayers: (state, getters, rootState, rootGetters) => omitLayers(getters.displayLayers, rootGetters['map/rasterLayerIds']),
    availableFlattenedLayers: (state, getters, rootState, rootGetters) => getters.flattenedLayers.filter(layer => !rootGetters['map/rasterLayerIds'].includes(layer.id)),
    loadedViewerConfigs: state => state.displayLayers.map(({ name }) => slugify(name)),
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
  },

  actions: {
    async getAppData({ dispatch }, route) {
      const viewer = route?.params?.config
      const { layers, name } = await dispatch('addViewerData', viewer)

      dispatch('app/setViewerName', { name }, { root: true })

      const searchParams = new URLSearchParams(window.location.search)
      const initialLayerIds = (searchParams.get('layers') || '').split(',')
      const layersById = getLayersById(layers, initialLayerIds)

      if (layersById.length) {
        dispatch('map/setRasterLayers', { layers: layersById }, { root: true })
      }
    },

    async addViewerData({ commit, state }, viewer) {
      const { layers: viewerLayers, name } = await configRepo.getConfig(viewer)

      const stateLayers = state.displayLayers
      commit('SET_DISPLAY_LAYERS', { layers: [ ...stateLayers, ...viewerLayers ] })

      const stateFlattenedLayers = state.flattenedLayers
      const flattenedViewerLayers = flattenLayers(viewerLayers)
      const flattenedLayers = uniqBy(layer => layer.id, [ ...stateFlattenedLayers, ...flattenedViewerLayers ])
      commit('SET_FLATTENED_LAYERS', { layers: flattenedLayers })

      const stateTags = state.layerTags
      const viewerTags = getLayersTags(flattenedViewerLayers)
      const tags = uniq([ ...stateTags, ...viewerTags ])
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
      const flattenedViewerLayersToRemain = state.flattenedLayers.filter(layer => flattenedViewerLayerIds.includes(layer.id) === false)
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
  },
}

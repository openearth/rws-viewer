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
    displayLayers: (state, getters) => getters.rawDisplayLayers.length === 1
      ? getters.rawDisplayLayers[0].children
      : getters.rawDisplayLayers,
    flattenedLayers: state => state.flattenedLayers,
    layerTags: state => state.layerTags,
    availableDisplayLayers: (state, getters, rootState, rootGetters) =>
      omitLayers(getters.displayLayers, rootGetters['map/rasterLayerIds']),
    availableFlattenedLayers: (state, getters, rootState, rootGetters) =>
      getters.flattenedLayers.filter(layer => !rootGetters['map/rasterLayerIds'].includes(layer.id)),
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
    async getAppData({ commit, dispatch }, route) {
      const viewerConfigNames = route?.params?.configNames
      const { layers, name } = await dispatch('addViewerData', viewerConfigNames)

      // Commit the names on first load
      commit('app/SET_VIEWER_CONFIG_NAMES', viewerConfigNames, { root: true })
      dispatch('app/setViewerName', { name }, { root: true })

      const searchParams = new URLSearchParams(window.location.search)
      const initialLayerIds = (searchParams.get('layers') || '').split(',')
      const layersById = getLayersById(layers, initialLayerIds)

      if (layersById.length) {
        dispatch('map/setRasterLayers', { layers: layersById }, { root: true })
      }
    },

    async addViewerData({ commit, state }, viewerConfigNames) {
      const { layers: viewerLayers, name } = await configRepo.getConfig(viewerConfigNames)

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
      const viewersInRoute = currentRoute.params.configNames.split(',')
      const newViewerParts = viewerConfigNames.split(',')
      const viewerPartsToAdd = difference(newViewerParts, viewersInRoute)
      console.log('viewersInRoute', viewersInRoute)
      console.log('newViewerParts', newViewerParts)
      console.log('viewerPartsToAdd', viewerPartsToAdd)

      if (viewerPartsToAdd.length) {
        const configNames = [ currentRoute.params.configNames, viewerPartsToAdd.join(',') ].join(',')
        const params = { ...currentRoute.params, configNames }
        commit('app/SET_VIEWER_CONFIG_NAMES', params.configNames, { root: true })
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
      const newConfigNames = currentRoute.params.configNames
        .split(',')
        .filter(name => name !== viewer)
        .join(',')
      commit('app/SET_VIEWER_CONFIG_NAMES', newConfigNames, { root: true })

      router.replace({ ...currentRoute, ...{ params: { ...currentRoute.params, ...{ configNames: newConfigNames } } } })
    },

    setDisplayLayers({ commit }, { layers }) {
      commit('SET_DISPLAY_LAYERS', { layers })
    },
  },
}

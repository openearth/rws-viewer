import { uniqBy, uniq, difference } from 'ramda'
import configRepo from '~/repo/configRepo'
import { flattenLayers, getLayersTags, getLayersById, omitLayers } from '~/lib/layer-helpers'
import router from '../../../router'

export default {
  namespaced: true,

  state: () => ({
    displayLayers: [],
    flattenedLayers: [],
    layerTags: [],
    layerDialogOpen: false,
  }),

  getters: {
    rawDisplayLayers: state => state.displayLayers,
    displayLayers: (state, getters) => getters.rawDisplayLayers.length === 1 ? getters.rawDisplayLayers[0].children : getters.rawDisplayLayers,
    flattenedLayers: state => state.flattenedLayers,
    layerTags: state => state.layerTags,
    layerDialogOpen: state => state.layerDialogOpen,
    availableDisplayLayers: (state, getters, rootState, rootGetters) => omitLayers(getters.displayLayers, rootGetters['map/rasterLayerIds']),
    availableFlattenedLayers: (state, getters, rootState, rootGetters) => getters.flattenedLayers.filter(layer => !rootGetters['map/rasterLayerIds'].includes(layer.id)),
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
    SET_LAYER_DIALOG_OPEN(state, { open }) {
      state.layerDialogOpen = open
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

    setDisplayLayers({ commit }, { layers }) {
      commit('SET_DISPLAY_LAYERS', { layers })
    },

    setLayerDialogOpen({ commit }, { open }) {
      commit('SET_LAYER_DIALOG_OPEN', { open })
    },
  },
}

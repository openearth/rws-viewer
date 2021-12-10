import configRepo from '~/repo/configRepo'
import { flattenLayers, getLayersTags, getLayersById, omitLayers } from '~/lib/layer-helpers'

export default {
  namespaced: true,

  state: () => ({
    displayLayers: [],
    flattenedLayers: [],
    layerTags: [],
    layerDialogOpen: false,
  }),

  getters: {
    displayLayers: state => state.displayLayers,
    flattenedLayers: state => state.flattenedLayers,
    layerTags: state => state.layerTags,
    layerDialogOpen: state => state.layerDialogOpen,
    availableDisplayLayers: (state, getters, rootState, rootGetters) => omitLayers(state.displayLayers, rootGetters['map/rasterLayerIds']),
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
    async getAppData({ commit, dispatch }, route) {
      const platform = route?.params?.config
      const { layers, name } = await configRepo.getConfig(platform)

      dispatch('app/setAppName', { name }, { root: true })
      commit('SET_DISPLAY_LAYERS', { layers })

      const flattenedLayers = flattenLayers(layers)
      commit('SET_FLATTENED_LAYERS', { layers: flattenedLayers })

      const searchParams = new URLSearchParams(window.location.search)
      const initialLayerIds = (searchParams.get('layers') || '').split(',')
      const layersById = getLayersById(layers, initialLayerIds)
      if (layersById.length) {
        dispatch('map/setRasterLayers', { layers: layersById }, { root: true })
      }

      const tags = getLayersTags(flattenedLayers)
      commit('SET_LAYER_TAGS', { tags })
    },

    setDisplayLayers({ commit }, { layers }) {
      commit('SET_DISPLAY_LAYERS', { layers })
    },

    setLayerDialogOpen({ commit }, { open }) {
      commit('SET_LAYER_DIALOG_OPEN', { open })
    },
  },
}

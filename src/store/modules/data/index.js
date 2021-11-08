import configRepo from '~/repo/configRepo'
import { flattenLayers, getLayersTags } from '~/lib/layer-helpers'

export default {
  namespaced: true,

  state: () => ({
    // originalLayers: [],
    displayLayers: [],
    flattenedLayers: [],
    layerTags: [],
  }),

  getters: {
    displayLayers: state => state.displayLayers,
    flattenedLayers: state => state.flattenedLayers,
    layerTags: state => state.layerTags,
  },

  mutations: {
    // SET_ORIGINAL_LAYERS(state, { layers }) {
    //   state.originalLayers = Object.freeze(layers)
    // },
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
    getAppData({ commit, dispatch }, route) {
      const platform = route?.query?.platform
      const { layers, name } = configRepo.getConfig(platform)

      dispatch('app/setAppName', { name }, { root: true })
      // commit('SET_ORIGINAL_LAYERS', { layers })
      commit('SET_DISPLAY_LAYERS', { layers })

      const flattenedLayers = flattenLayers(layers)
      commit('SET_FLATTENED_LAYERS', { layers: flattenedLayers })

      const tags = getLayersTags(flattenedLayers)
      commit('SET_LAYER_TAGS', { tags })
    },

    // resetDisplayLayers({ commit, state }) {
    //   commit('SET_DISPLAY_LAYERS', { layers: state.originalLayers })
    // },

    setDisplayLayers({ commit }, { layers }) {
      commit('SET_DISPLAY_LAYERS', { layers })
    },
  },
}

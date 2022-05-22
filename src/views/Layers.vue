<template>
  <v-container class="layers pt-4">
    <layer-chooser
      @select-layers="onSelectLayers"
      @remove-layers="onRemoveLayer"
    />
  </v-container>
</template>

<script>
  import { equals } from 'ramda'
  import { mapActions, mapGetters } from 'vuex'

  const LayerChooser = () => import('~/components/LayerChooser/LayerChooser.vue')

  export default {
    name: 'Layers',

    components: { LayerChooser },

    computed: {
      ...mapGetters('app', [ 'viewerConfig' ]),
      ...mapGetters('data', [ 'flattenedLayers', 'layerTags' ]),
      ...mapGetters('map', [ 'rasterLayerIds', 'rasterLayers' ]),

      activeLayers() {
        return this.rasterLayerIds.map(id => this.flattenedLayers.find(layer => layer.id === id))
      },
    },

    watch: {
      activeLayers(newValue, oldValue) {
        if (equals(newValue, oldValue)) {
          return
        }

        const url = new URL(window.location.href)
        url.searchParams.set('layers', newValue.map(({ id }) => id).join(','))
        this.$router.replace(`/${ this.viewerConfig }/?${ url.searchParams.toString() }`)
      },
    },

    methods: {
      ...mapActions('map', [ 'addRasterLayer', 'removeRasterLayer', 'removeFiltersLayerId' ]),

      onSelectLayers(layerIds) {
        const layers = layerIds
          .map(layerId => this.flattenedLayers.find(({ id }) => id === layerId))

        if (layers.length) {
          this.addRasterLayer({ layers })
        }
      },

      onRemoveLayer(layerIds) {
        const layers = layerIds
          .map(layerId => this.flattenedLayers.find(({ id }) => id === layerId))

        if (layers.length) {
          this.removeRasterLayer({ layers })
          this.removeFiltersLayerId()
        }
      },
    },
  }
</script>

<template>
  <v-card class="layers" flat>
    <v-select
      v-model="selectedTags"
      class="px-4 pt-4 pb-1"
      label="Filter by tag"
      multiple
      dense
      outlined
      hide-details
      :items="layerTags"
    />
    <layer-list-controls
      v-if="layersForTree"
      :layers="layersForTree"
      :selected-layer-ids="rasterLayerIds"
      @active-layers-change="onActiveLayerChange"
      @layer-sorting-change="onLayerSortingChange"
    />
  </v-card>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  const LayerListControls = () => import('~/components/LayerListControls/LayerListControls')

  export default {
    name: 'Layer',

    components: {
      LayerListControls,
    },

    data: () => ({
      selectedTags: [],
    }),

    computed: {
      ...mapGetters('data', [
        'displayLayers',
        'flattenedLayers',
        'layerTags',
      ]),
      ...mapGetters('map', [
        'rasterLayerIds',
        'rasterLayers',
      ]),

      layersForTree() {
        if (!this.selectedTags.length) {
          return this.displayLayers
        }

        return this.flattenedLayers.filter(({ tags }) =>
          this.selectedTags.every(tag => tags.includes(tag)))
      },
    },

    methods: {
      ...mapActions('data', [ 'setDisplayLayers' ]),
      ...mapActions('map', [ 'addRasterLayer', 'removeRasterLayer' ]),

      onActiveLayerChange(layers) {
        this.updateRasterLayers(layers)
        this.setUrlParams(layers)
      },

      onLayerSortingChange(layers) {
        this.setDisplayLayers({ layers })
      },

      setUrlParams(layers) {
        const url = new URL(window.location.href)
        url.searchParams.set('layers', layers.map(({ id }) => id).join(','))
        this.$router.replace(`/?${ url.searchParams.toString() }`)
      },

      updateRasterLayers(layers) {
        this.rasterLayers.length > layers.length
          ? this.removeRasterLayer({ layers })
          : this.addRasterLayer({ layers })
      },
    },
  }
</script>

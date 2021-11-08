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
      @active-layers-change="onActiveLayerChange"
      @layer-sorting-change="onLayerSortingChange"
    />
  </v-card>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { LayerListControls } from '@deltares/vue-components'

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

      layersForTree() {
        if(!this.selectedTags.length) return this.displayLayers
        return this.flattenedLayers.filter(({ tags }) =>
          this.selectedTags.every(tag => tags.includes(tag)))
      },
    },

    methods: {
      ...mapActions('data', [ 'setDisplayLayers' ]),
      ...mapActions('map', [ 'setRasterLayers' ]),

      onActiveLayerChange(layers) {
        this.setRasterLayers({ layers })
      },

      onLayerSortingChange(layers) {
        this.setDisplayLayers({ layers })
      },
    },
  }
</script>

<style lang="scss">
  @import '~/components/AppCore/mixins.scss';

  .layers .sortable-handle {
    @include truncate;

    width: 100%;
  }
</style>

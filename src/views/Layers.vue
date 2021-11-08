<template>
  <v-card class="layers" flat>
    <v-card-text>
      Lorem ipsum dolor sit amet.
    </v-card-text>
    <layer-list-controls
      v-if="layers"
      :layers="layers"
      @active-layers-change="onActiveLayerChange"
      @layer-sorting-change="onLayerSortingChange"
    />
  </v-card>
</template>

<script>
  import { mapActions, mapState } from 'vuex'
  import { LayerListControls } from '@deltares/vue-components'

  export default {
    name: 'Layer',
    components: {
      LayerListControls,
    },
    computed: {
      ...mapState('data', [ 'layers' ]),
    },
    methods: {
      ...mapActions('data', [ 'setDataLayers' ]),
      onActiveLayerChange(layers) {
        console.log('onActiveLayerChange', { layers })
      },
      onLayerSortingChange(layers) {
        this.setDataLayers({ layers })
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

<template>
  <v-card class="layers" flat>
    <v-card-text>
      Lorem ipsum dolor sit amet.
    </v-card-text>
    <layer-list-controls
      v-if="displayLayers"
      :layers="displayLayers"
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

    computed: {
      ...mapGetters('data', [ 'displayLayers' ]),
    },

    methods: {
      ...mapActions('data', [ 'setDisplayLayers' ]),

      onActiveLayerChange(layers) {
        console.log('onActiveLayerChange', { layers })
      },

      onLayerSortingChange(layers) {
        this.setDisplayLayers({ layers })
      },
    },
  }
</script>

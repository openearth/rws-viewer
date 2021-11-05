<template>
  <v-card class="layers" flat>
    <v-card-text>
      Lorem ipsum dolor sit amet.
    </v-card-text>
    <layer-list-controls
      :layers="layers"
      @active-layers-change="onActiveLayerChange"
      @layer-sorting-change="onLayerSortingChange"
    />
  </v-card>
</template>

<script>
  import { LayerListControls } from '@deltares/vue-components'

  export default {
    name: 'Layer',
    components: {
      LayerListControls,
    },
    data: () => ({
      layers: [
        {
          'id': 'geological-layout1',
          'name': 'Geological Layout',
          'children': [
            {
              'id': 'plasvorming_herstelkosten',
              'name': 'Plasvorming Herstelkosten',
              'layer': 'ra2ce:plasvorming_herstelkosten',
              'url': 'https://ra2ce.openearth.eu/geoserver/ows',
            },
            {
              'id': 'plasvorming_stremmingskosten',
              'name': 'Plasvorming Stremmingskosten',
              'layer': 'ra2ce:plasvorming_stremmingskosten',
              'url': 'https://ra2ce.openearth.eu/geoserver/ows',
            },
          ],
        },
      ],
    }),
    methods: {
      onActiveLayerChange(event) {
        console.log(event)
      },
      onLayerSortingChange(sortedLayers) {
        this.layers = sortedLayers
      },
    },
  }
</script>

<template>
  <v-card
    class="map-legend overflow-y-auto"
    flat
    min-width="300"
    max-width="350"
    :max-height="maxLegendHeight"
  >
    <v-expansion-panels>
      <v-expansion-panel
        v-for="(layer, index) in activeLayers"
        :key="index"
      >
        <v-expansion-panel-header>
          {{ layer.name }}
        </v-expansion-panel-header>
        <v-expansion-panel-content eager>
          <img
            alt=""
            :src="legendUrl(layer)"
            style="width: auto;max-width: 100%;height: auto;"
          >
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex'
  import buildLegendUrl from '~/lib/build-legend-url'

  export default {
    data: () => ({
      maxLegendHeight: 'calc(100vh - 115px)', // subtracts toolbar, margins and paddings.
      selectedLegend: null,
    }),

    computed: {
      ...mapGetters('data', [ 'flattenedLayers' ]),
      ...mapGetters('map', [ 'rasterLayerIds' ]),

      activeLayers() {
        return this.flattenedLayers.filter(layer => this.rasterLayerIds.includes(layer.id))
      },
    },

    methods: {
      legendUrl(layer) {
        return buildLegendUrl(layer)
      },
    },
  }
</script>

<style scoped lang="scss">
  .map-legend {
    position: absolute;
    right: $spacing-default;
    bottom: $spacing-large;
    background-color: transparent;
  }
</style>

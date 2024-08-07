<template>
  <v-card
    data-v-step="4"
    class="map-legend"
    :class="{ 'map-legend--open': showLegend }"
    elevation="4"
    :max-height="maxLegendHeight"
    width="360"
    :max-width="maxLegendWidth"
  >
    <v-card-title
      class="map-legend__title subtitle-2"
      @click="toggleLegend"
    >
      {{ $tc('legends', activeLayers.length) }}

      <v-icon
        class="map-legend__button"
        :class="{ 'map-legend__button--active': showLegend }"
      >
        mdi-chevron-down
      </v-icon>
    </v-card-title>

    <v-card-text v-if="activeLayers.length >= 2" class="map-legend__content">
      <v-expansion-panels multiple>
        <v-expansion-panel
          v-for="(layer, index) in activeLayers"
          :key="index"
        >
          <v-expansion-panel-header>
            {{ layer.name }}
          </v-expansion-panel-header>
          <v-expansion-panel-content eager>
            <img
              class="map-legend__image"
              alt=""
              :src="legendUrl(layer)"
            >
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-card-text>

    <v-card-text v-else class="map-legend__content">
      <p class="body-1 mb-2">
        {{ activeLayers[0].name }}
      </p>
      <img
        class="map-legend__image"
        alt=""
        :src="legendUrl(activeLayers[0])"
      >
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex'
  import buildLegendUrl from '~/lib/build-legend-url'

  export default {
    data: () => ({
      maxLegendHeight: 'calc(100vh - 106px)', // subtracts toolbar, margin and padding.
      maxLegendWidth: 'calc(100vw - 32px)', // subtracts padding.
      selectedLegend: null,
      showLegend: false,
    }),

    computed: {
      ...mapGetters('data', [ 'flattenedLayers' ]),
      ...mapGetters('map', [ 'activeFlattenedLayerIds' ]),

      activeLayers() {
        return this.activeFlattenedLayerIds.map(id => this.flattenedLayers.find(layer => layer?.id === id))
      },
    },

    methods: {
      legendUrl(layer) {
        return buildLegendUrl(layer)
      },

      toggleLegend() {
        this.showLegend = !this.showLegend
      },
    },
  }
</script>

<style lang="scss">
  .map-legend {
    display: flex;
    position: absolute;
    z-index: 2;
    right: calc(#{$spacing-default} * 7);
    bottom: 0;
    bottom: $spacing-medium;
    flex-direction: column;
    overflow: hidden;
    transform: translateY(calc(100% - 48px + #{$spacing-medium}));
    transition: transform .3s cubic-bezier(.25, .8, .25, 1);
  }

  .map-legend--open {
    transform: translateY(0%);
  }

  .map-legend__button {
    transform: rotate(-180deg);
    transition: transform .4s cubic-bezier(.25, .8, .5, 1);
  }

  .map-legend__button--active {
    transform: rotate(0deg);
  }

  .map-legend__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: $spacing-small;
    padding-bottom: $spacing-small;
  }

  .map-legend__content.v-card__text {
    padding-top: $spacing-tiny;
    overflow-y: auto;
  }

  .map-legend__image {
    width: auto;
    max-width: 100%;
    height: auto;
  }
</style>

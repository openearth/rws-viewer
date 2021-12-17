<template>
  <app-shell :header-title="viewerName">
    <locale-switcher slot="header-right" />

    <v-fade-transition mode="out-in">
      <mapbox-legend v-if="rasterLayerIds.length" />
    </v-fade-transition>

    <mapbox-map
      slot="map"
      :access-token="accessToken"
      :padding="{ left: mapLeftPadding }"
      mapbox-style="mapbox://styles/siggyf/ckww2c33f0xlf15nujlx41fe2"
      @styledata="setMapLoaded"
    >
      <v-mapbox-layer
        v-for="layer in rasterLayers"
        :key="layer.id"
        :options="layer"
        :opacity="layer.opacity"
      />
      <mapbox-draw-control
        :draw-mode="drawMode"
        :drawn-feature="drawnFeature"
        @change="setDrawnFeature"
      />
    </mapbox-map>
  </app-shell>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { MapboxMap } from '@deltares/vue-components'
  import MapboxDrawControl from '~/components/MapboxDrawControl/MapboxDrawControl'
  import LocaleSwitcher from '~/components/LocaleSwitcher/LocaleSwitcher'
  import MapboxLegend from '~/components/MapboxLegend/MapboxLegend'

  const AppShell = () => import('~/components/AppShell/AppShell')

  export default {
    components: {
      AppShell,
      MapboxMap,
      MapboxDrawControl,
      LocaleSwitcher,
      MapboxDrawControl,
      MapboxLegend,
      MapboxMap,
    },

    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
    }),

    computed: {
      ...mapGetters('app', [ 'viewerName', 'appNavigationOpen', 'appNavigationWidth' ]),
      ...mapGetters('map', [ 'drawnFeature', 'drawMode', 'rasterLayerIds', 'rasterLayers' ]),
      mapLeftPadding() {
        return this.appNavigationOpen ? this.appNavigationWidth : 0
      },
    },

    mounted() {
      this.$router.onReady(this.getAppData)
    },

    methods: {
      ...mapActions('data', [ 'getAppData' ]),
      ...mapActions('map', [ 'setDrawnFeature', 'setMapLoaded' ]),
    },
  }
</script>

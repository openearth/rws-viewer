<template>
  <app-shell :header-title="appName">
    <mapbox-map
      slot="map"
      :access-token="accessToken"
    >
      <v-mapbox-layer
        v-for="layer in rasterLayers"
        :key="layer.id"
        :options="layer"
        :opacity="layer.opacity"
      />
      <mapbox-draw-control
        :draw-mode="drawMode"
        @change="setDrawnFeatures"
      />
    </mapbox-map>
    <layer-info-dialog
      @close-dialog="onCloseDialog"
    />
  </app-shell>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { MapboxMap } from '@deltares/vue-components'

  const LayerInfoDialog = () => import('~/components/LayerInfoDialog/LayerInfoDialog')
  import MapboxDrawControl from '~/components/MapboxDrawControl/MapboxDrawControl'

  const AppShell = () => import('~/components/AppShell/AppShell')

  export default {
    components: {
      AppShell,
      LayerInfoDialog,
      MapboxMap,
      MapboxDrawControl,
    },

    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
    }),

    computed: {
      ...mapGetters('app', [ 'appName' ]),
      ...mapGetters('map', [ 'rasterLayers', 'drawMode' ]),
    },

    mounted() {
      this.$router.onReady(this.getAppData)
    },

    methods: {
      ...mapActions('data', [ 'getAppData', 'setLayerDialogOpen' ]),
      ...mapActions('map', [ 'setDrawnFeatures' ]),

      onCloseDialog() {
        this.setLayerDialogOpen({ open: false })
      },
    },
  }
</script>

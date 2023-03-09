<template>
  <app-shell :header-title="viewerName" :print-mode="printMode">
    <template slot="header-right">
      <search-bar :loading="loading" @onSearch="handleSearch" />
      <locale-switcher />
    </template>
    <div v-if="!showApiLayer">
      <v-fade-transition mode="out-in">
        <layer-order v-if="wmsLayerIds.length && showUI" />
      </v-fade-transition>
      <mapbox-coordinates v-if="showUI" :lng-lat="lngLat" />
      <v-fade-transition mode="out-in">
        <mapbox-legend v-if="wmsLayerIds.length" :expanded="!showUI" />
      </v-fade-transition>
    </div>

    <LayersDialog
      :open="layersDialogOpen"
      :layers="layers"
      @close="closeLayersDialog"
    />

    <mapbox-map
      slot="map"
      :access-token="accessToken"
      mapbox-style="mapbox://styles/siggyf/ckww2c33f0xlf15nujlx41fe2"
      :center="mapCenter"
      :zoom="mapZoom"
      @load="handleMapLoad"
    >
      <time-slider
        v-if="showTimeslider"
        :timings="formattedTimeExtent"
        :value="formattedTimeExtent[formattedTimeExtent.length - 1]"
        mode="simple-slider"
        @input="onTimingSelection"
      />
      <div v-if="showApiLayer">
        <map-layer
          v-if="wmsApiLayer"
          :key="wmsApiLayer.id"
          :options="wmsApiLayer"
          :opacity="wmsApiLayer.opacity"
          :before="wmsLayerIds[0]"
        />
      </div>

      <map-layer
        v-for="(layer, index) in wmsLayers"
        :key="layer.id"
        :before="wmsLayerIds[index - 1]"
        :options="layer"
        :opacity="layer.opacity"
      />

      <map-zoom :extent="zoomExtent" />
      <MapMouseMove @mousemove="onMouseMove" />
      <v-mapbox-navigation-control v-if="showUI" />
      <mapbox-draw-control
        :draw-mode="drawMode"
        :drawn-features="drawnFeatures"
        @change="addDrawnFeature"
      />
      <mapbox-select-point-control
        :draw-mode="drawMode"
        @click="handleFeatureClick"
      />
      <map-export-control
        v-if="showUI"
        :layers="wmsLayerIds"
        :viewer="viewerConfig"
      />
      <map-layer-info
        v-if="activeFlattenedLayers.length && !drawMode"
        :layer="activeFlattenedLayers[0]"
      />
    </mapbox-map>
  </app-shell>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { MapboxMap } from '@deltares/vue-components'
  import AppShell from './components/AppShell/AppShell'
  import MapLayer from './components/MapComponents/MapLayer.js'
  import MapZoom from './components/MapComponents/MapZoom.js'
  import MapLayerInfo from './components/MapComponents/MapLayerInfo'
  import MapboxDrawControl from '~/components/MapboxDrawControl/MapboxDrawControl'
  import LocaleSwitcher from '~/components/LocaleSwitcher/LocaleSwitcher'
  import MapboxLegend from '~/components/MapboxLegend/MapboxLegend'
  import LayerOrder from '~/components/LayerOrder/LayerOrder'
  import TimeSlider from '~/components/TimeSlider'
  import MapboxSelectPointControl from '~/components/MapboxSelectPointControl/MapboxSelectPointControl'
  import getFeatureInfo from '~/lib/get-feature-info'
  import MapMouseMove from './components/MapComponents/MapMouseMove.js'
  import MapboxCoordinates from './components/MapboxCoordinates/MapboxCoordinates.vue'
  import debounce from '~/lib/debounce'
  import axios from 'axios'
  import LayersDialog from '~/components/LayersDialog/LayersDialog'
  import SearchBar from '~/components/SearchBar/SearchBar'
  import MapExportControl from './components/MapExportControl/MapExportControl.vue'

  export default {
    components: {
      AppShell,
      MapboxMap,
      MapLayer,
      MapZoom,
      MapLayerInfo,
      MapboxDrawControl,
      LayerOrder,
      LocaleSwitcher,
      MapboxDrawControl,
      MapboxSelectPointControl,
      MapboxLegend,
      MapboxMap,
      TimeSlider,
      MapMouseMove,
      MapboxCoordinates,
      LayersDialog,
      SearchBar,
      MapExportControl,
    },

    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      sampleDataTime: [],
      showslider: false,
      lngLat: null,
      layers: [],
      layersDialogOpen: false,
      loading: false,
    }),

    computed: {
      ...mapGetters('app', [
        'viewerName',
        'viewerConfig',
        'appNavigationOpen',
        'appNavigationWidth',
        'printMode',
      ]),
      ...mapGetters('map', [
        'drawnFeatures',
        'drawMode',
        'wmsLayerIds',
        'wmsLayers',
        'filteredLayerId',
        'mapCenter',
        'mapZoom',
        'mapLoaded',
        'zoomExtent',
        'selectedLayerForSelection',
        'activeFlattenedLayers',
        'wmsApiLayer',
        'multipleSelection',
      ]),
      ...mapGetters('data', [ 'timeExtent' ]),
      formattedTimeExtent() {
        return this.formatTimeExtent(this.timeExtent)
      },
      showTimeslider() {
        const { name } = this.$route
        return this.filteredLayerId && name === 'filters' ? true : false
      },
      showApiLayer() {
        const { name } = this.$route
        return name === 'download.api' ? true : false
      },
      showUI() {
        return this.printMode !== 'noui'
      },
    },

    watch: {
      //Set as default timestamp the last value of the timeExtent array
      formattedTimeExtent() {
        if (this.formattedTimeExtent.length) {
          this.setSelectedTimestamp(
            this.formattedTimeExtent[this.formattedTimeExtent.length - 1].t1,
          )
        }
      },
      printMode() {
        this.setAppNavigationWidth({ width: this.printMode === 'noui' ? 0 : 500 })
      },
    },

    mounted() {
      this.$router.onReady(this.getAppData)
    },

    methods: {
      ...mapActions('app', [ 'setAppNavigationWidth' ]),
      ...mapActions('data', [ 'getAppData', 'setSelectedTimestamp' ]),
      ...mapActions('map', [
        'adds',
        'removeDrawnFeature',
        'addDrawnFeature',
        'setMapLoaded',
      ]),
      formatTimeExtent(extent) {
        if (extent.length) {
          const formattedTimeExtent = extent.map((s) => ({
            label: s.split('-')[0],
            t1: new Date(s),
            t2: undefined,
          }))
          return formattedTimeExtent
        } else {
          return []
        }
      },
      onTimingSelection(event) {
        const timestamp = event
        this.setSelectedTimestamp(timestamp.t1)
      },

      async handleFeatureClick(clickData) {
        const feature = await getFeatureInfo({
          url: this.selectedLayerForSelection.url,
          layer: this.selectedLayerForSelection.layer,
          ...clickData,
        })

        if (feature) {
          if (this.drawnFeatures.find((f) => f.id === feature.id)) {
            this.removeDrawnFeature(feature)
          } else {
            this.addDrawnFeature(feature)
          }
        }
      },
      onMouseMove(e) {
        this.lngLat = e.lngLat
      },
      handleSearch: debounce(async function (val) {
        try {
          this.loading = true

          if (val.trim()) {
            const { data } = await axios(
              `/api/search?viewer=${ this.viewerName }&query=${ val }`,
            )
            this.layers = data
            this.layersDialogOpen = true
          }
        } catch (e) {
          console.log(e)
        } finally {
          this.loading = false
        }
      }, 1000),
      closeLayersDialog() {
        this.layersDialogOpen = false
      },
      handleMapLoad(event) {
        const map = event.target
        this.setMapLoaded(true)
        
        const { zoom, lat, lng }= this.$route.query

        if (zoom) {
          map.setZoom(zoom)
        }

        if (lat && lng) {
          map.setCenter([ lng, lat ])
        }
      },
    },
  }
</script>
<style>
.mapboxgl-ctrl-top-right {
  top: 0;
  right: 0;
}

@media only screen and (max-width: 1199px) {
  .mapboxgl-ctrl-top-right {
    top: 0;
    right: calc(100vw - 560px);
  }
}
</style>

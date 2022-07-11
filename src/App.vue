<template>
  <app-shell :header-title="viewerName">
    <locale-switcher slot="header-right" />
    
    <v-fade-transition mode="out-in">
      <layer-order v-if="wmsLayerIds.length" />
    </v-fade-transition>
    <v-fade-transition mode="out-in">
      <mapbox-legend v-if="wmsLayerIds.length" />
    </v-fade-transition>


    <mapbox-map
      slot="map"
      :access-token="accessToken"
      :padding="{ left: mapLeftPadding }"
      mapbox-style="mapbox://styles/siggyf/ckww2c33f0xlf15nujlx41fe2"
      :center="mapCenter"
      :zoom="mapZoom"
      @styledata="setMapLoaded"
    >
      <time-slider
        v-if="showTimeslider"
        :timings="formattedTimeExtent"
        :value="formattedTimeExtent[formattedTimeExtent.length -1]"
        mode="simple-slider"
        @input="onTimingSelection"
      />
      <map-layer
        v-for="(layer, index) in wmsLayers"
        :key="layer.id"
        :before="wmsLayerIds[index - 1]"
        :options="layer"
        :opacity="layer.opacity"
      />
      <map-zoom :extent="zoomExtent" />
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
  import AppShell from './components/AppShell/AppShell'
  import MapLayer from './components/MapComponents/MapLayer.js'
  import MapZoom from './components/MapComponents/MapZoom.js'
  import MapboxDrawControl from '~/components/MapboxDrawControl/MapboxDrawControl'
  import LocaleSwitcher from '~/components/LocaleSwitcher/LocaleSwitcher'
  import MapboxLegend from '~/components/MapboxLegend/MapboxLegend'
  import LayerOrder from '~/components/LayerOrder/LayerOrder.vue'
  import TimeSlider from '~/components/TimeSlider'
  
  export default {
    components: {
      AppShell,
      MapboxMap,
      MapLayer,
      MapZoom,
      MapboxDrawControl,
      LayerOrder,
      LocaleSwitcher,
      MapboxDrawControl,
      MapboxLegend,
      MapboxMap,
      TimeSlider,
    },

    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      sampleDataTime: [],
      showslider: false,
    }),

    computed: {
      ...mapGetters('app', [ 'viewerName', 'appNavigationOpen', 'appNavigationWidth' ]),
      ...mapGetters('map', [ 'drawnFeature', 'drawMode', 'wmsLayerIds', 'wmsLayers', 'filteredLayerId', 'mapCenter', 'mapZoom', 'zoomExtent' ]),
      ...mapGetters('data', [ 'timeExtent' ]),
      mapLeftPadding() {
        return this.appNavigationOpen ? this.appNavigationWidth : 0
      },
      formattedTimeExtent() {
        return this.formatTimeExtent(this.timeExtent)
      },
      showTimeslider() {
        const { name } = this.$route
        return this.filteredLayerId && name === 'filters' ? true : false
      },
    },
    watch: {
      //Set as default timestamp the last value of the timeExtent array
      formattedTimeExtent() { 
        if (this.formattedTimeExtent.length) {
          this.setSelectedTimestamp(this.formattedTimeExtent[this.formattedTimeExtent.length -1].t1)
        }
      },
    },
    mounted() {
      this.$router.onReady(this.getAppData)    
    },

    methods: {
      ...mapActions('data', [ 'getAppData', 'setSelectedTimestamp' ]),
      ...mapActions('map', [ 'setDrawnFeature', 'setMapLoaded' ]),
      formatTimeExtent(extent) {
        if (extent.length) {
          const formattedTimeExtent = extent.map(s => ({
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
    },
  }
</script>

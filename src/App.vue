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
      @styledata="setMapLoaded"
    >
      <time-slider
        v-if="showTimeslider"
        :timings="formattedTimeExtent"
        :value="formattedTimeExtent[formattedTimeExtent.length -1]"
        mode="simple-slider"
        @input="onTimingSelection"
      />
      <v-mapbox-layer
        v-for="(layer, index) in wmsLayers"
        :key="layer.id"
        :before="wmsLayerIds[index - 1] || 'gl-draw-polygon-fill-inactive.cold'"
        :options="layer"
        :opacity="layer.opacity"
      />
      <mapbox-draw-control
        :draw-mode="drawMode"
        :drawn-feature="drawnFeature"
        @change="setDrawnFeature"
      />
      <mapbox-select-feature-control
        :select-mode="selectMode" 
        @click="handleFeatureClick"
      />
    </mapbox-map>
  </app-shell>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { MapboxMap } from '@deltares/vue-components'
  import AppShell from './components/AppShell/AppShell'
  import MapboxDrawControl from '~/components/MapboxDrawControl/MapboxDrawControl'
  import LocaleSwitcher from '~/components/LocaleSwitcher/LocaleSwitcher'
  import MapboxLegend from '~/components/MapboxLegend/MapboxLegend'
  import LayerOrder from '~/components/LayerOrder/LayerOrder'
  import TimeSlider from '~/components/TimeSlider'
  import MapboxSelectFeatureControl from '~/components/MapboxSelectFeatureControl/MapboxSelectFeatureControl'
  import getFeatureInfo from '~/lib/get-feature-info'

  export default {
    components: {
      AppShell,
      MapboxMap,
      MapboxDrawControl,
      LayerOrder,
      LocaleSwitcher,
      MapboxDrawControl,
      MapboxSelectFeatureControl,
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
      ...mapGetters('map', [ 'drawnFeature', 'drawMode', 'selectMode', 'wmsLayerIds', 'wmsLayers', 'filtersLayerId' ]),
      ...mapGetters('data', [ 'timeExtent' ]),
      mapLeftPadding() {
        return this.appNavigationOpen ? this.appNavigationWidth : 0
      },
      formattedTimeExtent() {
        return this.formatTimeExtent(this.timeExtent)
      },
      showTimeslider() {
        const { name } = this.$route
        return this.filtersLayerId && name === 'filters' ? true : false
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
      async handleFeatureClick(clickData) {
        const feature = await getFeatureInfo({
          // TODO: get layer based on selected layer
          layer: 'sovongebieden',
          ...clickData,
        })

        if (feature) {
          this.setDrawnFeature(feature)
        }
      },
    },
  }
</script>

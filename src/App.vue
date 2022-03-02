<template>
  <app-shell :header-title="viewerName">
    <locale-switcher slot="header-right" />
    
    <v-fade-transition mode="out-in">
      <layer-order v-if="rasterLayerIds.length" />
    </v-fade-transition>
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
        v-for="(layer, index) in rasterLayers"
        :key="layer.id"
        :before="rasterLayerIds[index - 1]"
        :options="layer"
        :opacity="layer.opacity"
      />
      <mapbox-draw-control
        :draw-mode="drawMode"
        :drawn-feature="drawnFeature"
        @change="setDrawnFeature"
      />
    </mapbox-map>
    <time-slider
      v-if="showslider"
      :timings="sampleDataTime"
      mode="simple-slider"
    />
  </app-shell>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { MapboxMap } from '@deltares/vue-components'
  import AppShell from './components/AppShell/AppShell'
  import MapboxDrawControl from '~/components/MapboxDrawControl/MapboxDrawControl'
  import LocaleSwitcher from '~/components/LocaleSwitcher/LocaleSwitcher'
  import MapboxLegend from '~/components/MapboxLegend/MapboxLegend'
  import LayerOrder from '~/components/LayerOrder/LayerOrder.vue'
  import TimeSlider from '~/components/TimeSlider'


  export default {
    components: {
      AppShell,
      MapboxMap,
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
      ...mapGetters('map', [ 'drawnFeature', 'drawMode', 'rasterLayerIds', 'rasterLayers' ]),
      mapLeftPadding() {
        return this.appNavigationOpen ? this.appNavigationWidth : 0
      },
    },

    mounted() {
      this.$router.onReady(this.getAppData)

      //TODO: timeslider functionality

      //1. Sample data as they return from capablities
      const sample = [ '1970-12-30T23:00:00.000Z','1971-12-30T23:00:00.000Z','1972-12-30T23:00:00.000Z','1973-12-30T23:00:00.000Z','1974-12-30T23:00:00.000Z','1975-12-30T23:00:00.000Z','1976-12-30T23:00:00.000Z','1977-12-30T23:00:00.000Z','1978-12-30T23:00:00.000Z','1979-12-30T23:00:00.000Z','1980-12-30T23:00:00.000Z','1981-12-30T23:00:00.000Z','1982-12-30T23:00:00.000Z','1983-12-30T23:00:00.000Z','1984-12-30T23:00:00.000Z','1985-12-30T23:00:00.000Z','1986-12-30T23:00:00.000Z','1987-12-30T23:00:00.000Z','1988-12-30T23:00:00.000Z','1989-12-30T23:00:00.000Z','1990-12-30T23:00:00.000Z','1991-12-30T23:00:00.000Z','1992-12-30T23:00:00.000Z','1993-12-30T23:00:00.000Z','1994-12-30T23:00:00.000Z','1995-12-30T23:00:00.000Z','1996-12-30T23:00:00.000Z','1997-12-30T23:00:00.000Z','1998-12-30T23:00:00.000Z','1999-12-30T23:00:00.000Z','2000-12-30T23:00:00.000Z','2001-12-30T23:00:00.000Z','2002-12-30T23:00:00.000Z','2003-12-30T23:00:00.000Z','2004-12-30T23:00:00.000Z','2005-12-30T23:00:00.000Z','2006-12-30T23:00:00.000Z','2007-12-30T23:00:00.000Z','2008-12-30T23:00:00.000Z','2009-12-30T23:00:00.000Z','2010-12-30T23:00:00.000Z','2011-12-30T23:00:00.000Z','2012-12-30T23:00:00.000Z','2013-12-30T23:00:00.000Z','2014-12-30T23:00:00.000Z','2015-12-30T23:00:00.000Z','2016-12-30T23:00:00.000Z','2017-12-30T23:00:00.000Z','2018-12-30T23:00:00.000Z','2019-12-30T23:00:00.000Z','2020-12-30T23:00:00.000Z','2021-12-30T23:00:00.000Z' ]
    
      //2. Format them for timelider component input
      this.sampleDataTime = sample.map(s => ({
        label: s.split('-')[0],
        t1: new Date(s),
        t2: undefined,
      }))

      setTimeout(this.showTimeSlider(), 5000)
    },

    methods: {
      ...mapActions('data', [ 'getAppData' ]),
      ...mapActions('map', [ 'setDrawnFeature', 'setMapLoaded' ]),
      showTimeSlider() {
        this.showslider = true
      },
    },
  }
</script>

<template>
  <app-shell :header-title="viewerName">
    <template slot="header-right">
      <search-bar :loading="searchIsLoading" @onSearch="handleSearch" />
      <locale-switcher
        :loading="localeIsLoading"
        :current-locale="currentLocale"
        :items="localeItems"
        @input="switchLocaleAndAddViewerData($event.title)"
      />
    </template>
    <div v-if="!showApiLayer">
      <v-fade-transition mode="out-in">
        <layer-order v-if="wmsLayerIds.length" />
      </v-fade-transition>
      <mapbox-coordinates :lng-lat="lngLat" />
      <v-fade-transition mode="out-in">
        <mapbox-legend v-if="wmsLayerIds.length" />
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
      @load="setMapLoaded"
    >
      <time-slider
        v-if="showTimeslider"
        :timings="formattedTimeExtent"
        :value="formattedTimeExtent[formattedTimeExtent.length -1]"
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
      <v-mapbox-navigation-control />
      <mapbox-draw-control
        :draw-mode="drawMode"
        :drawn-features="drawnFeatures"
        @change="addDrawnFeature"
      />
      <mapbox-select-point-control
        :draw-mode="drawMode"
        @click="handleFeatureClick"
      />
      <mapbox-export-control />
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
  import MapboxExportControl from '~/components/MapboxExportControl/MapboxExportControl'
  import getFeatureInfo from '~/lib/get-feature-info'
  import MapMouseMove from './components/MapComponents/MapMouseMove.js'
  import MapboxCoordinates from './components/MapboxCoordinates/MapboxCoordinates.vue'
  import debounce from '~/lib/debounce'
  import axios from 'axios'
  import LayersDialog from '~/components/LayersDialog/LayersDialog'
  import SearchBar from '~/components/SearchBar/SearchBar'
  import { defaultLocale, availableLocales } from '~/plugins/i18n'

  const removeRegion = locale => locale.replace(/-.+/, '')
  const localeIsAvailable = locale => availableLocales.includes(locale)

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
      MapboxExportControl,
    },

    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      sampleDataTime: [],
      showslider: false,
      lngLat: null,
      layers: [],
      layersDialogOpen: false,
      searchIsLoading: false,
      currentLocale: defaultLocale,
      localeIsLoading: false,
      loadedLocales: [ defaultLocale ],
      localeItems: availableLocales.map(locale => ({ title: locale })),
    }),

    computed: {
      ...mapGetters('app', [ 'viewerName', 'appNavigationOpen', 'appNavigationWidth' ]),
      ...mapGetters('map', [ 'drawnFeatures', 'drawMode', 'wmsLayerIds', 'wmsLayers', 'filteredLayerId', 'mapCenter', 'mapZoom', 'zoomExtent', 'selectedLayerForSelection', 'activeFlattenedLayers', 'wmsApiLayer', 'multipleSelection' ]),
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
        return name==='download.api' ? true:false
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
      this.$router.onReady(async (route) => {
        const savedLocale = window.localStorage.getItem('locale')
        let browserLocales = []

        if (navigator.languages != undefined) {
          const languages = navigator.languages.map(removeRegion)
          browserLocales = [ ...new Set(languages) ].filter(localeIsAvailable)
        }

        const localeToUse = savedLocale || browserLocales[0] || defaultLocale

        this.localeIsLoading = true

        if (localeToUse !== defaultLocale) {
          await this.switchLocale(localeToUse)
        }
      
        await this.getAppData({ route, locale: this.currentLocale } )
        this.localeIsLoading = false
      })
    },

    methods: {
      ...mapActions('data', [ 'getAppData', 'setSelectedTimestamp', 'addViewerData' ]),
      ...mapActions('map', [ 'adds', 'removeDrawnFeature', 'addDrawnFeature', 'setMapLoaded' ]),
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
          url: this.selectedLayerForSelection.url,
          layer: this.selectedLayerForSelection.layer,
          ...clickData,
        })
    
        if (feature) {
          if (this.drawnFeatures.find(f => f.id === feature.id)) {
            this.removeDrawnFeature(feature)
          } else {
            this.addDrawnFeature(feature)
          }
        }
      },

      onMouseMove(e) {
        this.lngLat = e.lngLat
      },

      switchLocale(locale) {
        const promise = this.loadedLocales.includes(locale)
          ? Promise.resolve(locale)
          : axios({ method: 'get', url: `/translations/${ locale }.json` })
            .then(({ data }) => {
              this.$i18n.setLocaleMessage(locale, data)
              this.loadedLocales.push(locale)
              return locale
            })

        return promise.then(newLocale => {
          window.localStorage.setItem('locale', locale)
          this.$i18n.locale = newLocale
          this.currentLocale = newLocale
        })
      },

      async switchLocaleAndAddViewerData(locale) {
        this.localeIsLoading = true
        await this.switchLocale(locale)
        await this.addViewerData({ viewer: this.$route.params.config, locale: this.currentLocale })
        this.localeIsLoading = false
      },

      handleSearch: debounce(async function(val) {
        try {
          this.searchIsLoading = true

          if (val.trim()) {
            const { data } = await axios(`/api/search?viewer=${ this.viewerName }&query=${ val }`)
            this.layers = data
            this.layersDialogOpen = true
          }
        } catch (e) {
          console.log(e)
        } finally {
          this.searchIsLoading = false
        }
      }, 1000),

      closeLayersDialog() {
        this.layersDialogOpen = false
      },
    },
  }
</script>
<style>

.mapboxgl-ctrl-top-right {
    top: 0;
    right: 0;
}

@media only screen and (max-width:1199px) {
  .mapboxgl-ctrl-top-right {
    top: 0;
    right: calc(100vw - 560px);
  }
  }
</style>

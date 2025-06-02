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
      <burger-menu
        :loadingburger="localeIsLoading"
        @open-contact-form="onOpenContactForm"
        @open-acknowledgments="onOpenAcknowledgments"
        @open-user-agreement="onClickOpenContactForm"
        @open-privacy-statement="onOpenPrivacyStatement"
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

    <feedback-dialog
      :open="feedbackDialogOpen"
      :privacy-statement="viewerPrivacyStatement"
      @close="closeFeedbackDialog"
    />

    <UserAgreementDialog
      :open="showUserAgreement || clickedUserAgreementOpen"
      :user-agreement="viewerUserAgreement"
      @close="closeUserAgreementDialog"
    />
   
    <acknowledgments-dialog
      :open="acknowledgmentsDialogOpen"
      :acknowledgments="acknowledgments" 
      @close="closeAcknowledgmentsDialog"
    />

    <v-tour
      :steps="generateTourSteps({title: viewerName})"
      :options="tourConfig"
      name="introduction"
      @click.native="nextStep"
      :callbacks="tourCallbacks"
    />

    <v-mapbox
      slot="map"
      :access-token="accessToken"
      map-style="mapbox://styles/siggyf/ckww2c33f0xlf15nujlx41fe2"
      :center="mapCenter"
      :zoom="mapZoom"
      class="mapbox-map"
      :style="`--sidebar-width: ${appNavigationWidth}px`"
      @mb-load="setMapLoaded"
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
        v-for="(layer, index) in mapboxLayers"
        :key="layer.id"
        :before="wmsLayerIds[index - 1]"
        :options="layer"
        :opacity="layer.opacity"
      />

      <mapbox-scale-control />
      <map-zoom :extent="zoomExtent" />
      <MapMouseMove @mousemove="onMouseMove" />
      <v-mapbox-navigation-control position="bottom-right" />
      <mapbox-draw-control
        :draw-mode="drawMode"
        :drawn-features="drawnFeatures"
        @change="addDrawnFeature"
      />
      <mapbox-select-point-control
        :draw-mode="drawMode"
        @click="handleFeatureClick"
      />
      <map-layer-info
        v-if="activeFlattenedLayers.length && !drawMode"
        :layer="activeFlattenedLayers[0]"
      />
    </v-mapbox>
  </app-shell>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import AppShell from './components/AppShell/AppShell'
  import MapLayer from './components/MapComponents/MapLayer.js'
  import MapZoom from './components/MapComponents/MapZoom.js'
  import MapLayerInfo from './components/MapComponents/MapLayerInfo'
  import MapboxDrawControl from '~/components/MapboxDrawControl/MapboxDrawControl'
  import LocaleSwitcher from '~/components/LocaleSwitcher/LocaleSwitcher'
  import BurgerMenu from '~/components/BurgerMenu/BurgerMenu'
  import MapboxLegend from '~/components/MapboxLegend/MapboxLegend'
  import LayerOrder from '~/components/LayerOrder/LayerOrder'
  import TimeSlider from '~/components/TimeSlider'
  import MapboxSelectPointControl from '~/components/MapboxSelectPointControl/MapboxSelectPointControl'
  import getFeatureInfo from '~/lib/get-feature-info'
  import MapMouseMove from './components/MapComponents/MapMouseMove.js'
  import MapboxCoordinates from './components/MapboxCoordinates/MapboxCoordinates.vue'
  import MapboxScaleControl from './components/MapboxScaleControl/MapboxScaleControl.vue'
  import debounce from '~/lib/debounce'
  import axios from 'axios'
  import LayersDialog from '~/components/LayersDialog/LayersDialog'
  import SearchBar from '~/components/SearchBar/SearchBar'
  import UserAgreementDialog from '~/components/UserAgreementDialog/UserAgreementDialog.vue'
  import { defaultLocale, availableLocales } from '~/plugins/i18n'
  import { tourConfig, generateTourSteps, tourStepCount } from '@/plugins/vue-tour'
  import FeedbackDialog from './components/FeedbackDialog/FeedbackDialog.vue'
  import AcknowledgmentsDialog from '~/components/AcknowledgmentsDialog/AcknowledgmentsDialog.vue'
  import { getCookie, setCookie } from './lib/cookies'

  const removeRegion = locale => locale.replace(/-.+/, '')
  const localeIsAvailable = locale => availableLocales.includes(locale)

  export default {
    components: {
      AppShell,
      MapLayer,
      MapZoom,
      MapLayerInfo,
      MapboxDrawControl,
      LayerOrder,
      LocaleSwitcher,
      BurgerMenu,
      MapboxSelectPointControl,
      MapboxLegend,
      TimeSlider,
      MapMouseMove,
      MapboxCoordinates,
      LayersDialog,
      SearchBar,
      MapboxScaleControl,
      UserAgreementDialog,
      FeedbackDialog,
      AcknowledgmentsDialog,
    },

    data: () => ({
      tourConfig,
      tourCallbacks: {},
      generateTourSteps,
      tourStepCount,
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
      userAgreementOpen: true,
      feedbackDialogOpen: false,
      clickedUserAgreementOpen: false,
      acknowledgmentsDialogOpen: false,
    }),

    computed: {
      ...mapGetters('app', [ 'viewerName', 'appNavigationOpen', 'appNavigationWidth', 'viewerUserAgreement', 'viewerPrivacyStatement', 'acknowledgments' ]),
      ...mapGetters('map', [ 'drawnFeatures', 'drawMode', 'wmsLayerIds', 'mapboxLayers', 'filteredLayerId', 'mapCenter', 'mapZoom', 'zoomExtent', 'selectedLayerForSelection', 'activeFlattenedLayers', 'wmsApiLayer', 'multipleSelection' ]),
      ...mapGetters('data', [ 'timeExtent', 'flattenedLayers', 'displayLayers' ]),
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
      showUserAgreement() {
        const userAgreement = localStorage.getItem('userAgreement')
        return this.viewerUserAgreement && !userAgreement && this.userAgreementOpen
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
      this.tourCallbacks = { onSkip: this.skipTourCallback, }
      const skipTourCookie = getCookie("skipTour")
      if (!skipTourCookie) {
        this.showTour()
      }
    },

    methods: {
      ...mapActions('data', [ 'getAppData', 'setSelectedTimestamp', 'addViewerData' ]),
      ...mapActions('map', [ 'adds', 'removeDrawnFeature', 'addDrawnFeature', 'setMapLoaded', 'loadLayerOnMap' ]),
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
          serviceType: this.selectedLayerForSelection.serviceType,
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

      closeUserAgreementDialog() {
        this.userAgreementOpen = false
        this.clickedUserAgreementOpen = false
      },
      showTour () {
        this.$tours.introduction.start()
      },
      skipTourCallback() {
        setCookie("skipTour", true, 30)        
      },
      nextStep () {
        if (tourStepCount == 2 ) {
          const firstFolder = this.displayLayers[0]

          this.loadLayerOnMap({ layers: [
            this.flattenedLayers[0],
            this.flattenedLayers[1],
          ] })

          this.$router.push({
            query: {
              ...this.$route.query,
              folders: firstFolder.id,
            },
          })
        }
      },
      onOpenContactForm() {
        this.feedbackDialogOpen = true
      },
      closeFeedbackDialog() {
        this.feedbackDialogOpen = false
      },
      onClickOpenContactForm() {
        this.clickedUserAgreementOpen = true
      },
      onOpenPrivacyStatement() {
        window.open(this.viewerPrivacyStatement, '_blank')
      },
      onOpenAcknowledgments() {
        this.acknowledgmentsDialogOpen = true
      },
      closeAcknowledgmentsDialog() {
        this.acknowledgmentsDialogOpen = false
      },
    },
  }
</script>

<style lang="scss">
  .mapbox-map {
    width: 100%;
    height: 100%;
  }

  .mapboxgl-ctrl-top-right {
    top: 0;
    right: 0;
  }

  @media only screen and (max-width: 1199px) {
    .mapboxgl-ctrl-top-right {
      top: 0;
      right: unset;
      left: calc(var(--sidebar-width) + #{$spacing-default});
    }

    .mapboxgl-ctrl-top-right .mapboxgl-ctrl {
      float: left;
    }
  }
</style>

<script>
  import { mapGetters } from 'vuex'
  import Mapbox from 'mapbox-gl'
  import getFeatureInfo from '~/lib/get-feature-info'
  import { buildCombinedPopup } from '~/lib/json-2-html-table'

  export default {
    name: 'MapLayerInfo',
    inject: [ 'getMap' ],
    data() {
      return {
        activePopup: null,
      }
    },
    computed: {
      ...mapGetters('map', [ 'activeFlattenedLayers' ]),
    },
    created() {
      this.addListener()
    },
    destroyed() {
      this.removeListener()
      this.removeActivePopup()
    },
    methods: {
      deferredMountedTo() {
        // Needed for vue2mapbox-gl to work
        // https://github.com/openearth/vue2mapbox-gl/blob/master/src/components/VMapbox.vue#L176
      },
      isVectorInfoLayer(layer) {
        return Boolean(layer && layer.featureType)
      },
      getVectorLayerId(layer) {
        const layerName = layer && layer.layer
        if (!layerName || !layerName.includes(':')) {
          return null
        }
        return layerName.split(':')[1]
      },
      removeActivePopup() {
        if (this.activePopup) {
          this.activePopup.remove()
          this.activePopup = null
        }
      },
      normalizeProperties(layer, properties) {
        const normalized = { ...properties }

        if ('GRAY_INDEX' in normalized) {
          normalized[`${ layer.name }_value`] = normalized['GRAY_INDEX']
          delete normalized['GRAY_INDEX']
        }

        return normalized
      },
      getLayerIndex(layer) {
        return this.activeFlattenedLayers.findIndex(activeLayer => activeLayer.id === layer.id)
      },
      getVectorResults(map, event, vectorLayers) {
        const vectorLayerIds = vectorLayers
          .map(layer => this.getVectorLayerId(layer))
          .filter(Boolean)

        if (!vectorLayerIds.length) {
          return []
        }

        const features = map.queryRenderedFeatures(event.point, {
          layers: vectorLayerIds,
        })

        return vectorLayers.reduce((results, layer) => {
          const layerId = this.getVectorLayerId(layer)
          const feature = features.find(({ layer: featureLayer }) => featureLayer.id === layerId)

          if (!feature || !feature.properties) {
            return results
          }

          return [
            ...results,
            {
              layer,
              properties: this.normalizeProperties(layer, feature.properties),
            },
          ]
        }, [])
      },
      async getRasterResults(map, event, rasterLayers) {
        if (!rasterLayers.length) {
          return []
        }

        const { lng, lat } = event.lngLat
        const featureInfoPending = new Mapbox.Popup()
          .setLngLat(event.lngLat)
          .addTo(map)

        try {
          const responses = await Promise.all(
            rasterLayers.map(async (layer) => {
              const infoLayer = layer.downloadLayer || layer.layer
              const info = await getFeatureInfo({
                layer: infoLayer,
                url: layer.url,
                serviceType: layer.dataServiceType,
                lng,
                lat,
              })

              if (!info || !info.properties) {
                return null
              }

              return {
                layer,
                properties: this.normalizeProperties(layer, info.properties),
              }
            }),
          )

          return responses.filter(Boolean)
        } finally {
          featureInfoPending.remove()
        }
      },
      sortResultsByStackingOrder(results) {
        return [ ...results ].sort((a, b) => this.getLayerIndex(a.layer) - this.getLayerIndex(b.layer))
      },
      stylePopupHeaders(popup) {
        const primaryColor = this.$vuetify.theme.currentTheme.primary

        setTimeout(() => {
          const popupElement = popup.getElement()
          const headers = popupElement.querySelectorAll('.mapboxgl-popup-content p')

          headers.forEach((header) => {
            header.style.backgroundColor = primaryColor
            header.style.color = 'white'
            header.style.padding = '2px'
            header.style.margin = '0'
          })
        }, 0)
      },
      async handleClick(event) {
        const map = this.getMap()
        this.removeActivePopup()

        const vectorLayers = this.activeFlattenedLayers.filter(layer => this.isVectorInfoLayer(layer))
        const rasterLayers = this.activeFlattenedLayers.filter(layer => !this.isVectorInfoLayer(layer))

        const vectorResults = this.getVectorResults(map, event, vectorLayers)
        const rasterResults = await this.getRasterResults(map, event, rasterLayers)
        const results = this.sortResultsByStackingOrder([ ...vectorResults, ...rasterResults ])

        if (!results.length) {
          return
        }

        const popup = new Mapbox.Popup()
          .setLngLat(event.lngLat)
          .setHTML(buildCombinedPopup(
            results.map(({ layer, properties }) => ({
              title: layer.name,
              properties,
            })),
          ))
          .addTo(map)

        this.stylePopupHeaders(popup)
        this.activePopup = popup
      },
      addListener() {
        const map = this.getMap()
        map.on('click', this.handleClick)
      },
      removeListener() {
        const map = this.getMap()
        map.off('click', this.handleClick)
      },
    },
    render: () => null,
  }
</script>

<style>
  .mapboxgl-popup-content {
    width: 400px;
    max-height: 400px;
    overflow-y: scroll;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
</style>

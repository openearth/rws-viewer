<script>
  import Mapbox from 'mapbox-gl'
  import getFeatureInfo from '~/lib/get-feature-info' 
  import json2HtmlTable from '~/lib/json-2-html-table'

  export default {
    name: 'MapLayerInfo',
    inject: [ 'getMap' ],
    props: {
      layer: {
        type: Object,
        required: true,
      },
      activePopup: {
        type: Object,
        required: false,
        default: null,
      },
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
      isVectorInfoLayer() {
        return Boolean(this.layer && this.layer.featureType)
      },
      getVectorLayerId() {
        const layerName = this.layer && this.layer.layer
        if (!layerName || !layerName.includes(':')) {
          return null
        }
        return layerName.split(':')[1]
      },
      removeActivePopup() {
        if (this.activePopup) {
          this.activePopup.remove()
          this.$emit('remove-active-popup', null)
        }
      },
      async cb(event) {
        const map = this.getMap()
        const { lng, lat } = event.lngLat
        this.removeActivePopup()

        let properties = null
        if (this.isVectorInfoLayer()) {
          console.log('event', event)
          const feature = event.features && event.features[0]
          if (!feature) {
            return
          }
          properties = { ...(feature.properties || {}) }
        } else {
      
          const featureInfoPending = new Mapbox.Popup().setLngLat(event.lngLat).addTo(map)
          let infoLayer
          if (this.layer.downloadLayer) {
            infoLayer = this.layer.downloadLayer
          } else {
            infoLayer = this.layer.layer
          }
          const info = await getFeatureInfo({
            layer: infoLayer,
            url: this.layer.url,
            serviceType: this.layer.dataServiceType,
            lng, lat,
          })
          featureInfoPending.remove()
          if (!info) {
            return
          }
          properties = { ...(info.properties || {}) }
        }

        if ('GRAY_INDEX' in properties) {
          properties[`${ this.layer.name }_value`] = properties['GRAY_INDEX']
          delete properties['GRAY_INDEX']
        }

        // Get primary color from Vuetify theme
        const primaryColor = this.$vuetify.theme.currentTheme.primary
        
        const popup = new Mapbox.Popup()
          .setLngLat(event.lngLat)
          .setHTML(json2HtmlTable(this.layer.name, [ properties ]))
          .addTo(map)
        
        // Apply primary color to popup header after it's added to the map
        setTimeout(() => {
          const popupElement = popup.getElement()
          const header = popupElement.querySelector('.mapboxgl-popup-content p')
          if (header) {
            header.style.backgroundColor = primaryColor
            header.style.color = 'white'
            header.style.padding = '2px'
            header.style.margin = '0'
          }
        }, 0)
        
        this.$emit('set-active-popup', popup)
      },
      getClickListenerArgs() {
        if (this.isVectorInfoLayer()) {
          const layerId = this.getVectorLayerId()
          if (layerId) {
            return [ 'click', layerId, this.cb ]
          }
        }
        return [ 'click', this.cb ]
      },
      addListener() {
        const map = this.getMap()
        map.on(...this.getClickListenerArgs())
      },
      removeListener() {
        const map = this.getMap()
        map.off(...this.getClickListenerArgs())
      },
    },
    watch: {
      layer() {
        this.removeListener()
        this.addListener()
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

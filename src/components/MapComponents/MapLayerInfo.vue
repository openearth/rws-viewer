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

        const loadingPopup = new Mapbox.Popup().setLngLat(event.lngLat).addTo(map)
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
        
        loadingPopup.remove()

        if (info) {
          const { properties } = info

          if ('GRAY_INDEX' in properties) {
            properties[`${ this.layer.name }_value`] = properties['GRAY_INDEX']
            delete properties['GRAY_INDEX']
          }
          console.log('Feature info properties:', properties)
          
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
        }
      },
      addListener() {
        const map = this.getMap()
        map.on('click', this.cb)
      },
      removeListener() {
        const map = this.getMap()
        map.off('click', this.cb)
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

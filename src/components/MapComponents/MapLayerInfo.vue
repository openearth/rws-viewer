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
          serviceType: this.layer.serviceType,
          lng, lat,
        })
        
        loadingPopup.remove()

        if (info) {
          
          const { properties } = info
          const popup = new Mapbox.Popup()
            .setLngLat(event.lngLat)
            .setHTML(json2HtmlTable(this.layer.name, [ properties ]))
            .addTo(map)
          
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
  overflow-y: scroll;
  width: 360px;
  max-height: 240px;
}
</style>

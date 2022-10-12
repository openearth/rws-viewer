import Mapbox from 'mapbox-gl'
import getFeatureInfo from '~/lib/get-feature-info'
import json2HtmlTable from '~/lib/json-2-html-table'

export default {
  name: 'map-layer-info',
  inject: [ 'getMap' ],
  render: () => null,
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
    removeActivePopup() {
      if (this.activePopup) {
        this.activePopup.remove()
        this.$emit('remove-active-popup', null)
      }
    },
    async cb(event) {
      const map = this.getMap()
      const bounds = map.getBounds()
      const canvas = map.getCanvas()
      const { x, y } = event.point
      const { width, height } = canvas

      this.removeActivePopup()
      
      const loadingPopup = new Mapbox.Popup()
        .setLngLat(event.lngLat)
        .setHTML('loading...')
        .addTo(map)

      const info = await getFeatureInfo({
        layer: this.layer.layer,
        url: this.layer.url,
        bounds,
        x,
        y,
        width,
        height,
      })

      loadingPopup.remove()

      if (info) {
        const { properties } = info
  
  

        const popup = new Mapbox.Popup()
          .setLngLat(event.lngLat)
          .setHTML(json2HtmlTable([ properties ]))
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
}

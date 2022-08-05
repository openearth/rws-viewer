export default {
  name: 'map-zoom',
  inject: [ 'getMap' ],
  render: () => null,
  props: {
    extent: {
      type: Array,
      default: () => ([]),
    },
  },
  methods:  {
    deferredMountedTo() {
      this.zoomToExtent()
    },
    zoomToExtent() {
      const map = this.getMap()
      if (map && this.extent.length) {
         map.fitBounds(this.extent, {
          padding: 100,
          maxZoom: 12,
         })
      }
    },
  },
  mounted() {
    this.zoomToExtent()
  },
  watch: {
    extent() {
      this.zoomToExtent()
    },
  },
}



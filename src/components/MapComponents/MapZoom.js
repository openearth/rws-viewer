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
         map.fitBounds(this.extent)
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



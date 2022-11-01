import { mapGetters } from 'vuex'

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
  computed: {
    ...mapGetters('app', [ 'appNavigationWidth' ]),
  },
  methods:  {
    deferredMountedTo() {
      this.zoomToExtent()
    },
    zoomToExtent() {
      const map = this.getMap()
      if (map && this.extent.length) {
         map.fitBounds(this.extent, {
          padding: {
            left: this.appNavigationWidth,
            top: 100,
            right: 100,
            bottom: 100,
          },
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



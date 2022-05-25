import { isNil } from '~/lib/helpers.js'

export default {
  name: 'map-layer',
  inject: [ 'getMap' ],
  render() {
    return null
  },
  props: {
    options: {
      default: () => {
        return {}
      },
      type: [ Object, String ],
    },
    // allows to place a layer before another
    before: {
      type: String,
      required: false,
    },
    opacity: {
      type: Number,
      required: false,
      validator: val => val >= 0 && val <= 1,
    },
  },
  data() {
    return {
      // used to determine if mounted or deferredMountedTo should be used
      isInitialized: false,
    }
  },
  watch: {
    opacity() {
      this.setOpacity()
    },
  },
  mounted() {
    // only execute when map is available and layer is not already initialized
    if (this.getMap()) {
      this.rerender()
      this.isInitialized = true
    }
  },
  destroyed() {
    this.removeLayer()
  },
  methods: {
    deferredMountedTo() {
      // only execute when layer is not already initialized
      if (!this.isInitialized) {
        this.rerender()
        this.isInitialized = true
      }
    },
    removeLayer() {
      const map = this.getMap()
      if (map) {
        const layer = map.getLayer(this.options.id)

        if (layer) {
          map.removeLayer(this.options.id)
          try {
            map.removeSource(layer.source)
          } catch {
            console.warn('could not remove source', layer.source)
          }
        }
      }
    },
    addLayer() {
      const map = this.getMap()

      if (this.before && map.getLayer(this.before)) {
        map.addLayer(this.options, this.before)
      } else {
        map.addLayer(this.options)
      }
      if (!isNil(this.opacity)) {
        this.setOpacity()
      }
    },
    setOpacity() {
      const map = this.getMap()
      const { id, type } = this.options
      map.setPaintProperty(id, `${ type }-opacity`, this.opacity)
    },
    rerender() {
      this.removeLayer()
      this.addLayer()
    },
  },
}

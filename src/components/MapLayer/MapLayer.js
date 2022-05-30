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

  methods: {
    deferredMountedTo() {
      // only execute when layer is not already initialized
      if (!this.isInitialized) {
        this.rerender()
        this.isInitialized = true
      }
    },
    rerender() {
      this.removeLayer()
      this.addLayer()
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

    setOpacity() {
      const map = this.getMap()
      const { id, type } = this.options
      map.setPaintProperty(id, `${ type }-opacity`, this.opacity)
    },

  },
  mounted() {
    // only execute when map is available and layer is not already initialized
    
    if (this.getMap()) {
      console.log('rerender this.options', this.options)
      this.rerender()
      this.isInitialized = true
    }
  },
  destroyed() {
    this.removeLayer()
  },
  watch: {
    opacity() {
      this.setOpacity()
    },
  },
}

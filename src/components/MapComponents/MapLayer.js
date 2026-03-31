import { isNil } from '~/lib/helpers.js'

export default {
  name: 'v-mapbox-layer',

  inject: [ 'getMap' ],

  render: () => null,

  props: {
    options: {
      type: Object,
      default: () => ({}),
    },

    // Allows to place a layer before another
    before: {
      type: String,
      default: undefined,
    },

    clickable: {
      type: Boolean,
      default: false,
    },
    hoverable: {
      type: Boolean,
      default: false,
    },
    highlightable: {
      type: Boolean,
      default: false,
    },

    opacity: {
      type: Number,
      required: false,
      validator: val => val >= 0 && val <= 1,
    },
  },

  data: () => ({
    isInitialized: false,
    selectedFeatureState: null,
  }),

  methods: {
    deferredMountedTo() {
      if (!this.isInitialized) {
        this.renderLayer()
        this.isInitialized = true
      }
    },

    renderLayer() {
      this.removeLayer()
      this.addLayer()
    },

    addLayer() {
      const map = this.getMap()
      
     
      if (this.before && map.getLayer(this.before)) {
        map.addLayer(this.options, this.before)
      } else if (map.getLayer('gl-draw-polygon-fill-inactive.cold')) {
        map.addLayer(this.options, 'gl-draw-polygon-fill-inactive.cold')
      } else {
        map.addLayer(this.options)
      }

      const layerId = this.options.id
      if (this.clickable) {
        map.on('click', layerId, this.clickFn)
      }
      if (this.highlightable) {
        map.on('click', layerId, this.highlightClickFn)
        map.on('click', this.clearHighlightOnOutsideClick)
      }
      if (this.hoverable) {
        map.on('mouseenter', layerId, this.mouseEnterFn)
        map.on('mouseleave', layerId, this.mouseLeaveFn)
      }

      if (!isNil(this.opacity)) {
        this.setOpacity()
      }
    },

    removeLayer() {
      const map = this.getMap()
      if (map) {
        const layerId = this.options.id
        if (this.clickable) {
          map.off('click', layerId, this.clickFn)
        }
        if (this.highlightable) {
          map.off('click', layerId, this.highlightClickFn)
          map.off('click', this.clearHighlightOnOutsideClick)
          this.clearSelectedFeature()
        }
        if (this.hoverable) {
          map.off('mouseenter', layerId, this.mouseEnterFn)
          map.off('mouseleave', layerId, this.mouseLeaveFn)
        }

        const layer = map.getLayer(layerId)
        if (layer) {
          const layerSource = layer.source
          map.removeLayer(layerId)
          if (layerSource && !map.getStyle().layers.some(({ source }) => source === layerSource)) {
            map.removeSource(layerSource)
          }
        }
      }
    },

    setFeatureState(state, selected) {
      const map = this.getMap()
      if (!map || !state) {
        return
      }
      const { source, sourceLayer, id } = state
      if (source == null || sourceLayer == null || id == null) {
        return
      }
      map.setFeatureState({ source, sourceLayer, id }, { selected })
    },

    clearSelectedFeature() {
      if (!this.selectedFeatureState) {
        return
      }
      this.setFeatureState(this.selectedFeatureState, false)
      this.selectedFeatureState = null
    },

    highlightClickFn(e) {
      const feature = e.features && e.features[0]
      if (!feature || feature.id == null) {
        return
      }
      const next = {
        source: feature.source,
        sourceLayer: feature.sourceLayer || this.options['source-layer'],
        id: feature.id,
      }
      if (next.source == null || next.sourceLayer == null) {
        return
      }

      const current = this.selectedFeatureState
      const isSameFeature = current &&
        current.source === next.source &&
        current.sourceLayer === next.sourceLayer &&
        current.id === next.id

      this.clearSelectedFeature()
      if (!isSameFeature) {
        this.setFeatureState(next, true)
        this.selectedFeatureState = next
      }
    },

    clearHighlightOnOutsideClick(e) {
      if (!this.selectedFeatureState) {
        return
      }
      const map = this.getMap()
      if (!map || !this.options || !this.options.id) {
        return
      }
      const features = map.queryRenderedFeatures(e.point, {
        layers: [ this.options.id ],
      })
      if (!features || !features.length) {
        this.clearSelectedFeature()
      }
    },

    clickFn(e) {
      this.$emit('click', e)
    },

    mouseEnterFn() {
      const map = this.getMap()
      map.getCanvas().style.cursor = 'pointer'
    },

    mouseLeaveFn() {
      const map = this.getMap()
      map.getCanvas().style.cursor = ''
    },

    setOpacity() {
      const map = this.getMap()
      const { id, type } = this.options
      map.setPaintProperty(id, `${ type }-opacity`, this.opacity)
    },
  },

  mounted() {
    const map = this.getMap()
    // We can immediately initialize if we have the map ready
    
    if (map) {
      this.renderLayer()
      this.isInitialized = true
    }
  },

  destroyed() {
    this.removeLayer()
  },

  watch: {
    options: {
      deep: true,
      handler() {
        this.renderLayer()
      },
    },
    opacity() {
      this.setOpacity()
    },
    before(onTopLayer) {
      const map = this.getMap()
      map.moveLayer(this.options.id, onTopLayer)
      if (!onTopLayer) {
        map.moveLayer(this.options.id, 'gl-draw-polygon-fill-inactive.cold')
      }
     },
  },
}

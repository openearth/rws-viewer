<script>
  import MapboxDraw from '@mapbox/mapbox-gl-draw'
  import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'
  import StaticMode from '@mapbox/mapbox-gl-draw-static-mode'
  import styles from '@mapbox/mapbox-gl-draw/src/lib/theme'

  export default {
    props: {
      drawMode: {
        type: String,
        default: null,
      },
      drawnFeatures: {
        type: Array,
        default: () => [],
      },
    },

    computed: {
      combinedFeatures() {
        return {
          features: this.drawnFeatures.map(feature => ({
            ...feature,
            id: feature.properties.gebiedid,
          })),
          type: 'FeatureCollection',
        }
      },
    },

    watch: {
      drawMode(mode) {
        if (mode) {
          map.getCanvas().style.cursor = 'crosshair'
          this.mbDraw.changeMode(`draw_${ mode }`)
        } else {
          map.getCanvas().style.cursor = ''
          this.mbDraw.changeMode('simple_select')
        }
      },
      combinedFeatures(featureCollection) {
        
        if (this.mbDraw) {
          this.mbDraw.deleteAll()

          if (featureCollection.features.length) {
            this.mbDraw.add(featureCollection)
          }
        }
      },
    },

    methods: {
      deferredMountedTo(map) {
        window.map = map
        const modes = MapboxDraw.modes
        modes.draw_rectangle = DrawRectangle
        modes.draw_static = StaticMode

        const mbDraw = new MapboxDraw({
          displayControlsDefault: false,
          // We add the delete control and then hide it visually
          // so the user can delete with keyboard commands
          controls: {
            trash: true,
          },
          modes,
          styles: styles.map(style => {
            if ([
              'gl-draw-polygon-fill-active',
              'gl-draw-polygon-fill-inactive',
              'gl-draw-polygon-fill-static',
            ].includes(style.id)) {
              return {
                ...style,
                paint: {
                  ...style.paint,
                  'fill-color': '#ff0000',
                  'fill-opacity': 0.5,
                },
              }
            }

            if ([
              'gl-draw-polygon-stroke-active',
              'gl-draw-polygon-stroke-inactive',
              'gl-draw-polygon-stroke-static',
            ].includes(style.id)) {
              return {
                ...style,
                paint: {
                  ...style.paint,
                  'line-color': '#00FF00',
                },
              }
            }
            return style
          }),
        })

        this.mbDraw = mbDraw
        
        map.addControl(mbDraw)

        const onChangeFn = () => {
          const { features } = this.mbDraw.getAll()
          const feature = features[0]
          this.$emit('change', feature)
        }

        map
          .on('draw.create', onChangeFn)
          .on('draw.delete', onChangeFn)
          .on('draw.update', onChangeFn)
      },
    },

    render: () => null,
  }
</script>

<style>
.mapbox-gl-draw_ctrl-draw-btn {
  display: none !important;
}
</style>

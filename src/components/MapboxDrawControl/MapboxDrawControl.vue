<script>
  import MapboxDraw from '@mapbox/mapbox-gl-draw'
  import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'

  export default {
    props: {
      drawMode: {
        type: String,
        default: null,
      },
      drawnFeature: {
        type: Object,
        default: null,
      },
    },

    data: () => ({
      internalFeatureId: undefined,
    }),

    watch: {
      drawMode(mode) {
        if(mode) {
          this.mbDraw.changeMode(`draw_${ mode }`)
        }
        else {
          this.mbDraw.changeMode('simple_select')
        }
      },

      drawnFeature(feature) {
        // If the id is the same the update came from an operation
        // done with this component, so no updates necessary
        if(feature && this.internalFeatureId === feature.id) {
          return
        }
        // Otherwise we clear all drawn features and update if necessary
        this.mbDraw.deleteAll()
        this.internalFeatureId = feature?.id
        if(feature) {
          this.mbDraw.add(feature)
        }
      },
    },

    methods: {
      deferredMountedTo(map) {
        const modes = MapboxDraw.modes
        modes.draw_rectangle = DrawRectangle

        const mbDraw = new MapboxDraw({
          displayControlsDefault: false,
          // We add the delete control and then hide it visually
          // so the user can delete with keyboard commands
          controls: {
            trash: true,
          },
          modes,
        })

        this.mbDraw = mbDraw
        map.addControl(mbDraw)

        const onChangeFn = () => {
          const { features } = this.mbDraw.getAll()
          const feature = features[0]
          // We track the id of the feature so we know when to delete or replace it
          this.internalFeatureId = feature?.id
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

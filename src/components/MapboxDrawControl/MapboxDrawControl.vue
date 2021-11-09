<script>
  import MapboxDraw from '@mapbox/mapbox-gl-draw'
  import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'

  export default {
    props: {
      drawMode: {
        type: String,
        default: null,
      },
    },

    watch: {
      drawMode(mode) {
        if (mode) {
          this.mbDraw.changeMode(`draw_${ mode }`)
        } else {
          this.mbDraw.changeMode('simple_select')
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
          const drawnFeatures = mbDraw.getAll()
          this.$emit('change', drawnFeatures)
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

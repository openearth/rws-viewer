<script>
  export default {
    props: {
      drawMode: {
        type: String,
        default: null,
      },
    },

    data: () => ({
      internalFeatureId: undefined,
      map: null,
    }),

    watch: {
      drawMode(value) {
        if (this.map) {
          this.map[value ? 'on' : 'off']('click', this.handleMapClick)
        }
      },
    },

    methods: {
      deferredMountedTo(map) {
        this.map = map
      },

      handleMapClick(event) {
        const map = event.target
        const bounds = map.getBounds()
        const canvas = map.getCanvas()

        const { x, y } = event.point
        const { width, height } = canvas

        this.$emit('click',{
          bounds,
          x,
          y,
          width,
          height,
        })
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

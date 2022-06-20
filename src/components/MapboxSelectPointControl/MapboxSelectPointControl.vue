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
        const style = window.getComputedStyle(canvas)

        const width = parseInt(style.getPropertyValue('width'))
        const height = parseInt(style.getPropertyValue('height'))
        const { x, y } = event.point

        this.$emit('click',{
          bounds,
          x,
          y,
          width: width,
          height: height,
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

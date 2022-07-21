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
        const isStatic = value === 'static'

        if (this.map) {
          this.map[isStatic ? 'on' : 'off']('click', this.handleMapClick)
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
        console.log('click', bounds, x, y, width, height)

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

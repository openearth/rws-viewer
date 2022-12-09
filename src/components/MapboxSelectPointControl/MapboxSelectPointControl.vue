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
    
        const { lng, lat } = event.lngLat
        this.$emit('click',{
          lng,lat,
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

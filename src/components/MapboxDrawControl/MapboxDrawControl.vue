<script>
  import MapboxDraw from '@mapbox/mapbox-gl-draw'

  export default {
    inject: [ 'getMap' ],

    methods: {
      deferredMountedTo(map) {
        const mbDraw = new MapboxDraw({
          displayControlsDefault: false,
        })

        // map.__draw = mbDraw
        map.addControl(mbDraw)
      },
    },

    render: () => null,
  }
</script>

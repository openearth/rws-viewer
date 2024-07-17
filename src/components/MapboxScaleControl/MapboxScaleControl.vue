<script>
  import Mapbox from 'mapbox-gl'

  export default {
    methods: {
      deferredMountedTo(map) {
        window.map = map

        const mbScale = new Mapbox.ScaleControl({
          maxWidth: 100,
          unit: 'metric',
        })

        map.addControl(mbScale, 'bottom-right')
      },
    },

    render: () => null,
  }
</script>

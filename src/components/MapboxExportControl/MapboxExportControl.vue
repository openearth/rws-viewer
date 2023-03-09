<script>
  import { MapboxExportControl } from '@watergis/mapbox-gl-export'
  import '@watergis/mapbox-gl-export/css/styles.css'

  export default {
    methods: {
      deferredMountedTo(map) {
        window.map = map

        map.addControl(new MapboxExportControl(), 'top-right')
      },
    },
    render: () => null,
  }
</script>

<style>
#spinner .la-ball-spin {
  color: #fff !important
}
</style>

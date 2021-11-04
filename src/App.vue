<template>
  <app-shell header-title="RWS Viewer">
    <mapbox-map
      slot="map"
      :access-token="accessToken"
    >
      <v-mapbox-layer
        v-for="layer in layers"
        :key="layer.id"
        :options="layer"
      />
    </mapbox-map>
  </app-shell>
</template>

<script>
  import { MapboxMap } from '@deltares/vue-components'

  import AppShell from '~/components/AppShell/AppShell'

  export default {
    components: {
      AppShell,
      MapboxMap,
    },
    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      layers: [],
    }),
  }
</script>

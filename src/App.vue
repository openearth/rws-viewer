<template>
  <app-shell :header-title="appName">
    <mapbox-map
      slot="map"
      :access-token="accessToken"
    >
      <v-mapbox-layer
        v-for="layer in rasterLayers"
        :key="layer.id"
        :options="layer"
      />
    </mapbox-map>
  </app-shell>
</template>

<script>
  import { mapActions, mapState } from 'vuex'
  import { MapboxMap } from '@deltares/vue-components'

  const AppShell = () => import('~/components/AppShell/AppShell')

  export default {
    components: {
      AppShell,
      MapboxMap,
    },

    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
    }),

    computed: {
      ...mapState('app', [ 'appName' ]),
      ...mapState('map', [ 'rasterLayers' ]),
    },

    mounted() {
      this.$router.onReady(this.getAppData)
    },

    methods: {
      ...mapActions('data', [ 'getAppData' ]),
    },
  }
</script>

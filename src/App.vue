<template>
  <app-shell :header-title="appName">
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
      layers: [],
    }),
    computed: {
      ...mapState('app', [ 'appName' ]),
    },
    watch: {
      appName: {
        immediate: true,
        handler(name) {
          document.title = name ? `${ name } | Open Data Viewer` : 'Open Data Viewer'
        },
      },
    },
    mounted() {
      this.$router.onReady(this.getAppData)
    },
    methods: {
      ...mapActions('data', [ 'getAppData' ]),
    },
  }
</script>

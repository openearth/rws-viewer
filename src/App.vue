<template>
  <app-shell :header-title="platformName">
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
  import configRepo from '~/repo/configRepo'
  import { VALID_PLATFORMS } from '~/lib/constants'
  import { flattenLayers, getLayersTags } from '~/lib/layer-helpers'

  const AppShell = () => import('~/components/AppShell/AppShell')

  export default {
    components: {
      AppShell,
      MapboxMap,
    },

    data: () => ({
      accessToken: process.env.VUE_APP_MAPBOX_TOKEN,
      platformName: '',
      layers: [],
    }),

    mounted() {
      this.$router.onReady(this.getAppData)
    },

    methods: {
      getAppData(route) {
        const platform = route?.query?.platform
        const isValidPlatform = platform && VALID_PLATFORMS.includes(platform)
        const platformToUse = isValidPlatform ? platform : VALID_PLATFORMS[0]
        if(!isValidPlatform) {
          console.error(`No valid platform provided in the query string, falling back to ${ platformToUse }`)
        }

        const configData = configRepo.getConfig(platformToUse)
        this.platformName = configData.name

        const layerList = flattenLayers(configData.layers)
        console.log(layerList)
        const tagList = getLayersTags(layerList)
        console.log(tagList)
      },
    },
  }
</script>

<template>
  <v-container class="pa-0">
    <v-row v-if="!downloadIsAvailable && !activeLayersList.length">
      <v-col>
        <v-alert
          dense
          outlined
          type="info"
        >
          {{ $t('noLayersSelected') }}
        </v-alert>
      </v-col>
    </v-row>
    <template v-else>
      <v-tabs v-if="showApiTab" fixed-tabs>
        <v-tab
          :to="{
            name: 'geoserver-download'
          }"
        >
          Geoserver
        </v-tab>
        <v-tab
          :to="{
            name: 'api-download'
          }"
        >
          API 
        </v-tab>
      </v-tabs>
      <router-view />
    </template>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    computed: {
      ...mapGetters('map', [ 'activeFlattenedLayers', 'activeFlattenedLayerIds' ]),

      activeLayers() {
        return this.activeFlattenedLayerIds.map(id => this.activeFlattenedLayers.find(layer => layer.id === id))
      },

      activeLayersList() {
        return this.activeLayers.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
      },

      downloadIsAvailable() {
        return this.activeLayers.some(layer => Boolean(layer.downloadUrl) || Boolean(layer.url))
      },

      showApiTab() {
        return this.activeLayers.some(layer => layer.externalApiUrl)
      },
    },
  }
</script>

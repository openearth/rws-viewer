<template>
  <v-container class="pa-0">
    <v-row v-if="!downloadIsAvailable && !activeLayers.length">
      <v-col class="pa-8">
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
      <v-tabs
        v-if="showApiTab"
        fixed-tabs
        @change="handleTabChange"
      >
        <v-tab
          :to="{
            name: 'download.geoserver'
          }"
        >
          Geoserver
        </v-tab>
        <v-tab
          :to="{
            name: 'download.api'
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
  import { mapGetters, mapActions } from 'vuex'

  export default {
    computed: {
      ...mapGetters('map', [ 'activeFlattenedLayers', 'activeFlattenedLayerIds' ]),

      activeLayers() {
        return this.activeFlattenedLayerIds.map(id => this.activeFlattenedLayers.find(layer => layer.id === id))
      },

      downloadIsAvailable() {
        return this.activeLayers.some(layer => Boolean(layer?.url))
      },

      showApiTab() {
        return this.activeLayers.some(layer => layer?.externalApi?.length)
      },
    },
    methods: {
      ...mapActions('map', [ 'setDrawMode', 'clearDrawnFeatures' ]),

      handleTabChange() {
        this.setDrawMode({ mode: null })
        this.clearDrawnFeatures()
      },
    },
  }
</script>

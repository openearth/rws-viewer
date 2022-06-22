<template>
  <v-container class="download pt-4">
    <v-row>
      <v-col>
        <h3>{{ $t('select') }}</h3>
        <p class="body-2 mb-0">
          {{ $t('selectDesc') }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          :color="drawMode === 'static' ? 'primary' : null"
          block
          :ripple="false"
          @click="onDrawModeSelect('static')"
        >
          {{ $t('selectFeatures') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="drawMode === 'static'">
      <v-col>
        <v-select
          :value="selectedLayerForSelection.id"
          :label="$t('chooseLayer')"
          :items="activeLayersList"
          dense
          outlined
          hide-details
          @change="handleSelectionLayerSelect"
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />

    <v-btn
      color="primary"
      block
      :href="downloadUrl"
      :disabled="!selectedAreas.length"
    >
      {{ $t('download') }}
    </v-btn>
  </v-container>
</template>

<script>

  import { mapActions, mapGetters } from 'vuex'
  import metaRepo from '~/repo/metaRepo'
  import { generateDownloadUrl } from '~/lib/external-api'

  export default {
    data: () => ({
      selectedLayerId: null,
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeatures', 'activeFlattenedLayerIds', 'activeFlattenedLayers', 'selectedLayerForSelection' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),

      activeLayers() {
        return this.activeFlattenedLayerIds
          .map(id => this.activeFlattenedLayers.find(layer => layer.id === id))
          .map(layer => {
            console.log(layer)
            return layer
          })
          .filter(layer => layer.externalApi)
      },

      activeLayersList() {
        return this.activeLayers.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
      },

      selectedLayer() {
        return this.flattenedLayers.find(layer => layer.id === this.selectedLayerId)
      },

      selectedAreas() {
        if (!this.selectedLayer) {
          return []
        }
        
        const { area } = this.selectedLayer.externalApi.propertyMapping

        return this.drawnFeatures.map(feature => feature.properties[area])
      },

      downloadUrl() {
        if (!this.selectedLayer) {
          return null
        }

        const { url, propertyMapping } = this.selectedLayer.externalApi

        return generateDownloadUrl(url, propertyMapping, { areas: this.selectedAreas })
      },
    },

    watch: {
      selectedLayerForSelection() {
        this.clearDrawnFeatures()
      },
      drawMode() {
        this.clearDrawnFeatures()
      },
    },

    created() {
      metaRepo
        .getPredefinedAreas()
        .then(areas => this.preDefinedAreas = areas)
        .catch(err => console.error('Error getting predefined selections', err))
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'clearDrawnFeatures', 'setSelectedLayerForSelection' ]),

      handleSelectionLayerSelect(id) {
        this.setSelectedLayerForSelection(this.activeLayers.find(layer => layer.id === id))
      },

      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        await this.clearDrawnFeatures()
        this.selectedArea = null

        this.setSelectedLayerForSelection(this.activeLayers.find(layer => layer.id === this.activeLayersList[0].value))
        this.selectedLayerId = this.activeLayersList[0].value

        this.setDrawMode({ mode })
      },
    },
  }
</script>

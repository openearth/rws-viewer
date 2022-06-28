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
      <v-col>
        <v-btn
          :color="drawMode === 'rectangle' ? 'primary' : null"
          block
          :ripple="false"
          @click="onDrawModeSelect('rectangle')"
        >
          {{ $t('drawRectangle') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row v-if="['static', 'rectangle'].includes(drawMode)">
      <v-col>
        <v-select
          :value="selectedLayerForSelection && selectedLayerForSelection.id"
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
      @click="handleDownloadClick"
    >
      {{ $t('download') }}
    </v-btn>
  </v-container>
</template>

<script>

  import { mapActions, mapGetters } from 'vuex'
  import { generateDownloadUrl } from '~/lib/external-api'
  import getFeature from '~/lib/get-feature'

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
        
        const { area } = this.selectedLayerForSelection.externalApi.propertyMapping

        return this.drawnFeatures.map(feature => feature.properties[area])
      },

      downloadUrl() {
        if (!this.selectedLayer) {
          return null
        }

        const { url, propertyMapping } = this.selectedLayer.externalApi

        return generateDownloadUrl(url, propertyMapping, { areas: this.selectedAreas })
      },

      drawnFeatureCoordinates() {
        const drawnFeature = this.drawnFeatures[0]

        return drawnFeature?.geometry?.coordinates
          ? Array.from(drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
          : []
      },

      selectionCoordinates() {
        return this.drawnFeatureCoordinates.toString().replace(/,/g, ' ')
      },
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'clearDrawnFeatures', 'setSelectedLayerForSelection' ]),

      getDownloadUrl({ url, propertyMapping, areas }) {
        return generateDownloadUrl(url, propertyMapping, { areas })
      },

      handleSelectionLayerSelect(id) {
        this.setSelectedLayerForSelection(this.activeLayers.find(layer => layer.id === id))

        if (this.drawMode === 'static') {
          this.clearDrawnFeatures()
        }
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

      async getSelectedAreas(layer) {
        const url = layer.url

        const { features } = await getFeature({
          url,
          layer: layer.layer,
          coordinates: this.selectionCoordinates,
        })

        const { area } = this.selectedLayerForSelection.externalApi.propertyMapping

        return features.map(feature => feature.properties[area])
      },

      async handleDownloadClick() {
        let areas

        if (this.drawMode === 'static') {
          areas = this.selectedAreas
        } else if (this.drawMode === 'rectangle') {
          areas = await this.getSelectedAreas(this.selectedLayerForSelection)
        }

        const downloadUrl = this.getDownloadUrl({ ...this.selectedLayerForSelection.externalApi, areas })

        console.log(downloadUrl)

        window.location.href = downloadUrl
      },
    },
  }
</script>

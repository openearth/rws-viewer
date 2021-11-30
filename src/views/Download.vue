<template>
  <v-container class="download">
    <v-row>
      <v-col>
        <h4>Draw</h4>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          :color="drawMode === 'rectangle' ? 'primary' : null"
          block
          :ripple="false"
          @click="onDrawModeSelect('rectangle')"
        >
          Draw rectangle
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          :color="drawMode === 'polygon' ? 'primary' : null"
          block
          :ripple="false"
          @click="onDrawModeSelect('polygon')"
        >
          Draw polygon
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select
          v-model="selectedArea"
          label="Use predefined selection"
          :items="preDefinedAreas"
          item-text="properties.mpnomsch"
          item-value="id"
          dense
          outlined
          hide-details
          @change="onAreaSelection"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h4>Download</h4>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select
          v-model="selectedLayer"
          label="Selecteer uit zichtbare lagen"
          :items="selectedLayersList"
          dense
          outlined
          hide-details
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          color="primary"
          block
          :ripple="false"
          :disabled="!selectedLayer"
          @click="onDownloadClick"
        >
          {{ $t('downloadLayer') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import metaRepo from '~/repo/metaRepo'
  import buildDownloadUrl from '~/lib/build-download-url'

  const NO_SELECTION_ID = 'NO_SELECTION_ID'

  export default {
    data: () => ({
      preDefinedAreas: [],
      selectedArea: null,
      selectedLayer: null,
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeature', 'rasterLayers' ]),
      ...mapGetters('data', [ 'selectedLayers' ]),

      downloadButtonLabel() {
        return (this.drawnFeature || this.selectedArea) ? this.$t('downloadSelection') : this.$t('downloadLayer')
      },

      selectedLayersList() {
        return this.selectedLayers.map(layer => ({
          text: layer.name,
          value: layer.id,
        }))
      },

      selectedLayerData() {
        return this.selectedLayers.find(layer => layer.id === this.selectedLayer)
      },

      selectionData() {
        return this.rasterLayers.find(layer => layer.id === this.selectedLayer)
      },

      drawnFeatureCoordinates() {
        return this.drawnFeature?.geometry?.coordinates
          ? Array.from(this.drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
          : []
      },

      selectionCoordinates() {
        return this.drawnFeatureCoordinates.toString().replace(/,/g, ' ')
      },
    },

    created() {
      metaRepo
        .getPredefinedAreas()
        .then(areas => {
          const noSelectionObj = {
            id: NO_SELECTION_ID,
            properties: { mpnomsch: 'No selection' },
          }
          this.preDefinedAreas = Object.freeze([ noSelectionObj, ...areas ])
        })
        .catch(err => {
          console.error('Error getting predefined selections', err)
        })
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'setDrawnFeature', 'clearDrawnFeature' ]),

      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        await this.clearDrawnFeature()
        this.selectedArea = null
        this.setDrawMode({ mode })
      },

      onAreaSelection(id) {
        this.setDrawMode({ mode: null })
        if (id === NO_SELECTION_ID) {
          this.clearDrawnFeature()
          return
        }
        const feature = this.preDefinedAreas.find(area => area.id === id)
        this.setDrawnFeature(feature)
      },

      onDownloadClick() {
        const url = buildDownloadUrl(this.selectedLayerData, this.selectionCoordinates)
        window.location.href = url
      },
    },
  }
</script>

<template>
  <v-container class="download pt-4">
    <template v-if="!downloadAvailable && !selectedLayersList.length">
      <v-row>
        <v-col>
          <p>{{ $t('noLayersSelected') }}</p>
        </v-col>
      </v-row>
    </template>
    <template v-if="!downloadAvailable && selectedLayersList.length">
      <v-row>
        <v-col>
          <p>{{ $t('downloadUnavailable') }}</p>
        </v-col>
      </v-row>
    </template>
    <template v-if="downloadAvailable && selectedLayersList.length">
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
            :color="drawMode === 'rectangle' ? 'primary' : null"
            block
            :ripple="false"
            @click="onDrawModeSelect('rectangle')"
          >
            {{ $t('drawRectangle') }}
          </v-btn>
        </v-col>
        <v-col>
          <v-btn
            :color="drawMode === 'polygon' ? 'primary' : null"
            block
            :ripple="false"
            @click="onDrawModeSelect('polygon')"
          >
            {{ $t('drawPolygon') }}
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="selectedArea"
            :label="$t('predefinedSelection')"
            :items="formattedAreas"
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
          <v-divider class="my-4" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <h3>{{ $t('download') }}</h3>
          <p class="body-2 mb-0">
            {{ $t('downloadDesc') }}
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="selectedLayer"
            :label="$t('layerSelection')"
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
            {{ $t('downloadData') }}
          </v-btn>
        </v-col>
      </v-row>
    </template>
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
      ...mapGetters('data', [ 'selectedLayers', 'downloadAvailable' ]),

      drawnFeatureCoordinates() {
        return this.drawnFeature?.geometry?.coordinates
          ? Array.from(this.drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
          : []
      },

      formattedAreas() {
        const noSelectionObj = {
          id: NO_SELECTION_ID,
          properties: { mpnomsch: this.$t('noSelection') },
        }

        return Object.freeze([ noSelectionObj, ...this.preDefinedAreas ])
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

      selectionCoordinates() {
        return this.drawnFeatureCoordinates.toString().replace(/,/g, ' ')
      },
    },

    created() {
      metaRepo
        .getPredefinedAreas()
        .then(areas => this.preDefinedAreas = areas)
        .catch(err => console.error('Error getting predefined selections', err))
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

<template>
  <v-container class="download pt-4">
    <v-row>
      <v-col>
        <h3>{{ $t('select') }}</h3>
        <p class="body-2">
          {{ $t('selectDesc') }}
        </p>

        <p class="body-2 mb-0">
          <v-icon>mdi-information-outline</v-icon> {{ $t('apiWarning') }}
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

    <template v-if="availableFiltersForSelectedLayer.length">
      <v-divider class="my-4" />

      <v-row>
        <v-col>
          <h3 class="pb-3">
            {{ $t('filters') }}
          </h3>

          <p v-if="!selectedFilters || !selectedFilters.length" class="body-2">
            {{ $t('noFilterSelected') }}
          </p>

          <key-value-filter
            :filters="availableFiltersForSelectedLayer"
            :date-filters="dateFilters"
            @change="handleFilterChange" />
        </v-col>
      </v-row>
    </template>

    <v-divider class="my-4" />

    <v-btn
      color="primary"
      block
      :disabled="isDownloading || !drawnFeatures.length"
      :loading="isDownloading"
      @click="handleDownloadClick"
    >
      {{ $t('download') }}
    </v-btn>
  </v-container>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import KeyValueFilter from '~/components/KeyValueFilter/KeyValueFilter'
  import { downloadFromUrl, generateDownloadUrl } from '~/lib/external-api'
  import getFeature from '~/lib/get-feature'
  import _ from 'lodash'

  export default {
    components: { KeyValueFilter },
    data: () => ({
      selectedLayerId: null,
      isDownloading: false,
      selectedFilters: null,
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

      drawnFeatureCoordinates() {
        const drawnFeature = this.drawnFeatures[0]

        return drawnFeature?.geometry?.coordinates
          ? Array.from(drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
          : []
      },

      selectionCoordinates() {
        return this.drawnFeatureCoordinates.toString().replace(/,/g, ' ')
      },

      availableFiltersForSelectedLayer() {
        if (this.selectedLayerForSelection?.externalApi.filters) {
          const filters = this.selectedLayerForSelection.externalApi.filters.split(', ')
          return filters.concat(this.dateFilters)
        }

        return []
      },
      dateFilters() {
        if (this.selectedLayerForSelection?.externalApi.dateFilters) {
          return this.selectedLayerForSelection.externalApi.dateFilters.split(', ')
        }
        return []
      },
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'clearDrawnFeatures', 'setSelectedLayerForSelection' ]),

      getDownloadUrl({ url, filters }) {
        return generateDownloadUrl({ url, filters })
      },

      handleSelectionLayerSelect(id) {
        this.setSelectedLayerForSelection(this.activeLayers.find(layer => layer.id === id))
        this.selectedFilters = null

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

        const { layerAttributeArea } = this.selectedLayerForSelection.externalApi.propertyMapping

        return features.map(feature => feature.properties[layerAttributeArea])
      },

      handleFilterChange(value) {
        this.selectedFilters = value
      },

      async handleDownloadClick() {
        const { externalApi } = this.selectedLayerForSelection
        let areas

        if (this.drawMode === 'static') {
          // when drawmode is we can use selectedAreas (derived from the drawnFeatures) directly
          areas = this.selectedAreas
        } else if (this.drawMode === 'rectangle') {
          // if the user has drawn a rectangle, we need to fetch the areas in the rectangle first
          areas = await this.getSelectedAreas(this.selectedLayerForSelection)
        }

        const { area, geojson } = externalApi.propertyMapping

        let areaFilter = {}
        if (area) {
          // compose a filter definition in the format of KeyValueFilter
          areaFilter = {
            name: area,
            comparer: 'in',
            value: `[${ areas.map(area => `"${ area }"`).join(',') }]`,
          }
        } else if (geojson) {
          areaFilter = {
            name: geojson,
            comparer: 'geojson',
            value: JSON.stringify(this.drawnFeatures[0]),
          }
        }


        // generate download url containing the area filter + configured filters
        const downloadUrl = this.getDownloadUrl({ ...externalApi, filters: [
          areaFilter,
          ...(this.selectedFilters || []),
        ] })

        this.isDownloading = true
        console.log(downloadUrl, this.drawnFeatures[0])

        downloadFromUrl({
          url: downloadUrl,
          apiKey: process.env[externalApi.apiKey],
        }).finally(() => {
          this.isDownloading = false
        })
      },
    },
  }
</script>

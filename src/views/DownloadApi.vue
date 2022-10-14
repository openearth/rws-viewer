<template>
  <v-container class="download pt-4">
    <v-row>
      <v-col>
        <h3>{{ $t('select') }}</h3>
        <p class="body-2">
          {{ $t('selectDesc') }}
        </p>

        <p v-if="maxPageSize" class="body-2 mb-0">
          <v-icon>mdi-information-outline</v-icon> {{ $t('apiWarning', {maxPageSize}) }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select
          v-model="selectedApi"
          :label="$t('chooseApi')"
          :items="activeLayers"
          item-text="name"
          item-value="id"
          dense
          outlined
          hide-details
          return-object
        />
      </v-col>
    </v-row>
    <v-row v-if="selectedApi">
      <v-col>
        <v-select
          :value="selectedLayerForSelection && selectedLayerForSelection.id"
          :label="$t('chooseLayer')"
          :items="apisLayers"
          item-text="name"
          item-value="id"
          dense
          outlined
          hide-details
          @change="handleSelectionLayerSelect"
        />
      </v-col>
    </v-row>
    <v-row v-if="selectedLayerForSelection && selectedLayerForSelection.id">
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
      <v-col v-if="multipleAreas">
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
            :comparers="comparers"
            :date-filters="dateFilters"
            @change="handleFilterChange"
          />
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
    <v-alert
      v-if="requestFailure"
      border="bottom"
      colored-border
      type="warning"
      elevation="2"
    >
      {{ requestFailure }}
    </v-alert>
  </v-container>
</template>

<script>
  import { mapActions, mapGetters, mapState } from 'vuex'
  import KeyValueFilter from '~/components/KeyValueFilter/KeyValueFilter'
  import { downloadFromUrl, generateDownloadUrl } from '~/lib/external-api'
  import getFeature from '~/lib/get-feature'
  import { stringify } from 'wkt'
  import _ from 'lodash'

  export default {
    components: { KeyValueFilter },
    data: () => ({
      selectedLayerId: null,
      isDownloading: false,
      selectedFilters: null,
      comparers: Object.freeze([
        'eq',
        'ne',
        'lt',
        'le',
        'ge',
        'gt',
        'in',
        'notin',
        'like',
        'startswith',
        'endswith',
      ]),
      requestFailure: false,
      selectedApi: null,
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeatures', 'activeFlattenedLayerIds', 'activeFlattenedLayers', 'selectedLayerForSelection' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
      ...mapState('data', [ 'apis' ]),

      maxPageSize() {
        return _.get(this.selectedApi, 'maxPageSize')
      },

      activeLayers() {
        return this.activeFlattenedLayerIds
          .map(id => this.activeFlattenedLayers.find(layer => layer.id === id))
          .filter(layer => layer?.externalApi)
      },

      activeLayersList() {
        return this.activeLayers.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
      },

      apisLayers() {
        return this.apis.reduce((apisLayers, api) => {
          this.selectedApi.externalApi.forEach(externalApi => {
            if (api.id === externalApi.id) {
              apisLayers.push(...api.layers.map(({ layer }) => {
                return { ...layer }
              }))
            }
          })
          return apisLayers
        }, [])
      },

      selectedLayer() {
        return this.flattenedLayers.find(layer => layer.id === this.selectedLayerId)
      },

      selectedAreas() {
        if (!this.selectedLayer) {
          return []
        }
        const { layerAttributeArea } = _.get(this.selectedApi, 'propertyMapping', {})
        return this.drawnFeatures.map(feature => feature.properties[layerAttributeArea])
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
        if (this.selectedApi?.filters && this.selectedLayer) {
          const filters = this.selectedApi.filters.split(', ')
          return filters.concat(this.dateFilters)
        }

        return []
      },
      dateFilters() {
        if (this.selectedApi?.dateFilters) {
          return this.selectedApi.dateFilters.split(', ')
        }
        return []
      },
      multipleAreas() {
        return _.has( this.selectedApi, 'propertyMapping.areas')
      },
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'clearDrawnFeatures', 'setSelectedLayerForSelection', 'loadLayerOnMap', 'removeLayerFromMap' ]),

      handleSelectionLayerSelect(id) {
        // work in progress
        const selectedLayer = this.apisLayers.find(layer => layer.id === id)

        console.log(selectedLayer)

        this.removeLayerFromMap({ layers: [ selectedLayer ] })
        this.loadLayerOnMap({ layers: [ selectedLayer ] })

        this.setSelectedLayerForSelection(this.selectedApi)
        this.selectedFilters = null
        this.requestFailure = false

        if (this.drawMode === 'static') {
          this.clearDrawnFeatures()
        }
      },

      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        await this.clearDrawnFeatures()
        this.selectedArea = null

        // work in progress
        this.setSelectedLayerForSelection(this.selectedApi)
        this.selectedLayerId = this.selectedApi.id

        this.setDrawMode({ mode })
      },

      async getSelectedAreas(layer) {
        const url = layer.url

        const { features } = await getFeature({
          url,
          layer: layer.layer,
          coordinates: this.selectionCoordinates,
        })

        const { layerAttributeArea } = this.selectedApi.propertyMapping

        return features.map(feature => feature.properties[layerAttributeArea])
      },

      handleFilterChange(value) {
        this.selectedFilters = value
        this.requestFailure = false
      },

      async handleDownloadClick() {
        this.requestFailure = false
        const externalApi = this.selectedApi
        let selectedAreas

        if (this.drawMode === 'static') {
          // when drawmode is we can use selectedAreas (derived from the drawnFeatures) directly
          selectedAreas = this.selectedAreas
        } else if (this.drawMode === 'rectangle') {
          // if the user has drawn a rectangle, we need to fetch the areas in the rectangle first
          selectedAreas = await this.getSelectedAreas(this.selectedLayerForSelection)
        }

        const { area, wkt, areas } = externalApi.propertyMapping
        const { formatCsv, name } = externalApi

        let areaFilter = {}
        
        /* 
        
        TODO: We need to find a solution for SOVON. not more than 
                            
        */
        if (areas) {
          // compose a filter definition in the format of KeyValueFilter
          areaFilter = {
            name: areas,
            comparer: 'in',
            value: `[${ selectedAreas.map(area => `"${ area }"`).join(',') }]`,
          }
        } else if (area) { //TODO: this is not working correct 
          // compose a filter definition in the format of KeyValueFilter
          areaFilter = {
            name: area,
            comparer: 'eq',
            value: selectedAreas[0],
          }
        } else if (wkt) {
          areaFilter = {
            name: wkt,
            comparer: 'wkt',
            value: stringify(this.drawnFeatures[0]),
          }
        }

        let fileExtension = 'json'
        if (formatCsv) {
          fileExtension = 'csv'
        }

        const downloadUrl = generateDownloadUrl({ ...externalApi, filters: [
          areaFilter,
          ...(this.selectedFilters || []),
        ] })

        this.isDownloading = true
        const date = new Date(Date.now())
        const fileName = `${ name }_${ date.toLocaleString() }.${ fileExtension }`

        downloadFromUrl({
          url: downloadUrl,
          apiKey: process.env[externalApi.apiKey],
          formatCsv,
          fileName,
        }).finally((result) => {
          this.isDownloading = false
        }).catch(err => {
          console.log('ERROR', err)
          this.requestFailure = `Request failed: ${ err }`
        })
      },
    },
  }
</script>

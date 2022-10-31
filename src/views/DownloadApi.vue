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
          v-model="selectedLayerToDownloadFrom" 
          :label="$t('chooseApi')"
          :items="activeLayers"
          item-text="name"
          item-value="id"
          dense
          outlined
          hide-details
          return-object
          @change="setAquadeskOpacity"
        />
      </v-col>
    </v-row>
    <v-row v-if="selectedApi">
      <v-col>
        <v-select
          v-model="selectedLayerIdToDownloadWith"
          :value="selectedLayerForSelection && selectedLayerForSelection.id"
          :label="$t('chooseLayer')"
          :items="layersToDownloadWith"
          item-text="name"
          item-value="id"
          dense
          outlined
          hide-details
          @change="handleSelectionLayerSelect"
        />
      </v-col>
    </v-row>
    <!-- <v-row v-if="selectedLayerForSelection && selectedLayerForSelection.id"> -->
    <v-row v-if="selectedApi">
      <v-col>
        <v-btn
          :color="drawMode === 'static' && selectionMode ==='selectFeatures' ? 'primary' : null"
          block
          :ripple="false"
          :disabled="!selectedLayerIdToDownloadWith || selectedLayerIdToDownloadWith === selectedLayerToDownloadFrom.id"
          @click="onDrawModeSelect('static')"
        >
          {{ $t('selectFeatures') }}
        </v-btn>
      </v-col>

      <v-col v-if="selectedApi.name === 'Aquadesk'">
        <v-btn
          :color="drawMode === 'static' && selectionMode ==='selectPoints'? 'primary' : null"
          block
          :ripple="false"
          :disabled="selectionMode ==='selectFeatures'"
          @click="onDrawModeSelectPoints('static')"
        >
          {{ $t('selectPoints') }}
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
      selectedLayerIdToDownloadWith: null,
      selectedLayerToDownloadFrom: null,
      selectionMode: null, //Introduced two select modes for the case of Aquadesk where the user can select also the points from the original layer
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeatures', 'activeFlattenedLayerIds', 'activeFlattenedLayers', 'selectedLayerForSelection' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
      ...mapState('data', [ 'apis' ]),

      maxPageSize() {
        return _.get(this.selectedApi, 'maxPageSize')
      },
      //Active layers to download from. Each layer is connected to one and only API.
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

      layersToDownloadWith() {
        return this.apis.reduce((apisLayers, api) => {
          if (api.id === this.selectedApi.id) {
            apisLayers.push(...api.layers.map(({ layer }) => {
              return { ...layer }
            }))
          }
          return apisLayers
        }, [])
      },

      selectedLayer() {
        return this.flattenedLayers.find(layer => layer.id === this.selectedLayerId)
      },

      selectedApi() {
        if (!this.selectedLayerToDownloadFrom){
          return 
        }
        return this.selectedLayerToDownloadFrom.externalApi[0] //Why is it an array? 
      },

      selectedAreas() {
        if (!this.selectedLayerIdToDownloadWith) {
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
        if (this.selectedApi?.filters) {  
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

    mounted() {
      this.hideActiveLayers()
    },
    updated() {
      this.hideActiveLayers()
    },

    beforeDestroy() {
      this.showActiveLayers()
    },
    deactivated() {
      this.showActiveLayers()
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'clearDrawnFeatures', 'setSelectedLayerForSelection',  'loadApiLayerOnMap', 'removeApiLayerFromMap', 'updateWmsLayerOpacity' ]),
      
      handleSelectionLayerSelect(id) {
        //Layer to be used for areas selections. This layer is provided from the externalApi model.
        const selectedLayer = this.layersToDownloadWith.find(layer => layer.id === id)
        
        
        this.loadApiLayerOnMap(selectedLayer)
    
        
        this.setSelectedLayerForSelection(selectedLayer)
        
        this.selectedFilters = null
        this.requestFailure = false

        if (this.drawMode === 'static') {
          this.clearDrawnFeatures()
        }
      },
      setAquadeskOpacity() {
        this.hideActiveLayers()
        
      },
      async onDrawModeSelectPoints(mode) {
        await this.clearDrawnFeatures()
        this.selectedArea = null
        this.selectedLayerIdToDownloadWith = this.selectedLayerToDownloadFrom.id
        this.selectedLayerId = this.selectedLayerToDownloadFrom.id
        this.setSelectedLayerForSelection(this.selectedLayerToDownloadFrom)
        this.setDrawMode({ mode })
        if (this.selectionMode === 'selectPoints') {
          this.selectionMode = null
        } else {
          this.selectionMode = 'selectPoints'
        }
        
      },
      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        this.selectFeaturesMode
        await this.clearDrawnFeatures()
        this.selectedArea = null
        this.selectedLayerId = this.selectedLayerIdToDownloadWith
        
        this.setDrawMode({ mode })

        if (this.selectionMode === 'selectFeatures') {
          this.selectionMode = null
        } else {
          this.selectionMode = 'selectFeatures'
        }
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
      hideActiveLayers() {
        if (this.selectedLayerToDownloadFrom && _.get(this.selectedLayerToDownloadFrom.externalApi[0], 'name') === 'Aquadesk') {
          this.updateWmsLayerOpacity({ id: this.selectedLayerToDownloadFrom.id, opacity: 1 })
        } else {
          this.activeLayers.forEach(({ id }) => {
            this.updateWmsLayerOpacity({ id, opacity: 0 })
          })
        }
   
      },
      showActiveLayers() {
        if (this.activeLayers.length) {
          this.activeLayers.forEach(({ id }) => {
            this.updateWmsLayerOpacity({ id, opacity: 1 })
          })
        }
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

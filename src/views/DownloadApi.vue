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
          @change="handleVisibilityOfLayers"
        />
      </v-col>
    </v-row>
    <v-divider class="my-4" />
    <div v-if="selectedApi">
      <v-row>
        <v-col cols="6">
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
            :disabled="selectionMode ==='selectPoints' || selectionMode === 'selectRectangle'"
            @change="handleSelectionLayerSelect"
          />
        </v-col>
        <v-col cols="6">
          <v-btn
            :color="selectionMode ==='selectFeatures' ? 'primary' : null"
            block
            :ripple="false"
            :disabled="!selectedLayerIdToDownloadWith || selectedLayerIdToDownloadWith === selectedLayerToDownloadFrom.id 
              || selectionMode ==='selectPoints' || selectionMode === 'selectRectangle'"
            @click="onDrawModeSelect('static')"
          >
            {{ $t('selectFeatures') }}
          </v-btn>
        </v-col>
      </v-row>
      <div v-if="selectedApi.name === 'Aquadesk'">
        <v-subheader>or </v-subheader>
        <v-row v-if="selectedApi">
          <v-col>
            <v-btn
              :color="selectionMode ==='selectPoints' ? 'primary' : null"
              block
              :ripple="false"
              :disabled="selectionMode ==='selectFeatures' || selectionMode === 'selectRectangle'"
              @click="onDrawModeSelectPoints('static')"
            >
              {{ $t('selectPoints') }}
            </v-btn>
          </v-col>
        </v-row>
        
        <v-subheader> or </v-subheader>
        <v-row>
          <v-col v-if="drawRectangle">
            <v-btn
              :color="drawMode === 'rectangle' ? 'primary' : null"
              block
              :ripple="false"
              :disabled="selectionMode ==='selectFeatures' || selectionMode === 'selectPoints'"
              @click="onDrawModeSelect('rectangle')"
            >
              {{ $t('drawRectangle') }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
    </div>
    <template v-if="availableFiltersForSelectedLayer.length">
      <v-divider class="my-4" />
      <v-row>
        <v-col>
          <h3 class="pb-3">
            {{ $t('filtersDownload') }}
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
  /* Sovon and WMR don't offer downloading for multiple areas yet  */
  import { mapActions, mapGetters, mapState } from 'vuex'
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
          .filter(layer => layer?.externalApi.length)
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

      // multipleselection is not allowed
      selectedAreaName() {
        if (!this.selectedLayerIdToDownloadWith) {
          return []
        }
        let { layerAttributeArea } = _.get(this.selectedApi, 'propertyMapping', {})

        return this.drawnFeatures.map(feature => feature.properties[layerAttributeArea])[0]
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
          return this.selectedApi.dateFilters.split(',')
        }
        return []
      },
      drawRectangle() {
        return _.has( this.selectedApi, 'freehandRectangleDrawing')
      },
    },
    watch: {
      selectionMode (val, previousVal) {
        if (previousVal !== 'selectFeatures' && val !== 'selectFeatures'){
          this.removeApiLayerFromMap()
        }
      },
      selectedApi() {
        this.setMultipleSelection(this.selectedApi.pointSelection)
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
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'clearDrawnFeatures', 'setSelectedLayerForSelection',  'loadApiLayerOnMap', 'removeApiLayerFromMap', 'updateWmsLayerOpacity', 'setMultipleSelection' ]),
      selectionCoordinates(features) {
        return features.toString().replace(/,/g, ' ')
      },
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
      handleVisibilityOfLayers() {
        this.selectedLayerIdToDownloadWith = null
        this.removeApiLayerFromMap()
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
      drawnFeatureCoordinates(drawnFeature) {
        
        let featureCoordinates = []
        if (Array.from(drawnFeature?.geometry?.coordinates).length === 2) {
          const coords = Array.from(drawnFeature?.geometry?.coordinates)
          const margin = 0.001
          const minx = coords[0] - margin
          const maxx = coords[0] + margin
          const miny = coords[1] - margin
          const maxy = coords[1] + margin
          featureCoordinates = [ minx, maxy, maxx, maxy, maxx, miny, minx, miny, minx, maxy ]
        } else {
          featureCoordinates = drawnFeature?.geometry?.coordinates
            ? Array.from(drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
            : []
        }

        return featureCoordinates
      },
      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
       
        await this.clearDrawnFeatures()
        this.selectedArea = null
        this.selectedLayerId = this.selectedLayerIdToDownloadWith

        this.setDrawMode({ mode })

        let selectionMode = 'selectFeatures'
        if (mode === 'rectangle') {
          selectionMode = 'selectRectangle'
        }

        if (this.selectionMode === selectionMode) {
          this.selectionMode = null
        } else {
          this.selectionMode = selectionMode
        }
      },

      async getValuesOfFeature(layer, selectedFeatures) { 
        const url = layer.url

        let referenceLayer
        if (layer.downloadLayer) {
          referenceLayer = layer.downloadLayer
        } else {
          referenceLayer = layer.layer
        }
        
        const { features } = await getFeature({
          url,
          layer: referenceLayer,
          coordinates: this.selectionCoordinates(selectedFeatures),
        })
        let { layerAttributeArea, layerAttributePreFilter } = this.selectedApi.propertyMapping
        
        const selectedAreasNamesAll = features.map(feature => feature.properties[layerAttributeArea]) 
        const selectedAreasNames = [ ...new Set(selectedAreasNamesAll) ]
       

        layerAttributePreFilter = layerAttributePreFilter.split(', ') // in case more than one pre-filters are provided
        const preFiltersValuesAll = layerAttributePreFilter.map(filter => {
        
          return features.map(feature => feature.properties[filter])
        })
      
        
        const preFiltersValues = preFiltersValuesAll.map(preFilter => [ ... new Set(preFilter) ][0])

   
        return { selectedAreasNames, preFiltersValues }
      },

      handleFilterChange(value) {
        this.selectedFilters = value
        this.requestFailure = false
      },
      hideActiveLayers() {

        if (this.$route.name != 'download.api') {
          return
        }

        if (this.selectedLayerToDownloadFrom && _.get(this.selectedLayerToDownloadFrom.externalApi[0], 'name') === 'Aquadesk') {

          this.updateWmsLayerOpacity({ id: this.selectedLayerToDownloadFrom.id, opacity: 1 })
          const restActiveFlattenedLayers = this.activeFlattenedLayers.filter(activeLayer => activeLayer.id != this.selectedLayerToDownloadFrom.id)

          restActiveFlattenedLayers.forEach(({ id }) => {
            this.updateWmsLayerOpacity({ id, opacity: 0 })
          })
        } else {
          this.activeFlattenedLayers.forEach(({ id }) => {
            this.updateWmsLayerOpacity({ id, opacity: 0 })
          })
        }

      },
      

      showActiveLayers() {
        if (this.activeFlattenedLayers.length) {
          this.activeFlattenedLayers.forEach(({ id }) => {
            this.updateWmsLayerOpacity({ id, opacity: 1 })
          })
        }
      },
      async handleDownloadClick() {

        this.requestFailure = false
        const externalApi = this.selectedApi
        
        let selectedArea // id of clicked feature to be used in the areaFilter, 
        let selectedAreas = [] // in case of aquadesk we have have multipleAreas
        let preFiltersValues = []// in the case of aquadesk we need to set a default filter for taxontype

        const { apiAttributeArea, apiAttributePreFilter } = externalApi.propertyMapping
     
        const { formatCsv, name } = externalApi
        if (!externalApi.pointSelection) {
          // when drawmode is static and we don't need pre-filter values then we can use selectedAreas 
          //(derived from the drawnFeatures) directly

          //TODO: if in the future these apis offer Multi area selection then loop over the drawnFeatures
          selectedArea = this.selectedAreaName 
         
          
        } else {
          //we need a getFeature request to get the values of the feature
          //the drawnFeature can be either point, multiple points or polygon
      
          for await (const featureValues of this.drawnFeatures.map(drawnFeature => this.getValuesOfFeature(this.selectedLayerToDownloadFrom, this.drawnFeatureCoordinates(drawnFeature)))) {
            selectedAreas = [ ...selectedAreas, _.get(featureValues, 'selectedAreasNames') ].flat()
            preFiltersValues = [ ...preFiltersValues,_.get(featureValues, 'preFiltersValues') ].flat()
            
          }
        }
     
        let areaFilter
        let preFilter = []
  
        // compose a filter definition in the format of KeyValueFilter
        if (selectedArea) {
          areaFilter =  {
            name: apiAttributeArea,
            comparer: 'eq',
            value: selectedArea,
          } 
        } else if (selectedAreas.length) {
          areaFilter =  {
            name: apiAttributeArea,
            comparer: 'in',
            value: `[ ${ selectedAreas.map(area => `"${ area }"`) } ]`,
          } 
        }
        

       
        if (apiAttributePreFilter) {
          const preFiltersArray = apiAttributePreFilter.split(',')
          
          preFilter = preFiltersArray.map((a, ind) => {
            
            // compose a filter definition in the format of KeyValueFilter
            return {
              name: a,
              comparer: 'eq',
              value:  JSON.stringify(preFiltersValues[ind]),
            }
          })
        }
        
 
       
        let fileExtension = 'json'
        if (formatCsv) {
          fileExtension = 'csv'
        }
        const downloadUrl = generateDownloadUrl({ ...externalApi, filters: [
          areaFilter,
          ...(preFilter) && preFilter, //TODO: fix this
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

<style scoped>
.download {
  overflow-y: scroll;
  height: calc(100vh - 176px);
}
</style>

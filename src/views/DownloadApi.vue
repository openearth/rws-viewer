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
            @change="handleSelectionLayerSelect"
          />
        </v-col>
        <v-col cols="6">
          <v-btn
            :color="drawMode === 'static' && selectionMode ==='selectFeatures' ? 'primary' : null"
            block
            :ripple="false"
            :disabled="!selectedLayerIdToDownloadWith || selectedLayerIdToDownloadWith === selectedLayerToDownloadFrom.id || selectionMode ==='selectPoints' || selectionMode === 'selectRectangle'"
            @click="onDrawModeSelect('static')"
          >
            {{ $t('selectFeatures') }}
          </v-btn>
        </v-col>
      </v-row>
      <v-subheader v-if="selectedApi.name === 'Aquadesk'">or </v-subheader>
      <!-- <v-row v-if="selectedLayerForSelection && selectedLayerForSelection.id"> -->
      <v-row v-if="selectedApi">
        <v-col v-if="selectedApi.name === 'Aquadesk'">
          <v-btn
            :color="drawMode === 'static' && selectionMode ==='selectPoints'? 'primary' : null"
            block
            :ripple="false"
            :disabled="selectionMode ==='selectFeatures' || selectionMode === 'selectRectangle'"
            @click="onDrawModeSelectPoints('static')"
          >
            {{ $t('selectPoints') }}
          </v-btn>
        </v-col>
      </v-row>
      <v-subheader v-if="selectedApi.name === 'Aquadesk'">or </v-subheader>
      <v-row>
        <v-col v-if="multipleAreas">
          <v-btn
            :color="drawMode === 'rectangle' ? 'primary' : null"
            block
            :ripple="false"
            @click="onDrawModeSelect('rectangle')"
            :disabled="selectionMode ==='selectFeatures' || selectionMode === 'selectPoints'"
          >
            {{ $t('drawRectangle') }}
          </v-btn>
        </v-col>
      </v-row>
    </div>
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

      selectedAreas() {
        if (!this.selectedLayerIdToDownloadWith) {
          return []
        }
        let { layerAttributeArea } = _.get(this.selectedApi, 'propertyMapping', {})
        layerAttributeArea = layerAttributeArea.split(',')
        return this.drawnFeatures.map(feature => feature.properties[layerAttributeArea])
      },

      drawnFeatureCoordinates() {
        const drawnFeature = this.drawnFeatures[0]
        console.log(drawnFeature)

        return drawnFeature?.geometry?.coordinates
          ? Array.from(drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
          : []
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

      async getSelectedAreas(layer, selectedFeatures) {
        const url = layer.url

        let referenceLayer = layer.layer
        if (_.get(this.selectedLayerToDownloadFrom.externalApi[0], 'name') === 'Aquadesk') {
          referenceLayer = 'wie_ddecoapi:macroinvertebrates_all'
        }

        const { features } = await getFeature({
          url,
          layer: referenceLayer,
          coordinates: this.selectionCoordinates(selectedFeatures),
        })

        let { layerAttributeArea } = this.selectedApi.propertyMapping
        layerAttributeArea = layerAttributeArea.split(', ')
        console.log(layerAttributeArea, features)
        const selectedAreas = layerAttributeArea.map(laa => {
          return features.map(feature => feature.properties[laa])
        })
        console.log(selectedAreas.map(selArea => [... new Set(selArea)]))

        return selectedAreas.map(selArea => [... new Set(selArea)])
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

        let selectedAreas

        if (this.drawMode === 'static' &&  this.selectionMode !== 'selectPoints') {
          // when drawmode is we can use selectedAreas (derived from the drawnFeatures) directly
          selectedAreas = [this.selectedAreas]
          if ( _.get(this.selectedLayerToDownloadFrom.externalApi[0], 'name') === 'Aquadesk') {
            console.log(this.drawnFeatureCoordinates)
            selectedAreas = await this.getSelectedAreas(this.selectedLayerToDownloadFrom, this.drawnFeatureCoordinates)
          }
        } else if (this.drawMode === 'rectangle' || this.selectionMode === 'selectPoints') {
          // if the user has drawn a rectangle, we need to fetch the areas in the rectangle first
          selectedAreas = await this.getSelectedAreas(this.selectedLayerToDownloadFrom, this.drawnFeatureCoordinates)
        }
        console.log(selectedAreas)

        const { area, wkt, areas } = externalApi.propertyMapping
        const { formatCsv, name } = externalApi

        let areaFilter = {}

        /*

        TODO: We need to find a solution for SOVON. not more than

        */

        if (areas) {
          const areaArray = areas.split(', ')
          areaFilter = areaArray.map((a, ind) => {
            // compose a filter definition in the format of KeyValueFilter
            return {
              name: a,
              comparer: 'in',
              value: `[${ selectedAreas[ind].map(sa => `"${ sa }"`).join(',') }]`,
            }
          })
        } else if (area) { //TODO: this is not working correct
          // compose a filter definition in the format of KeyValueFilter
          areaFilter = [{
            name: area,
            comparer: 'eq',
            value: selectedAreas[0][0],
          }]
        } else if (wkt) {
          areaFilter = [{
            name: wkt,
            comparer: 'wkt',
            value: stringify(this.drawnFeatures[0]),
          }]
        }

        let fileExtension = 'json'
        if (formatCsv) {
          fileExtension = 'csv'
        }
        const downloadUrl = generateDownloadUrl({ ...externalApi, filters: [
          ...areaFilter,
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

<template>
  <v-container class="download pt-4">
    <v-row>
      <v-col>
        <h3>{{ $t('select') }}</h3>
        <p class="body-2">
          {{ $t('selectDesc') }}
        </p>
        <p v-if="maxPageSize" class="body-2 mb-0">
          <v-icon>mdi-information-outline</v-icon> {{ $t('apiWarning', { maxPageSize }) }}
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
            :disabled="selectionMode === 'selectPoints' || selectionMode === 'selectRectangle'"
            @change="handleSelectionLayerSelect"
          />
        </v-col>
        <v-col cols="6">
          <v-btn
            :color="selectionMode === 'selectFeatures' ? 'primary' : null"
            block
            :ripple="false"
            :disabled="!selectedLayerIdToDownloadWith || selectedLayerIdToDownloadWith === selectedLayerToDownloadFrom.id
              || selectionMode === 'selectPoints' || selectionMode === 'selectRectangle'"
            @click="onDrawModeSelect('static')"
          >
            {{ $t('selectFeatures') }}
          </v-btn>
        </v-col>
      </v-row>
      <div v-if="selectedApi.pointSelection">
        <v-subheader>or </v-subheader>
        <v-row v-if="selectedApi">
          <v-col>
            <v-btn
              :color="selectionMode === 'selectPoints' ? 'primary' : null"
              block
              :ripple="false"
              :disabled="selectionMode === 'selectFeatures' || selectionMode === 'selectRectangle'"
              @click="onDrawModeSelectPoints('static')"
            >
              {{ $t('selectPoints') }}
            </v-btn>
          </v-col>
        </v-row>
      </div>
      <div v-if="selectedApi.freehandRectangleDrawing">
        <v-subheader> or </v-subheader>
        <v-row>
          <v-col v-if="drawRectangle">
            <v-btn
              :color="drawMode === 'rectangle' ? 'primary' : null"
              block
              :ripple="false"
              :disabled="selectionMode === 'selectFeatures' || selectionMode === 'selectPoints'"
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
          <beacon-api
            v-if="isBeaconApi"
            ref="beaconApi"
            :available-columns="availableColumns"
            :filters="availableFiltersForSelectedLayer"
            :date-filters="dateFilters"
            :drawn-features="drawnFeatures"
            :external-api="selectedApi"
            @change="handleFilterChange"
            @columns-change="handleColumnChange"
            @downloading="isDownloading = $event"
            @error="requestFailure = $event"
            @download-success="requestFailure = false"
          />

          <url-api
            v-else
            ref="urlApi"
            :filters="availableFiltersForSelectedLayer"
            :date-filters="dateFilters"
            :external-api="selectedApi"
            :selected-filters="selectedFilters"
            :drawn-features="drawnFeatures"
            :selected-area-name="selectedAreaName"
            :selected-layer-to-download-from="selectedLayerToDownloadFrom"
            @change="handleFilterChange"
            @downloading="isDownloading = $event"
            @error="requestFailure = $event"
            @download-success="requestFailure = false"
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
  import UrlApi from '~/components/UrlApi/UrlApi'
  import BeaconApi from '~/components/BeaconApi/BeaconApi'
  import _ from 'lodash'

  export default {
    components: { UrlApi, BeaconApi },
    data: () => ({
      selectedLayerId: null,
      isDownloading: false,
      selectedFilters: null,
      selectedColumns: [], // For Beacon API column selection
      requestFailure: false,
      selectedLayerIdToDownloadWith: null,
      selectedLayerToDownloadFrom: null,
      selectionMode: null, //Introduced two select modes for the case of AquaDesk where the user can select also the points from the original layer
    }),
    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeatures', 'activeFlattenedLayerIds', 'activeFlattenedLayers', 'selectedLayerForSelection' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
      ...mapState('data', [ 'apis' ]),

      maxPageSize() {
        return _.get(this.selectedApi, 'maxPageSize')
      },

      // Beacon API detection
      isBeaconApi() {
        return this.selectedApi?.requestType === 'beacon'
      },

      // Available columns for Beacon API
        
      availableColumns() {
        if (!this.isBeaconApi) {
          return []
        }
       
        const queryParameters = this.selectedApi.queryParameters.split(',').map(param => param.trim())
        return queryParameters.map(param => ({
          text: param,
          value: param,
        }))
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
        if (!this.selectedLayerToDownloadFrom) {
          return
        }
        return this.selectedLayerToDownloadFrom.externalApi[0]
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
        return _.has(this.selectedApi, 'freehandRectangleDrawing')
      },
    },
    watch: {
      selectionMode(val, previousVal) {
        if (previousVal !== 'selectFeatures' && val !== 'selectFeatures') {
          this.removeApiLayerFromMap()
        }
      },
      selectedApi(newApi) {
        if (newApi) {
          this.setMultipleSelection(newApi.pointSelection)
          
          // Set default columns for Beacon API
          if (newApi.requestType === 'beacon') {
            const params = newApi.queryParameters || []
            this.selectedColumns = params.slice(0, Math.min(4, params.length))
          } else {
            this.selectedColumns = []
          }
        }
      },
      selectedLayerToDownloadFrom() {
        // Ensure layer visibility is updated when the selected layer changes
        this.$nextTick(() => {
          this.hideActiveLayers()
        })
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
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'clearDrawnFeatures', 'setSelectedLayerForSelection', 'loadApiLayerOnMap', 'removeApiLayerFromMap', 'updateWmsLayerOpacity', 'setMultipleSelection' ]),
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


      handleFilterChange(value) {
        this.selectedFilters = value
        this.requestFailure = false
      },

      handleColumnChange(columns) {
        this.selectedColumns = columns
      },
      hideActiveLayers() {

        if (this.$route.name != 'download.api') {
          return
        }

        // Always show the selected layer so users can see what they're downloading from
        if (this.selectedLayerToDownloadFrom) {
          this.updateWmsLayerOpacity({ id: this.selectedLayerToDownloadFrom.id, opacity: 1 })
          const restActiveFlattenedLayers = this.activeFlattenedLayers.filter(activeLayer => activeLayer.id != this.selectedLayerToDownloadFrom.id)

          restActiveFlattenedLayers.forEach(({ id }) => {
            this.updateWmsLayerOpacity({ id, opacity: 0 })
          })
        } else {
          // If no layer is selected, hide all layers
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
        
        if (this.isBeaconApi) {
          // Will be handled by BeaconApi component
          if (this.$refs.beaconApi) {
            await this.$refs.beaconApi.download()
          }
        } else {
          // Handled by UrlApi component
          if (this.$refs.urlApi) {
            await this.$refs.urlApi.download()
          }
        }
      },
    },
  }
</script>


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
          v-model="selectedLayersToDownloadFrom"
          :label="$t('chooseApi')"
          :items="activeLayers"
          item-text="name"
          item-value="id"
          dense
          outlined
          hide-details
          multiple
          chips
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
            :disabled="!selectedLayerIdToDownloadWith || (selectedLayersToDownloadFrom.length > 0 && selectedLayersToDownloadFrom.some(layer => layer.id === selectedLayerIdToDownloadWith))
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
            ref="beaconApi"
            :filters="availableFiltersForSelectedLayer"
            :date-filters="dateFilters"
            :drawn-features="drawnFeatures"
            :external-api="selectedApi"
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
  import BeaconApi from '~/components/BeaconApi/BeaconApi'
  import downloadApiMixin from '~/mixins/downloadApiMixin'
  import _ from 'lodash'

  export default {
    mixins: [ downloadApiMixin ],
    components: { BeaconApi },
    data() {
      return {
        selectedLayersToDownloadFrom: [], // Array for multiple selection
      }
    },
    computed: {
      // Filter to only show beacon APIs
      activeLayers() {
        return this.activeFlattenedLayerIds
          .map(id => this.activeFlattenedLayers.find(layer => layer.id === id))
          .filter(layer => {
            if (!layer?.externalApi.length) {
              return false
            }
            // Only show layers with beacon APIs
            return layer.externalApi.some(api => api.requestType === 'beacon')
          })
      },

      maxPageSize() {
        // Get maxPageSize from first selected API
        return _.get(this.selectedApi, 'maxPageSize')
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

      // Use first selected layer's API for compatibility with existing logic
      selectedApi() {
        if (!this.selectedLayersToDownloadFrom || this.selectedLayersToDownloadFrom.length === 0) {
          return
        }
        // Use the first selected layer's API
        return this.selectedLayersToDownloadFrom[0].externalApi[0]
      },

      // For compatibility, use first selected layer
      selectedLayerToDownloadFrom() {
        if (!this.selectedLayersToDownloadFrom || this.selectedLayersToDownloadFrom.length === 0) {
          return null
        }
        return this.selectedLayersToDownloadFrom[0]
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
    },
    watch: {
      selectedLayersToDownloadFrom() {
        // Ensure layer visibility is updated when the selected layers change
        this.$nextTick(() => {
          this.hideActiveLayers()
        })
      },
    },
    methods: {
      hideActiveLayers() {
        if (this.$route.name !== 'download.beaconapi') {
          return
        }

        // Show all selected layers
        if (this.selectedLayersToDownloadFrom && this.selectedLayersToDownloadFrom.length > 0) {
          // Show all selected layers
          this.selectedLayersToDownloadFrom.forEach(layer => {
            this.updateWmsLayerOpacity({ id: layer.id, opacity: 1 })
          })
          
          // Hide all other active layers
          const selectedLayerIds = this.selectedLayersToDownloadFrom.map(l => l.id)
          const restActiveFlattenedLayers = this.activeFlattenedLayers.filter(
            activeLayer => !selectedLayerIds.includes(activeLayer.id)
          )

          restActiveFlattenedLayers.forEach(({ id }) => {
            this.updateWmsLayerOpacity({ id, opacity: 0 })
          })
        } else {
          // If no layers are selected, hide all layers
          this.activeFlattenedLayers.forEach(({ id }) => {
            this.updateWmsLayerOpacity({ id, opacity: 0 })
          })
        }
      },

      async onDrawModeSelectPoints(mode) {
        await this.clearDrawnFeatures()
        this.selectedArea = null
        
        // Use first selected layer for point selection
        if (this.selectedLayersToDownloadFrom && this.selectedLayersToDownloadFrom.length > 0) {
          const firstLayer = this.selectedLayersToDownloadFrom[0]
          this.selectedLayerIdToDownloadWith = firstLayer.id
          this.selectedLayerId = firstLayer.id
          this.setSelectedLayerForSelection(firstLayer)
        }
        
        this.setDrawMode({ mode })

        if (this.selectionMode === 'selectPoints') {
          this.selectionMode = null
        } else {
          this.selectionMode = 'selectPoints'
        }
      },

      async handleDownloadClick() {
        this.requestFailure = false
        
        // Handled by BeaconApi component
        if (this.$refs.beaconApi) {
          await this.$refs.beaconApi.download()
        }
      },
    },
  }
</script>


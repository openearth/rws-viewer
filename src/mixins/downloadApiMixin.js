import { mapActions, mapGetters, mapState } from 'vuex'
import _ from 'lodash'

export default {
  data() {
    return {
      selectedLayerId: null,
      isDownloading: false,
      selectedFilters: null,
      requestFailure: false,
      selectedLayerIdToDownloadWith: null,
      selectionMode: null, // Introduced two select modes for the case of AquaDesk where the user can select also the points from the original layer
    }
  },
  computed: {
    ...mapGetters('map', [ 'drawMode', 'drawnFeatures', 'activeFlattenedLayerIds', 'activeFlattenedLayers', 'selectedLayerForSelection' ]),
    ...mapGetters('data', [ 'flattenedLayers' ]),
    ...mapState('data', [ 'apis' ]),

    // Active layers to download from. Each layer is connected to one and only API.
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

    selectedLayer() {
      return this.flattenedLayers.find(layer => layer.id === this.selectedLayerId)
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
      }
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
      // Layer to be used for areas selections. This layer is provided from the externalApi model.
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
    
    hideActiveLayers() {
      // This method should be overridden in child components to check the correct route
      // For now, it's a base implementation that can be extended
    },

    showActiveLayers() {
      if (this.activeFlattenedLayers.length) {
        this.activeFlattenedLayers.forEach(({ id }) => {
          this.updateWmsLayerOpacity({ id, opacity: 1 })
        })
      }
    },
  },
}


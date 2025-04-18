<template>
  <v-container class="download pt-4">
    <v-row v-if="!downloadIsAvailable && activeLayersList.length">
      <v-col>
        <v-alert
          dense
          outlined
          type="error"
        >
          {{ $t('downloadUnavailable') }}
        </v-alert>
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
          v-model="downloadLayer"
          :label="$t('layerSelection')"
          :items="activeLayersList"
          dense
          outlined
          hide-details
          @change="getAttributesToFilter"
        />
        <transition name="fade" mode="out-in">
          <v-alert
            v-if="!validUrl && downloadLayer"
            class="mt-2 mb-0"
            dense
            outlined
            type="error"
          >
            {{ $t('preventDownload') }}
          </v-alert>
        </transition>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-divider class="my-4" />
      </v-col>
    </v-row>
    <template v-if="activeLayersList.length">
      <v-row>
        <v-col>
          <h3>{{ $t('select') }}</h3>
          <p class="body-2 mb-0">
            {{ $t('selectAreasDesc') }}
          </p>
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
            v-if="!isRasterLayer"
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
          <v-divider class="my-4" />
        </v-col>
      </v-row>
      
      <template v-if="downloadLayer">
        <v-row>
          <v-col>
            <h3>{{ $t('formats') }}</h3>
            <p class="body-2 mb-0">
              {{ $t('formatsDesc') }}
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <download-format-chooser
              v-if="layerCapabilities"
              v-model="downloadLayerFormat"
              :layer="selectedLayerData"
              :layer-capabilities="layerCapabilities"
            />
          </v-col>
        </v-row>
      </template>
      <template v-if="downloadLayer">
        <v-row>
          <v-col>
            <h3 class="pb-0">
              {{ $t('filtersDownload') }}
            </h3>
            <p class="body-2 pb-1">
              {{ $t('filtersDownloadDesc') }}
            </p>
            <key-value-filter
              :filters="availableFiltersForSelectedLayer"
              :comparers="comparers"
              :validate-values="true"
              @change="handleFilterChange"
            />
          </v-col>
        </v-row>
      </template>
      <v-row>
        <v-col>
          <v-btn
            color="primary"
            block
            :ripple="false"
            :disabled="!downloadLayer || !downloadLayerFormat || isGeneratingDownload || !validUrl"
            :loading="isGeneratingDownload"
            @click="onDownloadClick"
          >
            {{ buttonText }}
            <template #loader>
              <span>{{ $t('preparingDownload') }}</span>
            </template>
          </v-btn>
          <transition name="fade">
            <v-alert
              v-if="downloadLayer && validUrl"
              class="mt-2 mb-0"
              dense
              outlined
              type="info"
            >
              {{ $t('downloadNotice') }}
            </v-alert>
          </transition>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>

  import { saveAs } from 'file-saver'
  import JSZip from 'jszip'
  import JSZipUtils from 'jszip-utils'
  import { mapActions, mapGetters } from 'vuex'
  import KeyValueFilter from '~/components/KeyValueFilter/KeyValueFilter'
  import DownloadFormatChooser from '~/components/DownloadFormatChooser/DownloadFormatChooser.vue'
  import metaRepo from '~/repo/metaRepo'
  import buildDownloadUrl from '~/lib/build-download-url'
  import { describeFeatureType, readFeatureProperties } from '~/lib/wfs-filter-helpers'
  import { isRasterLayer, getDataServicesCapabilities } from '~/lib/get-capabilities'

  //import only for test

  const NO_SELECTION_ID = 'NO_SELECTION_ID'

  export default {
    components: { DownloadFormatChooser, KeyValueFilter },

    data: () => ({
      selectedLayer: null,
      downloadLayerFormat: null,
      downloadLayer: null,
      isGeneratingDownload: false,
      preDefinedAreas: [],
      selectedArea: null,
      availableFiltersForSelectedLayer: [],
      selectedFilters: [],
      layerCapabilities: null,
      comparers: [ '=', '<>', '<', '>', '<=', '>=', 'Like', 'Between' ],
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeatures', 'activeFlattenedLayerIds', 'activeFlattenedLayers' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),

      validUrl() {
        if (!this.selectedLayerData) {
          return
        }
        return Boolean(this.selectedLayerData.downloadUrl) || Boolean(this.selectedLayerData.url)
      },

      buttonText() {
        return this.selectedArea
          ? this.$tc('downloadDataSection', this.downloadLayer)
          : this.$tc('downloadData', this.downloadLayer)
      },

      drawnFeatureCoordinates() {
        const drawnFeature = this.drawnFeatures[0]

        return drawnFeature?.geometry?.coordinates
          ? Array.from(drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
          : []
      },

      downloadIsAvailable() {
        return this.activeFlattenedLayers.some(layer => Boolean(layer.downloadUrl) || Boolean(layer.url))
      },

      formattedAreas() {
        const noSelectionObj = {
          id: NO_SELECTION_ID,
          properties: { mpnomsch: this.$t('noSelection') },
        }

        return Object.freeze([ noSelectionObj, ...this.preDefinedAreas ])
      },

      activeLayersList() {
        return this.activeFlattenedLayers.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
      },

      selectedLayerData() {
        return this.activeFlattenedLayers.find(layer => layer.id === this.downloadLayer)
      },

      selectionCoordinates() {
        return this.drawnFeatureCoordinates.toString().replace(/,/g, ' ')
      },

      isRasterLayer() {
        if (!this.layerCapabilities) {
          return false
        }

        return isRasterLayer(
          this.selectedLayerData.serviceType,
          this.layerCapabilities,
          this.selectedLayerData.layer,
        )
      },
    },

    watch: {
      activeFlattenedLayerIds(val, oldVal) {
        if (val !== oldVal) {
          // if activeFlattenedLayerIds change, reset selected layers in dropdown.
          this.downloadLayer = null
        }
      },
      downloadLayer(val) {
        if (val) {
          this.reloadCapabilities()
        }
      },
    },
    created() {
      metaRepo
        .getPredefinedAreas()
        .then(areas => {
          this.preDefinedAreas = areas
        })
        .catch(err => console.error('Error getting predefined selections', err))
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'clearDrawnFeatures', 'setSelectedLayerForSelection' ]),

      reloadCapabilities() {
        const serviceUrl = this.selectedLayerData.downloadUrl || this.selectedLayerData.url
        const serviceType = this.selectedLayerData.serviceType
        this.layerCapabilities = null
        getDataServicesCapabilities(serviceUrl, serviceType).then(capabilities => {
          this.layerCapabilities = Object.freeze(capabilities)
        })
      },

      getLayerNameById(id) {
        const layer = this.flattenedLayers.find(layer => layer.id === id)
        return layer?.name
      },

      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        await this.clearDrawnFeatures()
        this.selectedArea = null

        this.setDrawMode({ mode })
      },

      onAreaSelection(id) {
        this.setDrawMode({ mode: null })

        if (id === NO_SELECTION_ID) {
          this.clearDrawnFeatures()
          return
        }

        const feature = this.preDefinedAreas.find(area => area.id === id)
        this.clearDrawnFeatures()
        this.addDrawnFeature(feature)
      },
      async generateZipFile(urls) {
        let zip = new JSZip()
        return Promise.all(urls.map(async ({ url, fileType }) => {
          
   
          let layerName = this.getLayerName()
          
          const filename = `${ layerName }.${ fileType }`
          
          return JSZipUtils.getBinaryContent(url)
            .then(data => zip.file(filename, data, { binary: true }))
            .catch(err => console.log(err))
        }))
          .then(() => zip.generateAsync({ type: 'blob' }))
      },  
      onDownloadClick() {
        //this was urls before
        const downloadProps = buildDownloadUrl({
          layer: this.selectedLayerData,
          filters: this.selectedFilters,
          format: this.downloadLayerFormat,
          coordinates: this.selectionCoordinates,
        })
       
        this.isGeneratingDownload = true

        this.generateZipFile(downloadProps) 
          .then((content) => {
            this.$trackEvent('download', 'geoServer')
            const layerName = this.getLayerName() 
            saveAs(content, layerName)
          })
          .catch(err => {
            console.log(err)
          })
          .finally(()=>{
            this.isGeneratingDownload = false
          })
       
      },
      handleFilterChange(event) {
        this.selectedFilters = event
      },
      async getAttributesToFilter() {

        const { serviceType, url, layer, downloadLayer } = this.selectedLayerData
        const layerName = downloadLayer ? downloadLayer : layer
        if (serviceType === 'wfs') {
          const response = await describeFeatureType({
            url,
            layer: layerName,
          })
          this.availableFiltersForSelectedLayer = readFeatureProperties(response)
        }

      },
      getLayerName() {        
        let layerName = this.selectedLayerData.name.split(' ').join('_')
        layerName =  layerName.replace(/[^\w\d-]/g, "_")
        return layerName
      }
    },
  }
</script>

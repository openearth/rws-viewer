<template>
  <v-container class="download pt-4">
    <v-row v-if="!downloadIsAvailable && !activeLayersList.length">
      <v-col>
        <v-alert
          dense
          outlined
          type="info"
        >
          {{ $t('noLayersSelected') }}
        </v-alert>
      </v-col>
    </v-row>
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
    <template v-if="downloadIsAvailable && activeLayersList.length">
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
            :color="drawMode === 'polygon' ? 'primary' : null"
            block
            :ripple="false"
            @click="onDrawModeSelect('polygon')"
          >
            {{ $t('drawPolygon') }}
          </v-btn>
        </v-col>
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
      </v-row>
      <v-row v-if="drawMode === 'static'">
        <v-col>
          <v-select
            v-model="selectedLayer"
            :label="$t('chooseLayer')"
            :items="activeLayersList"
            dense
            outlined
            hide-details
            @change="handleSelectionLayerSelect"
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
            v-model="downloadLayers"
            :label="$t('layerSelection')"
            :items="activeLayersList"
            dense
            multiple
            outlined
            hide-details
          />
          <transition name="fade" mode="out-in">
            <v-alert
              v-if="!allUrlsAreValid"
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
      <template v-if="downloadLayers.length">
        <v-row>
          <v-col>
            <h4>{{ $t('formats') }}</h4>
            <p class="body-2 mb-0">
              {{ $t('formatsDesc') }}
            </p>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <download-format-chooser
              v-for="(id, index) in downloadLayers"
              :key="id"
              v-model="downloadLayersFormats[index]"
              :layer-id="id"
            />
          </v-col>
        </v-row>
      </template>
      <v-row>
        <v-col>
          <v-divider class="my-4" />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            color="primary"
            block
            :ripple="false"
            :disabled="!downloadLayers.length || isGeneratingDownload || !allUrlsAreValid"
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
              v-if="downloadLayers.length && allUrlsAreValid"
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
  import JSZip from 'jszip'
  import JSZipUtils from 'jszip-utils'
  import { saveAs } from 'file-saver'
  import { mapActions, mapGetters } from 'vuex'
  import DownloadFormatChooser from '~/components/DownloadFormatChooser/DownloadFormatChooser.vue'
  import metaRepo from '~/repo/metaRepo'
  import buildDownloadUrl from '~/lib/build-download-url'

  const NO_SELECTION_ID = 'NO_SELECTION_ID'

  export default {
    components: { DownloadFormatChooser },

    data: () => ({
      selectedLayer: null,
      downloadLayersFormats: [],
      downloadLayers: [],
      downloadFormats: [],
      isGeneratingDownload: false,
      preDefinedAreas: [],
      selectedArea: null,
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeatures', 'activeFlattenedLayerIds', 'activeFlattenedLayers' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),

      activeLayers() {
        return this.activeFlattenedLayerIds.map(id => this.activeFlattenedLayers.find(layer => layer.id === id))
      },

      allUrlsAreValid() {
        return this.selectedLayerData.every(layer => Boolean(layer.downloadUrl) || Boolean(layer.url))
      },

      buttonText() {
        return this.selectedArea
          ? this.$tc('downloadDataSection', this.downloadLayers.length)
          : this.$tc('downloadData', this.downloadLayers.length)
      },

      // TODO: fix this
      drawnFeaturesCoordinates() {
        return this.drawnFeatures.map(feature => {
          return feature?.geometry?.coordinates
            ? Array.from(feature?.geometry?.coordinates).map(coordinates => coordinates.flat())
            : []
        })
      },

      downloadIsAvailable() {
        return this.activeLayers.some(layer => Boolean(layer.downloadUrl) || Boolean(layer.url))
      },

      formattedAreas() {
        const noSelectionObj = {
          id: NO_SELECTION_ID,
          properties: { mpnomsch: this.$t('noSelection') },
        }

        return Object.freeze([ noSelectionObj, ...this.preDefinedAreas ])
      },

      activeLayersList() {
        return this.activeLayers.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
      },

      selectedLayerData() {
        return this.downloadLayers.map(id => this.activeLayers.find(layer => layer.id === id))
      },

      selectionCoordinates() {
        return this.drawnFeaturesCoordinates.map(featureCoordinates => featureCoordinates.toString().replace(/,/g, ' '))
      },
    },

    watch: {
      activeFlattenedLayerIds(val, oldVal) {
        if (val !== oldVal) {
          // if activeFlattenedLayerIds change, reset selected layers in dropdown.
          this.downloadLayers = []
        }
      },
    },
    created() {
      metaRepo
        .getPredefinedAreas()
        .then(areas => this.preDefinedAreas = areas)
        .catch(err => console.error('Error getting predefined selections', err))
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'addDrawnFeature', 'cleardrawnFeatures', 'setSelectedLayerForSelection' ]),

      handleSelectionLayerSelect(id) {
        console.log(id)
        this.setSelectedLayerForSelection(this.activeLayers.find(layer => layer.id === id))
      },

      getLayerNameById(id) {
        const layer = this.flattenedLayers.find(layer => layer.id === id)
        return layer?.name
      },

      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        await this.cleardrawnFeatures()
        this.selectedArea = null

        if (mode === 'static') {
          console.log(this.activeLayers.find(layer => layer.id === this.activeLayersList[0].value))
          this.setSelectedLayerForSelection(this.activeLayers.find(layer => layer.id === this.activeLayersList[0].value))
          this.selectedLayer = this.activeLayersList[0].value
        }

        this.setDrawMode({ mode })
      },

      onAreaSelection(id) {
        this.setDrawMode({ mode: null })

        if (id === NO_SELECTION_ID) {
          this.cleardrawnFeatures()
          return
        }

        const feature = this.preDefinedAreas.find(area => area.id === id)
        this.cleardrawnFeatures()
        this.addDrawnFeature(feature)
      },

      onDownloadClick() {
        const urls = buildDownloadUrl({
          layers: this.selectedLayerData,
          coordinates: this.selectionCoordinates,
          formats: this.downloadLayersFormats,
        })

        this.isGeneratingDownload = true

        this.generateZipFile(urls)
          .then((content) => {
            saveAs(content, 'layers.zip')
            this.isGeneratingDownload = false
          })
      },

      async generateZipFile(urls) {
        let zip = new JSZip()

        return Promise.all(urls.map(async ({ url, fileType }, index) => {
          const filename = `${ this.selectedLayerData[index].layer }.${ fileType }`

          return JSZipUtils.getBinaryContent(url)
            .then(data => zip.file(filename, data, { binary: true }))
            .catch(err => console.log(err))
        }))
          .then(() => zip.generateAsync({ type: 'blob' }))
      },
    },
  }
</script>

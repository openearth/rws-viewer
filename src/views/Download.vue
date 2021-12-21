<template>
  <v-container class="download pt-4">
    <template v-if="!downloadIsAvailable && !activeLayersList.length">
      <v-row>
        <v-col>
          <p>{{ $t('noLayersSelected') }}</p>
        </v-col>
      </v-row>
    </template>
    <template v-if="!downloadIsAvailable && activeLayersList.length">
      <v-row>
        <v-col>
          <p>{{ $t('downloadUnavailable') }}</p>
        </v-col>
      </v-row>
    </template>
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
  import metaRepo from '~/repo/metaRepo'
  import buildDownloadUrl from '~/lib/build-download-url'

  const NO_SELECTION_ID = 'NO_SELECTION_ID'

  export default {
    data: () => ({
      preDefinedAreas: [],
      selectedArea: null,
      downloadLayers: [],
      isGeneratingDownload: false,
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeature', 'rasterLayerIds' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),

      activeLayers() {
        return this.rasterLayerIds.map(id => this.flattenedLayers.find(layer => layer.id === id))
      },

      allUrlsAreValid() {
        return this.selectedLayerData.every((layer) => Boolean(layer.downloadUrl) || Boolean(layer.url))
      },

      buttonText() {
        return this.selectedArea
          ? this.$tc('downloadDataSection', this.downloadLayers.length)
          : this.$tc('downloadData', this.downloadLayers.length)
      },

      drawnFeatureCoordinates() {
        return this.drawnFeature?.geometry?.coordinates
          ? Array.from(this.drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
          : []
      },

      downloadIsAvailable() {
        return this.activeLayers.some(layer => layer?.downloadUrl !== null)
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
        return this.drawnFeatureCoordinates.toString().replace(/,/g, ' ')
      },
    },

    watch: {
      rasterLayerIds(val, oldVal) {
        if (val !== oldVal) {
          // if rasterLayerIds change, reset selected layers in dropdown.
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
      ...mapActions('map', [ 'setDrawMode', 'setDrawnFeature', 'clearDrawnFeature' ]),

      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        await this.clearDrawnFeature()
        this.selectedArea = null
        this.setDrawMode({ mode })
      },

      onAreaSelection(id) {
        this.setDrawMode({ mode: null })

        if (id === NO_SELECTION_ID) {
          this.clearDrawnFeature()
          return
        }

        const feature = this.preDefinedAreas.find(area => area.id === id)
        this.setDrawnFeature(feature)
      },

      onDownloadClick() {
        const urls = buildDownloadUrl(this.selectedLayerData, this.selectionCoordinates)

        this.isGeneratingDownload = true

        this.generateZipFile(urls)
          .then((content) => {
            saveAs(content, 'layers.zip')
            this.isGeneratingDownload = false
          })
      },

      async generateZipFile(urls) {
        let zip = new JSZip()

        return Promise.all(urls.map(({ url, fileType }, index) => {
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

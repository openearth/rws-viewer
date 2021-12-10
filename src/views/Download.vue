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
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-btn
            color="primary"
            block
            :ripple="false"
            :disabled="!downloadLayers.length || isGeneratingDownload"
            :loading="isGeneratingDownload"
            @click="onDownloadClick"
          >
            {{ $t('downloadData') }}
            <template #loader>
              <span>Generating download...</span>
            </template>
          </v-btn>
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
        return this.flattenedLayers.filter(layer => this.rasterLayerIds.includes(layer.id))
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
      rasterLayerIds: {
        handler: function (val, oldVal) {
          if (val !== oldVal) {
            // if rasterLayerIds change, reset selected layers in dropdown.
            this.downloadLayers = []
          }
        },
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

      // Work in progress
      onDownloadClick() {
        const urls = buildDownloadUrl(this.selectedLayerData, this.selectionCoordinates)

        this.isGeneratingDownload = true

        urls.forEach((url, index) => {
          const zip = new JSZip()
          let filename = `${ this.selectedLayerData[index].layer }.csv`

          JSZipUtils.getBinaryContent(url, (err, data) => {
            if (err) {
              throw err
            }

            zip.file(filename, data, { binary: true })

            if (index + 1 === urls.length) {
              zip.generateAsync({ type: 'blob' })
                .then((content) => {
                  saveAs(content, 'layers.zip')
                  this.isGeneratingDownload = false
                })
            }
          })
        })
      },
    },
  }
</script>

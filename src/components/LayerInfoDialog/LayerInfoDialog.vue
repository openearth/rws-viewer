<template>
  <div>
    <v-dialog
      scrollable
      :value="open"
      width="600"
      @click:outside="close"
    >
      <v-card>
        <v-app-bar
          class="pr-1 pl-2"
          flat
          height="auto"
        >
          <v-toolbar-title class="layer-info-dialog__title--wrapping">
            {{ title }}
          </v-toolbar-title>

          <v-spacer />

          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-app-bar>

        <v-divider />

        <div class="px-2 py-2 flex-grow-1 overflow-y-auto justify-center">
          <v-card-text>
            <dl class="layer-info-dialog__metadata">
              <div v-for="item in content" :key="item.key">
                <dt class="font-weight-bold layer-info-dialog__metadata-key">
                  {{ item.key }}
                </dt>
                <dd
                  class="layer-info-dialog__metadata-value"
                  v-html="item.value"
                />
              </div>

              <dt class="font-weight-bold layer-info-dialog__metadata-key">
                Feedback
              </dt>
              <dd class="layer-info-dialog__metadata-value">
                <a @click="$emit('showFeedbackDialog')">
                  {{ $t('feedbackDescription') }}
                </a>
              </dd>

              <dt class="font-weight-bold layer-info-dialog__metadata-key">
                {{ $t('shareUrl') }}
                <v-btn icon @click="copyUrlToClipboard(shareUrl)">
                  <v-icon>mdi-clipboard-arrow-down-outline</v-icon>
                </v-btn>
              </dt>
              <dd class="layer-info-dialog__metadata-value">
                {{ shareUrl }}
              </dd>

              <template v-if="wmsUrl !== ''">
                <dt class="font-weight-bold layer-info-dialog__metadata-key">
                  {{ $t('wmsUrl') }}
                  <v-btn icon @click="copyUrlToClipboard(wmsUrl)">
                    <v-icon>mdi-clipboard-arrow-down-outline</v-icon>
                  </v-btn>
                </dt>
                <dd class="layer-info-dialog__metadata-value">
                  <a :href="wmsUrl" target="_blank">
                    {{ title }}
                  </a>
                </dd>
              </template>


              <template v-if="errorMessage">
                <dt class="layer-info-dialog__metadata-key" />
                <dd class="layer-info-dialog__metadata-value red--text">
                  {{ errorMessage }}
                </dd>
              </template>

              <template v-if="isLoading">
                <dt class="layer-info-dialog__metadata-key" />
                <dd class="layer-info-dialog__metadata-value">
                  <v-progress-circular indeterminate color="primary" />
                </dd>
              </template>

              <div v-if="!isLoading && !errorMessage && recordUrl">
                <dt class="font-weight-bold layer-info-dialog__metadata-key">
                  Metadata url
                </dt>
                <dd class="layer-info-dialog__metadata-value">
                  <a :href="recordUrl" target="_blank">
                    {{ recordUrl }}
                  </a>
                </dd>
              </div>
            </dl>
          </v-card-text>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  import buildGeoserverUrl from '~/lib/build-geoserver-url'
  import { getWmsCapabilities, getLayerProperties } from '~/lib/get-capabilities'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      title: {
        type: String,
        default: '',
      },
      content: {
        type: Array,
        default: () => [],
      },
      shareUrl: {
        type: String,
        default: '',
      },
      layerId: {
        type: String,
        required: true,
      },
      layer: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
      viewerName: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        isLoading: true,
        recordUrl: '',
        errorMessage: null,
        wmsUrl: '',
      }
    },

    watch: {
      async open(val) {
        if (val) {
          try {
            this.errorMessage = ''
            this.isLoading = true
            const { data } = await axios(
              `/api/record-register?record=${ this.layerId }&viewer=${ this.viewerName }`,
            )
            this.recordUrl = data
          } catch (e) {
            if (!e.response.data.error) {
              this.errorMessage = this.$t('recordUrlFechingError') 
            }
          } finally {
            this.isLoading = false
          }
        }
      },
    },

    async mounted() {
      if (this.layer && this.url) {
        this.wmsUrl = await this.getWmsUrl()
      }
    },

    methods: {
      close() {
        this.$emit('close')
      },
      async copyUrlToClipboard(url) {
        await navigator.clipboard.writeText(url)
        alert(`The following url is copied to clipboard! ${ url }`)
      },
      async getWmsUrl() {
        const capabilities = await getWmsCapabilities(this.url)
        const { bbox } = getLayerProperties(capabilities, this.layer)
        return buildGeoserverUrl({
          url: this.url,
          request: 'GetMap',
          service: 'WMS',
          version: '1.1.0',
          format: 'application/openlayers',
          srs: 'EPSG:4258',
          layers: this.layer,
          width: 700,
          height: 500,
          bbox: bbox.flat().join(','),
          styles: '',
        })
      },
    },
  }
</script>

<style lang="scss">
.layer-info-dialog__metadata {
  display: grid;
  grid-template-columns: auto 1fr;
  row-gap: $spacing-smaller;
  column-gap: $spacing-default;
}

.layer-info-dialog__metadata > div {
  display: contents;
}

.layer-info-dialog__metadata-key {
  width: 100px;
}

.layer-info-dialog__metadata-value {
  max-width: 440px;
  margin: auto 0;
}

.layer-info-dialog__metadata-value a {
  display: block;
  margin-bottom: $spacing-smaller;
}

.layer-info-dialog__metadata-value a:last-child {
  margin-bottom: 0;
}

.layer-info-dialog__title--wrapping {
  white-space: wrap;
}

</style>

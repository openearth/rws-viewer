<template>
  <div>
    <v-dialog
      scrollable
      :value="open"
      width="600"
      @click:outside="close"
      @keydown.esc="close"
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
              <dt class="font-weight-bold layer-info-dialog__metadata-key">
                {{ $t('layerName') }}
              </dt>
              <dd class="layer-info-dialog__metadata-value">
                {{ title }}
              </dd>

              <template v-if="description">
                <dt class="font-weight-bold layer-info-dialog__metadata-key">
                  {{ $t('description') }}
                </dt>
                <dd class="layer-info-dialog__metadata-value" v-html="description"></dd>
              </template>

              <template v-if="source">
                <dt class="font-weight-bold layer-info-dialog__metadata-key">
                  {{ $t('source') }}
                  <v-btn
                    v-if="hasUrl(source)"
                    icon
                    @click="copyUrlToClipboard(extractUrlFromHTML(source))"
                  >
                    <v-icon>mdi-clipboard-arrow-down-outline</v-icon>
                  </v-btn>
                </dt>
                <dd class="layer-info-dialog__metadata-value" v-html="source" />
              </template>

              <template v-if="info">
                <dt class="font-weight-bold layer-info-dialog__metadata-key">
                  {{ $t('info') }}
                  <v-btn
                    v-if="hasUrl(info)"
                    icon
                    @click="copyUrlToClipboard(extractUrlFromHTML(info))"
                  >
                    <v-icon>mdi-clipboard-arrow-down-outline</v-icon>
                  </v-btn>
                </dt>
                <dd class="layer-info-dialog__metadata-value" v-html="info" />
              </template>

              <template v-if="leaflet">
                <dt class="font-weight-bold layer-info-dialog__metadata-key">
                  {{ $t('leaflet') }}
                  <v-btn
                    v-if="hasUrl(leaflet)"
                    icon
                    @click="copyUrlToClipboard(extractUrlFromHTML(leaflet))"
                  >
                    <v-icon>mdi-clipboard-arrow-down-outline</v-icon>
                  </v-btn> 
                </dt>
                <dd class="layer-info-dialog__metadata-value" v-html="leaflet" />
              </template>
            
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
                {{ $t('shareUrl') }}
                <v-btn icon @click="copyUrlToClipboard(shareUrl)">
                  <v-icon>mdi-clipboard-arrow-down-outline</v-icon>
                </v-btn>
              </dt>
              <dd class="layer-info-dialog__metadata-value">
                <a :href="shareUrl" target="_blank">
                  {{ $t('shareUrl') }}
                </a>
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
                    {{ $t('wmsUrl') }}
                  </a>
                </dd>
              </template>

              <template v-if="downloadLayer || layer">
                <dt class="font-weight-bold layer-info-dialog__metadata-key">
                  {{ $t('wmsLayer') }}
                  <v-btn icon @click="copyUrlToClipboard(downloadLayer || layer)">
                    <v-icon>mdi-clipboard-arrow-down-outline</v-icon>
                  </v-btn>
                </dt>
                <dd class="layer-info-dialog__metadata-value">
                  {{ downloadLayer || layer }}
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
                    Metadata url
                  </a>
                </dd>
              </div>

              <dt class="font-weight-bold layer-info-dialog__metadata-key">
                Feedback
              </dt>
              <dd class="layer-info-dialog__metadata-value">
                <a @click="$emit('showFeedbackDialog')">
                  {{ $t('feedbackDescription') }}
                </a>
              </dd>

              <template v-if="errorMessage">
                <dt class="layer-info-dialog__metadata-key" />
                <dd class="layer-info-dialog__metadata-value red--text">
                  {{ errorMessage }}
                </dd>
              </template>
            </dl>
          </v-card-text>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import axios from 'axios'

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
      description: {
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
      viewerLayerId: {
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
      downloadUrl: {
        type: String,
        default: '',
      },
      downloadLayer: {
        type: String,
        default: '',
      },
      source: {
        type: String,
        default: '',
      },
      leaflet: {
        type: String,
        default: '',
      },
      info: {
        type: String,
        default: '',
      }
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

            const data = await this.multipleFetch([
              `/api/record-register?record=${this.layerId}&viewer=${this.viewerName}`,
              `/api/record-register?record=${this.viewerLayerId}&viewer=${this.viewerName}`,
            ])

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
      hasUrl(html) {
        return Boolean(this.extractUrlFromHTML(html))
      },
      async copyUrlToClipboard(url) {
        await navigator.clipboard.writeText(url)

        alert(`The following url is copied to clipboard! ${ url }`)
      },
      async getWmsUrl() {
        if (this.downloadUrl) {
          return this.downloadUrl
        }

        return this.url
      },
      async multipleFetch(urls) {
        for (let i = 0; i < urls.length; i++) {
          try {
            const response = await axios.get(urls[i]);

            return response.data.url;
          } catch (error) {
            console.error(`Failed to fetch from URL ${i + 1}:`, error.message);
          }
        }

        throw new Error('All fetch attempts failed');
      },
      extractUrlFromHTML(html) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')
        const a = doc.querySelector('a')

        return a ? a.href : ''
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
    width: 170px;
  }

  .layer-info-dialog__metadata-value {
    max-width: 350px;
    margin: auto 0;
  }

  .layer-info-dialog__metadata-value table {
    width: 100%;
    border: 1px solid grey;
    border-collapse: collapse;
  }

  .layer-info-dialog__metadata-value table th,
  .layer-info-dialog__metadata-value table td {
    text-align: start;
    border: 1px solid grey;
    padding: 5px;
  }

  .layer-info-dialog__title--wrapping {
    white-space: wrap;
  }

</style>

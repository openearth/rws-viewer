<template>
  <v-dialog
    scrollable
    :value="open"
    width="600"
    @click:outside="close"
  >
    <v-card>
      <v-app-bar class="pr-1 pl-2" flat>
        <v-toolbar-title>
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
              {{ $t('shareUrl') }}
              <v-btn icon @click="copyUrlToClipboard(shareUrl)">
                <v-icon>mdi-clipboard-arrow-down-outline</v-icon>
              </v-btn>
            </dt>
            <dd class="layer-info-dialog__metadata-value">
              {{ shareUrl }}
            </dd>

            <template v-if="errorMessage">
              <dt class="layer-info-dialog__metadata-key" />
              <dd class="layer-info-dialog__metadata-value">
                {{ errorMessage }}
              </dd>
            </template>

            <template v-if="isLoading">
              <dt class="layer-info-dialog__metadata-key" />
              <dd class="layer-info-dialog__metadata-value">
                <v-progress-circular
                  indeterminate
                  color="primary"
                />
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
              this.errorMessage =
                'Something went wrong during fetching the record url.'
            }
          } finally {
            this.isLoading = false
          }
        }
      },
    },

    methods: {
      close() {
        this.$emit('close')
      },
      async copyUrlToClipboard(url) {
        await navigator.clipboard.writeText(url)
        alert(`The following url is copied to clipboard! ${ url }`)
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
}

.layer-info-dialog__metadata-value a {
  display: block;
  margin-bottom: $spacing-smaller;
}

.layer-info-dialog__metadata-value a:last-child {
  margin-bottom: 0;
}
</style>

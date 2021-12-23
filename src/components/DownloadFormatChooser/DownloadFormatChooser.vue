<template>
  <v-row>
    <v-col>
      <p class="body-1 mb-3">
        <v-icon>mdi-layers-outline</v-icon>
        {{ layerToDownload.name }}
      </p>
      <v-select
        v-model="chosenFormat"
        :label="$t('layerFormats')"
        :items="supportedFormats"
        :disabled="loading"
        dense
        outlined
        hide-details
      />
    </v-col>
  </v-row>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { getCapabilities, getSupportedOutputFormats } from '~/lib/get-capabilities'
  import { getType } from '~/lib/service-helpers'

  export default {
    props: {
      layerId: {
        type: String,
        required: true,
      },
      value: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      loading: true,
      supportedFormats: [],
      chosenFormat: '',
    }),

    computed: {
      ...mapGetters('data', [ 'flattenedLayers' ]),
      layerToDownload() {
        return this.flattenedLayers.find(({ id }) => this.layerId === id)
      },
    },

    watch: {
      chosenFormat(newValue) {
        this.$emit('input', newValue)
      },
      value(newValue) {
        this.chosenFormat = newValue
      },
    },

    async mounted() {
      const serviceUrl = this.layerToDownload.downloadUrl || this.layerToDownload.url
      const serviceType = getType(serviceUrl)
      const capabilities = await getCapabilities(serviceUrl, serviceType)
      this.supportedFormats = getSupportedOutputFormats(serviceType, capabilities)
      this.loading = false
    },

  }
</script>

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
  import moveInArrayByValue from '~/lib/move-in-array-by-value'

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
      ...mapGetters('map', [ 'activeFlattenedLayers' ]),
      layerToDownload() {
        //was changed from flattenedLayers.find to activeFlattenedLayers.find. 
        return this.activeFlattenedLayers.find(({ id }) => this.layerId === id)
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
      const serviceType = this.layerToDownload.serviceType 
      //wfs or wcs capabilities to read the supported formats to download the layer
      const capabilities = await getCapabilities(serviceUrl, serviceType)

      let supportedOutputFormats = getSupportedOutputFormats(serviceType, capabilities)
      supportedOutputFormats = moveInArrayByValue(supportedOutputFormats, 'csv', 0)
      supportedOutputFormats = moveInArrayByValue(supportedOutputFormats, 'SHAPE-ZIP', 1)

      this.supportedFormats = supportedOutputFormats
      this.loading = false
    },

  }
</script>

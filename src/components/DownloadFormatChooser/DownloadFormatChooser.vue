<template>
  <v-row>
    <v-col>
      <p class="body-1 mb-3">
        <v-icon>mdi-layers-outline</v-icon>
        {{ layer.name }}
      </p>
      <v-select
        v-model="chosenFormat"
        :label="$t('layerFormats')"
        :items="supportedFormats"
        dense
        outlined
        hide-details
      />
    </v-col>
  </v-row>
</template>

<script>
  import { getSupportedOutputFormats } from '~/lib/get-capabilities'
  import moveInArrayByValue from '~/lib/move-in-array-by-value'

  export default {
    props: {
      layer: {
        type: Object,
        required: true,
      },
      layerCapabilities: {
        type: XMLDocument,
        required: true,
      },
      value: {
        type: String,
        default: '',
      },
    },

    data: () => ({
      supportedFormats: [],
      chosenFormat: '',
    }),

    watch: {
      chosenFormat(newValue) {
        this.$emit('input', newValue)
      },
      value(newValue) {
        this.chosenFormat = newValue
      },
    },
    
    async mounted() {
      let supportedOutputFormats = getSupportedOutputFormats(this.layer.serviceType, this.layerCapabilities)
      supportedOutputFormats = moveInArrayByValue(supportedOutputFormats || [], 'csv', 0)
      supportedOutputFormats = moveInArrayByValue(supportedOutputFormats || [], 'SHAPE-ZIP', 1)

      this.supportedFormats = supportedOutputFormats
    },

  }
</script>

<template>
  <v-container class="download pt-4">
    <v-row v-if="!timeIsAvailable && !activeLayersList.length">
      <v-col>
        <v-alert
          dense
          outlined
          type="info"
        >
          Please select a layer with time option
        </v-alert>
      </v-col>
    </v-row>
    <v-row v-if="!timeIsAvailable && activeLayersList.length">
      <v-col>
        <v-alert
          dense
          outlined
          type="error"
        >
          This layer does not provide the time option
        </v-alert>
      </v-col>
    </v-row>
    <template v-if="timeIsAvailable && activeLayersList.length">
      <v-row>
        <v-col>
          <h3>{{ $t('select') }}</h3>
          <p class="body-2 mb-0">
            Select a layer from the list to enable the time component
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="selectedLayerCode"
            label="Select from visible layers with time option"
            :items="activeLayersList"
            dense
            outlined
            hide-details
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
          <h3>{{ $t('select') }}</h3>
          <p class="body-2 mb-0">
            Select a filter from the list
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="queryFilter"
            label="Predifined filter"
            :items="activeLayersList"
            dense
            outlined
            hide-details
          />
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
  import { mapGetters } from 'vuex'
  import { getWmsCapabilities } from '~/lib/get-capabilities'

  export default {
    
    // GetCapabilities request when layer is selected.
    // When timeselection is enabled then do: timeoption on
    //timeIsAvailable make it work properly
    //GetCapabilities fix it.
    //Read the filters list to pass it in
    data: () => ({
      queryFilter: null,
      selectedLayerCode: null,
    }),
    computed: {
      ...mapGetters('map', [ 'drawMode', 'drawnFeature', 'rasterLayerIds' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
      activeLayers() {
        return this.rasterLayerIds.map(id => this.flattenedLayers.find(layer => layer.id === id))
      },
      timeIsAvailable() {
        console.log('this.activeLayers', this.activeLayers)
        return true
      },
      activeLayersList() {
        return this.activeLayers.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
      },
      selectedLayer() {
        return this.flattenedLayers.find(layer => layer.id === this.selectedLayerCode)
      },


    },
    watch: {
      selectedLayer() {
        if (this.selectedLayer) {
          const { url } = this.selectedLayer
          getWmsCapabilities(url)
        }
       
      },
    },

  }
</script>

<template>
  <v-container class="download pt-4">
    <v-row v-if="!activeLayersList.length">
      <v-col>
        <v-alert
          dense
          outlined
          type="info"
        >
          {{ $t('filterViewMessage') }}
        </v-alert>
      </v-col>
    </v-row>
    <template v-if="activeLayersList.length">
      <v-row>
        <v-col>
          <h3>{{ $t('select') }}</h3>
          <p class="body-2 mb-0">
            {{ $t('selectLayerWithTime') }}
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="selectedLayerCode"
            :label="$t('labelLayerWithTime')"
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
            {{ $t('selectFilter') }}
          </p>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-select
            v-model="queryFilter"
            :label="$t('labelFilter')"
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
  import { mapGetters, mapActions } from 'vuex'
  import { getWmsCapabilities, getLayerTimeExtent } from '~/lib/get-capabilities'
  //Filters view should open only if layers with time option are in wms layers list.
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
      ...mapGetters('map', [ 'rasterLayerWithTimeIds'  ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
     
      activeLayers() { 
        //ActiveLayers with time option
        return this.rasterLayerWithTimeIds.map(id => this.flattenedLayers.find(layer => layer.id === id))
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
          const { url, layer } = this.selectedLayer
          this.requestCapabilities(url, layer)
          
        }
       
      },
    },
    methods: {
      ...mapActions('data', [ 'setTimeExtent' ] ),
      async requestCapabilities(url, layer) {
        const layerWithoutWorkspace = layer.split(':').pop()
        const response = await getWmsCapabilities(url)
        const capabilities = response.WMT_MS_Capabilities.Capability
        const timeExtent = getLayerTimeExtent(capabilities, layerWithoutWorkspace)
        this.setTimeExtent(timeExtent)
      },
    },

  }
</script>

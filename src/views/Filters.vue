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
            @change="setIdOfFilteredLayer"
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
            v-model="filterValue"
            :label="$t('labelFilter')"
            :items="hardCodedValues"
            dense
            outlined
            hide-details
            @change="setFilter"
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
    
    data: () => ({
      filterValue: null,
      selectedLayerCode: null,
    }),
    computed: {
      ...mapGetters('map', [ 'rasterLayerWithTimeIds'  ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
     
      activeLayers() { 
        //ActiveLayers with timeFilter true
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
      //TODO: use this parameter for the dropdown list
      allowedValuesToFilter() {
        if (!this.selectedLayer) {
          return []
        }
        const { columnFilter } = this.selectedLayer
        return columnFilter.allowedValues
      },
      filterName() {
        if (!this.selectedLayer) {
          return []
        }
        const { columnFilter } = this.selectedLayer
        return columnFilter.name
      },
      //TODO: remove eventually this computed property. 
      hardCodedValues() {
        if (!this.selectedLayer) {
          return []
        }
        return [ 'Clupea harengus', 'Crangon crangon','Pleuronectes platessa', 'Osmerus eperlanus' ]
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
      ...mapActions('data', [ 'setTimeExtent', 'setCQLFilter' ] ),
      ...mapActions('map', [ 'setFiltersLayerId' ]),
      async requestCapabilities(url, layer) {
        const layerWithoutWorkspace = layer.split(':').pop()
        const response = await getWmsCapabilities(url)
        const capabilities = response.WMT_MS_Capabilities.Capability
        const timeExtent = getLayerTimeExtent(capabilities, layerWithoutWorkspace)
        this.setTimeExtent(timeExtent)
      },
      setFilter(value) {
        const filter = `${ this.filterName }='${ value }'`
        this.setCQLFilter(filter)
      },
      setIdOfFilteredLayer(id) {
        this.setFiltersLayerId(id)
      },
    },

  }
</script>

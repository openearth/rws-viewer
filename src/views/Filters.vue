<template>
  <v-container class="filters pt-4">
    <v-row v-if="!availableLayersList.length">
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
    <template v-if="availableLayersList.length">
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
            :items="availableLayersList"
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
            v-model="filterValue"
            :label="$t('labelFilter')"
            :items="allowedValuesToFilter"
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
  //Filters view should open only if layers with time option are in wms layers list.
  export default {
    
    data: () => ({
      filterValue: null,
      selectedLayerCode: null,
    }),
    computed: {
      ...mapGetters('map', [ 'activeFlattenedLayersIdsWithTimeOption', 'activeFlattenedLayers'  ]),
      ...mapGetters('data', [ 'selectedTimestamp' ]),
      availableLayers() { 
        //availableLayers with timeFilter true
        return this.activeFlattenedLayersIdsWithTimeOption.map(id => this.activeFlattenedLayers.find(layer => layer.id === id))
      },
      availableLayersList() {
        return this.availableLayers.map(({ id, name }) => ({
          text: name,
          value: id,
        }))
      },
      selectedLayer() {
        return this.activeFlattenedLayers.find(layer => layer.id === this.selectedLayerCode)
      },
      allowedValuesToFilter() {
        if (!this.selectedLayer) {
          return []
        }
        if (!this.selectedLayer.columnFilter) {
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

    },
    watch: {
      selectedLayer() {
        if (this.selectedLayer) {
          this.setTimeExtent(this.selectedLayer.timeExtent)
        }
      },
      selectedLayerCode( ) {
        if (this.selectedLayerCode) {
          this.setIdOfFilteredLayer(this.selectedLayerCode)
        }
      },
      selectedTimestamp() { 
        if (this.selectedTimestamp) {
          this.reloadLayerOnMap()
        }
      },
    },
    methods: {
      ...mapActions('data', [ 'setTimeExtent', 'setCQLFilter' ] ),
      ...mapActions('map', [ 'setFilteredLayerId', 'reloadLayerOnMap' ]),
      setFilter(value) {
        const filter = `${ this.filterName }='${ value }'`
        this.setCQLFilter(filter)
        this.reloadLayerOnMap()

      },
      setIdOfFilteredLayer(id) {
        this.setFilteredLayerId(id)
      },
    },

  }
</script>
<style>
.filters {
  overflow-y:auto;
  height: calc(100vh - 130px);
}
</style>

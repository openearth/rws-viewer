<template>
  <v-container class="layers pt-4">
    <v-row>
      <v-col>
        <v-expansion-panels v-model="openPanels" multiple>
          <v-expansion-panel :key="0" :disabled="activeLayers.length === 0">
            <v-expansion-panel-header>
              {{ $t('activeLayers') }}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <layer-list
                chip
                :layers="activeLayers"
                @remove-layer="onRemoveLayer"
                @show-layer-info="onShowLayerInfo"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel :key="1">
            <v-expansion-panel-header>
              {{ $t('availableLayers') }}
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-select
                v-model="selectedTags"
                class="pb-1"
                :label="$t('filterByTag')"
                multiple
                dense
                outlined
                hide-details
                :items="layerTags"
              />
              <layer-tree
                :layers="availableLayers"
                @select-layers="onSelectLayers"
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  const LayerList = () => import('~/components/LayerList/LayerList')
  const LayerTree = () => import('~/components/LayerTree/LayerTree')

  export default {
    name: 'Layer',

    components: {
      LayerList,
      LayerTree,
    },

    data: () => ({
      selectedTags: [],
      openPanels: [ 1 ],
    }),

    computed: {
      ...mapGetters('app', [ 'appConfig' ]),
      ...mapGetters('data', [
        'displayLayers',
        'flattenedLayers',
        'availableFlattenedLayers',
        'layerTags',
        'availableDisplayLayers',
      ]),
      ...mapGetters('map', [
        'rasterLayerIds',
        'rasterLayers',
      ]),

      availableLayers() {
        if (!this.selectedTags.length) {
          return this.availableDisplayLayers
        }

        return this.availableFlattenedLayers.filter(({ tags }) =>
          this.selectedTags.every(tag => tags.includes(tag)))
      },

      activeLayers() {
        return this.flattenedLayers.filter(layer => this.rasterLayerIds.includes(layer.id))
      },
    },

    watch: {
      activeLayers(newValue) {
        const url = new URL(window.location.href)
        url.searchParams.set('layers', newValue.map(({ id }) => id).join(','))
        this.$router.replace(`/${ this.appConfig }/?${ url.searchParams.toString() }`)
      },
    },

    mounted() {
      if (this.activeLayers.length > 0) {
        this.openPanels.push(0)
      }
    },

    methods: {
      ...mapActions('data', [ 'setDisplayLayers', 'setLayerDialogOpen', 'setSelectedLayers' ]),
      ...mapActions('map', [ 'addRasterLayer', 'removeRasterLayer' ]),

      onSelectLayers(layerIds) {
        const layers = layerIds
          .map(layerId => this.flattenedLayers.find(({ id }) => id === layerId))

        if (layers.length) {
          this.addRasterLayer({ layers })
        }

        if (this.openPanels.includes(0) === false) {
          this.openPanels.push(0)
        }
      },

      onRemoveLayer(layerId) {
        const layerToRemove = this.flattenedLayers.find(({ id }) => id === layerId)

        if (layerToRemove) {
          const layers = [ layerToRemove ]
          this.removeRasterLayer({ layers })
        }

        if (this.activeLayers.length === 0) {
          const index = this.openPanels.indexOf(0)
          this.openPanels = index !== -1
            ? this.openPanels.filter(panel => panel !== 0)
            : this.openPanels
        }
      },

      onShowLayerInfo(layerId) {
        console.log({ layerId })
        this.setLayerDialogOpen({ open: true })
      },
    },
  }
</script>

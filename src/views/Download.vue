<template>
  <v-container class="download">
    <v-row>
      <v-col>
        <v-btn
          :color="drawMode === 'rectangle' ? 'primary' : null"
          block
          @click="onDrawModeSelect('rectangle')"
        >
          Draw rectangle
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          :color="drawMode === 'polygon' ? 'primary' : null"
          block
          @click="onDrawModeSelect('polygon')"
        >
          Draw polygon
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-select
          v-model="selectedArea"
          label="Use predefined selection"
          :items="preDefinedAreas"
          item-text="properties.mpnomsch"
          item-value="id"
          dense
          outlined
          hide-details
          @change="onAreaSelection"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import metaRepo from '~/repo/metaRepo'

  const NO_SELECTION_ID = 'NO_SELECTION_ID'

  export default {
    data: () => ({
      preDefinedAreas: [],
      selectedArea: null,
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode' ]),
    },

    created() {
      metaRepo
        .getPredefinedAreas()
        .then(areas => {
          const noSelectionObj = {
            id: NO_SELECTION_ID,
            properties: { mpnomsch: 'No selection' },
          }
          this.preDefinedAreas = Object.freeze([ noSelectionObj, ...areas ])
        })
        .catch(err => {
          console.error('Error getting predefined selections', err)
        })
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'setDrawnFeature', 'clearDrawnFeature' ]),

      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        await this.clearDrawnFeature()
        this.selectedArea = null
        this.setDrawMode({ mode })
      },

      onAreaSelection(id) {
        this.setDrawMode({ mode: null })
        if (id === NO_SELECTION_ID) {
          this.clearDrawnFeature()
          return
        }
        const feature = this.preDefinedAreas.find(area => area.id === id)
        this.setDrawnFeature(feature)
      },
    },
  }
</script>

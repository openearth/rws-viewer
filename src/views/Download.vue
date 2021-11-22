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
          v-model="selectedAreas"
          label="Use predefined selections"
          :items="preDefinedAreas"
          item-text="properties.mpnomsch"
          item-value="id"
          multiple
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

  export default {
    data: () => ({
      preDefinedAreas: [],
      selectedAreas: [],
    }),

    computed: {
      ...mapGetters('map', [ 'drawMode' ]),
    },

    created() {
      metaRepo
        .getPredefinedAreas()
        .then(areas => {
          this.preDefinedAreas = Object.freeze(areas)
        })
        .catch(err => {
          console.error('Error getting predefined selections', err)
        })
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode', 'clearDrawnFeature', 'setSelectedTemplateFeatures' ]),

      async onDrawModeSelect(mode) {
        // We need to wait for clearing the feature
        // before we can start drawing again
        await this.clearDrawnFeature()
        this.setDrawMode({ mode })
      },

      onAreaSelection(ids) {
        const features = ids.map(id => this.preDefinedAreas.find(area => area.id === id))
        this.setSelectedTemplateFeatures(features)
      },
    },
  }
</script>

<template>
  <v-container class="favourites pt-4">
    <v-row>
      <v-col>
        <v-btn
          color="primary"
          block
          :ripple="false"
          @click="onSaveClick"
        >
          {{ $t('saveFavourites') }}
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-divider class="my-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-file-input
          v-model="chosenFile"
          label="Select a file"
          accept="application/json"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-btn
          color="primary"
          block
          :ripple="false"
          :disabled="!chosenFile"
          @click="onLoadClick"
        >
          {{ $t('loadFavourites') }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { saveAs } from 'file-saver'
  import { mapGetters, mapActions } from 'vuex'

  export default {
    name: 'Favourites',

    data() {
      return {
        chosenFile: null,
      }
    },

    computed: {
      ...mapGetters('map', [ 'activeFlattenedLayerIds' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
    },

    methods: {
      ...mapActions('map', [
        'loadLayerOnMap',
        'removeLayerFromMap',
        'resetLayers',
      ]),

      onSaveClick() {
        const data = {
          layers: this.activeFlattenedLayerIds,
        }

        const blob = new Blob([ JSON.stringify(data) ], {
          type: 'application/json',
        })

        saveAs(blob, 'favourites.json')
      },

      onLoadClick() {
        const reader = new FileReader()

        reader.readAsText(this.chosenFile)
        reader.onload = () => {
          const { layers: layerIds } = JSON.parse(reader.result)

          if (layerIds.length) {
            this.resetLayers()
            const layers = layerIds.map((layerId) =>
              this.flattenedLayers.find(({ id }) => id === layerId),
            )
            this.loadLayerOnMap({ layers })
          }
        }
      },
    },
  }
</script>

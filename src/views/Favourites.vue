<template>
  <v-container class="favourites pt-4">
    <template v-if="activeFlattenedLayerIds.length">
      <v-row>
        <v-col>
          <h3>{{ $t('saveFavourites') }}</h3>
          <p class="body-2 mb-0">
            {{ $t('saveFavouritesDesc') }}
          </p>
        </v-col>
      </v-row>
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
    </template>
    <v-row v-else>
      <v-col>
        <v-alert
          dense
          outlined
          type="info"
        >
          {{ $t('saveFavouritesNotice') }}
        </v-alert>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-divider class="my-4" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>{{ $t('loadFavourites') }}</h3>
        <p class="body-2 mb-0">
          {{ $t('loadFavouritesDesc') }}
        </p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-file-input
          v-model="chosenFile"
          :label="$t('selectAFile')"
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
          @click="handleLoadClick"
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
      ...mapGetters('app', [ 'viewerConfig' ]),
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

      handleLoadClick() {
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
            this.$router.replace(`/${ this.viewerConfig }`)
          }
        }
      },
    },
  }
</script>
<style>
  .favourites {
    height: calc(100vh - 130px);
    overflow-y: auto;
  }
</style>

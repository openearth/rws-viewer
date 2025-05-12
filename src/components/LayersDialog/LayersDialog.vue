<template>
  <v-dialog
    scrollable
    :value="open"
    width="800"
    @click:outside="close"
  >
    <v-card>
      <v-app-bar class="pr-1 pl-2" flat>
        <v-toolbar-title>
          {{ $t('layers') }}
        </v-toolbar-title>

        <v-spacer />

        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-app-bar>

      <v-divider />

      <div class="px-2 py-2 flex-grow-1 overflow-y-auto">
        <v-card-text v-if="!layers.length" class="text-center">
          {{ $t('noLayersFound') }}
        </v-card-text>
        <v-card-text v-else>
          <div 
            v-for="(layer, index) in layers" 
            :key="layer.id" 
            class="layers-dialog__layer mt-4"
            @click="showLayer(layer.id)"
          >
            <p class="layers-dialog__layer-name">
              {{ layer.name }}
            </p>
            <p>{{ layer.description }}</p>
            <v-divider v-if="index !== layers.length - 1" />
          </div>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
 
  import { mapActions, mapGetters } from 'vuex'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      layers: {
        type: Array,
        default: () => [],
      },
    },

    computed: {
      ...mapGetters('data', [ 'flattenedLayers' ]),
    },

    methods: {
      ...mapActions('map', [
        'loadLayerOnMap',
        'resetLayers',
      ]),

      close() {
        this.$emit('close')
      },
      showLayer(id) {
        this.resetLayers()   
        const layer = this.flattenedLayers.find(layer => layer && layer.id === id);    
        this.loadLayerOnMap({ layers: [ layer ] })
        this.$emit('close')
      },
    },
  }
</script>

<style lang="scss">
  .layers-dialog__layer {
    cursor: pointer;
  }

  .layers-dialog__layer-name {
    font-weight: bold;
  }
</style>

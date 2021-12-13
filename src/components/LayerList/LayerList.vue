<template>
  <div v-if="chip" class="layer-list--chip">
    <v-chip
      v-for="layer in layers"
      :key="layer.id"
      close
      @click:close="onClose(layer.id)"
    >
      <v-btn
        class="ml-n1 mr-1"
        icon
        x-small
        @click.stop="onClick(layer.id)"
      >
        <v-icon>
          mdi-information
        </v-icon>
      </v-btn>
      {{ layer.name }}
    </v-chip>
  </div>
  <v-list v-else dense>
    <v-list-item v-for="layer in layers" :key="layer.id">
      <v-list-item-content>
        <v-list-item-title v-text="layer.name" />
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
  import { defineComponent } from '@vue/composition-api'

  export default defineComponent({
    props: {
      layers: {
        type: Array,
        default: () => [],
      },
      chip: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, context) {
      return {
        onClick(layerId) {
          context.emit('show-layer-info', layerId)
        },

        onClose(layerId) {
          context.emit('remove-layer', layerId)
        },
      }
    },
  })
</script>

<style lang="scss">
.layer-list--chip {
  display: flex;
  gap: $spacing-tiny;
  flex-wrap: wrap;
}
</style>

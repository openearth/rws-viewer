<template>
  <div>
    <div class="d-flex align-center">
      <span
        class="sortable-handle py-3"
        :data-id="id"
        :data-parent-ids="parentIds"
      >
        {{ name }}
      </span>
      <div v-if="isLayer" class="d-flex align-center ml-3">
        <v-btn icon @click.stop="$emit('show-info', id)">
          <v-icon>
            mdi-information
          </v-icon>
        </v-btn>
      </div>
    </div>
    <v-expand-transition>
      <div v-if="isLayer && selected">
        <v-slider
          v-model="layerOpacity"
          class="pt-2 pb-5 pr-5"
          hide-details
          :ripple="false"
          :max="1"
          :step="0.1"
          label="Opacity"
          @end="$emit('update-layer-opacity', { id, opacity: layerOpacity })"
        />
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
  export default {
    name: 'LayerControl',
    props: {
      id: {
        type: String,
        required: true,
      },
      isLayer: {
        type: Boolean,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      parentIds: {
        type: String,
        required: true,
      },
      selected: {
        type: Boolean,
        required: true,
      },
    },
    data: () => ({
      layerOpacity: 1,
    }),
    watch: {
      selected: {
        handler(selected) {
          if (!selected) {
            this.layerOpacity = 1
          }
        },
      },
    },
  }
</script>

<style lang="scss">
  @import '~/components/AppCore/mixins.scss';

  .sortable-handle {
    @include truncate;

    width: 100%;
    cursor: grab;
  }
</style>

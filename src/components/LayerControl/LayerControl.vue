<template>
  <div>
    <div class="d-flex justify-space-between align-center">
      <span
        class="sortable-handle"
        :data-id="id"
        :data-parent-ids="parentIds"
      >
        {{ name }}
      </span>
      <div v-if="isLayer" class="d-flex align-center ml-3">
        <v-switch
          v-model="switchStatus"
          class="mt-0 py-3"
          hide-details
          :ripple="false"
          @change="$emit('toggle-layer', id)"
        />
        <v-btn icon @click.stop="$emit('show-info', id)">
          <v-icon>
            mdi-information
          </v-icon>
        </v-btn>
      </div>
    </div>
    <v-expand-transition>
      <div v-if="switchStatus">
        <v-subheader class="px-8">
          Opacity
        </v-subheader>
        <v-slider
          v-model="layerOpacity"
          class="pb-4 px-6"
          hide-details
          :ripple="false"
          :max="1"
          :step="0.1"
          :input="$emit('update-layer-opacity', { id, opacity: layerOpacity })"
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
      opacity: {
        type: Number,
        default: 1,
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
    data: (props) => ({
      switchStatus: props.selected,
      layerOpacity: props.opacity,
    }),
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

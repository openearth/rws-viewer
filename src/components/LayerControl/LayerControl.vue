<template>
  <div>
    <div class="d-flex align-center">
      <v-tooltip top>
        <template #activator="{ on, attrs }">
          <span
            class="sortable-handle py-3"
            :data-id="id"
            :data-parent-ids="parentIds"
            v-bind="attrs"
            v-on="on"
          >
            {{ name }}
          </span>
        </template>
        <span>{{ name }}</span>
      </v-tooltip>
      <div v-if="hasMetadata">
        <v-btn icon @click.stop="showInfo = true">
          <v-icon>
            mdi-information
          </v-icon>
        </v-btn>
        <slot
          name="info"
          :isOpen="showInfo"
          :open="() => showInfo = true"
          :close="() => showInfo = false"
          :showFeedbackDialog="() => showFeedback = true"
        />
        <slot
          name="feedback"
          :isOpen="showFeedback"
          :open="() => showFeedback = true"
          :close="() => showFeedback = false"
        />
      </div>
    </div>
    <v-expand-transition>
      <div v-if="isLayer && selected" class="pt-0 pb-1 pr-5">
        <v-row no-gutters>
          <v-col cols="2">
            <v-tooltip bottom>
              <template #activator="{on, attrs}">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="on"
                  @click="$emit('zoom-to-layer-extent', id)"
                >
                  <v-icon>
                    mdi-magnify-plus-outline
                  </v-icon>
                </v-btn>
              </template>
              <span>Zoom in to layer</span>
            </v-tooltip>
          </v-col>
          <v-col cols="10">
            <v-slider
              v-model="layerOpacity"
              hide-details
              :ripple="false"
              :max="1"
              :step="0.1"
              label="Opacity"
              @end="$emit('update-layer-opacity', { id, opacity: layerOpacity })"
            />
          </v-col>
        </v-row>
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
      hasMetadata: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      layerOpacity: 1,
      showInfo: false,
      showFeedback: false,
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

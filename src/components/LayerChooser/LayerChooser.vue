<template>
  <v-sheet class="layer-chooser">
    <v-text-field
      v-model="searchString"
      :label="$t('searchInAvailableLayerNames')"
      hide-details
      dense
      clearable
      :disabled="onlyActive"
    />
    <div class="layer-chooser__filter-options">
      <v-switch
        v-model="onlyActive"
        class="layer-chooser__only-active-switch"
        :label="$t('onlyActiveLayers')"
      />
      <!-- Discuss if this is a useful feature -->
      <!-- <v-btn
          depressed
          x-small
          @click="expandAll"
        >
          {{ $t('expandAll') }}
        </v-btn>
        <v-btn
          depressed
          x-small
          @click="collapseAll"
        >
          {{ $t('collapseAll') }}
        </v-btn> -->
    </div>

    <v-treeview
      ref="tree"
      class="layer-chooser__tree"
      :value="rasterLayerIds"
      hoverable
      selectable
      dense
      expand-icon="mdi-chevron-down"
      :items="layersWithParents"
      :search="search"
      :filter="activeFilter"
      @input="handleInput"
    >
      <template #prepend="{selected, open, item, indeterminate}">
        <div class="layer-chooser__list-icon">
          <v-icon v-if="item.layer">
            {{ selected ? 'mdi-layers' : 'mdi-layers-outline' }}
          </v-icon>
          <v-icon v-else>
            <template v-if="selected">
              {{ open
                ? `mdi-folder-open${selected ? '' : '-outline'}`
                : `mdi-folder${selected ? '-check' : '-outline'}`
              }}
            </template>
            <template v-else-if="indeterminate">
              {{ open
                ? `mdi-folder-open`
                : `mdi-folder`
              }}
            </template>
            <template v-else>
              {{ open
                ? `mdi-folder-open-outline`
                : `mdi-folder-outline`
              }}
            </template>
          </v-icon>
        </div>
      </template>
      <template #label="{ item, selected }">
        <layer-control
          :id="item.id"
          :name="item.name"
          :selected="selected"
          :parent-ids="item.parentIds.toString()"
          :is-layer="!!item.layer"
          :has-metadata="!!item.metadata.length"
          @update-layer-opacity="updateLayerOpacity"
        >
          <template #info="{ isOpen, close }">
            <layer-info-dialog
              :title="item.name"
              :content="item.metadata"
              :open="isOpen"
              @close="close"
            />
          </template>
        </layer-control>
      </template>
    </v-treeview>
  </v-sheet>
</template>

<script>
  import { difference } from 'ramda'
  import { mapGetters, mapActions } from 'vuex'
  import LayerInfoDialog from '~/components/LayerInfoDialog/LayerInfoDialog'
  import addParentIdToLayers from '~/lib/add-parent-id-to-layers'
  const LayerControl = () => import('~/components/LayerControl/LayerControl')

  export default {
    components: { LayerControl, LayerInfoDialog },

    data: () => ({
      show: true,
      searchString: '',
      value: [],
      onlyActive: false,
    }),

    computed: {
      ...mapGetters('data', [ 'displayLayers' ]),
      ...mapGetters('map', [ 'rasterLayerIds' ]),
      layersWithParents() {
        return addParentIdToLayers(this.displayLayers)
      },
      search() {
        return this.onlyActive ? ':active-only' : this.searchString
      },
    },

    watch: {
      searchString(newValue, oldValue) {
        if (oldValue === '') {
          this.$refs.tree.updateAll(true)
        }
      },
      onlyActive(newValue) {
        newValue && this.$refs.tree.updateAll(true)
      },
    },

    methods: {
      ...mapActions('map', [ 'updateRasterLayerOpacity' ]),
      handleInput(newValue) {
        const added = difference(newValue, this.rasterLayerIds)
        const removed =  difference(this.rasterLayerIds, newValue)

        added.length && this.$emit('select-layers', added)
        removed.length && this.$emit('remove-layers', removed)
      },
      expandAll() {
        this.$refs.tree.updateAll(true)
      },
      collapseAll() {
        this.$refs.tree.updateAll(false)
      },
      activeFilter(item, input, textKey) {
        switch (input) {
        case ':active-only':
          return this.rasterLayerIds.includes(item.id)
        case ':in-active-only':
          return this.rasterLayerIds.includes(item.id) === false
        default:
          return item.layer
            ? item[textKey].toLowerCase().indexOf(input.toLowerCase()) > -1
            : undefined
        }
      },
      updateLayerOpacity({ id, opacity }) {
        this.updateRasterLayerOpacity({ id, opacity })
      },
    },
  }
</script>

<style lang="scss">
.layer-chooser__dialog {
  width: 90vw;
  max-width: 960px;
  height: calc(90vh);
}

.layer-chooser__filter-options {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: $spacing-tiny;
}

.layer-chooser__only-active-switch {
  margin-right: auto !important;
}

.layer-chooser .v-treeview-node__checkbox {
  position: relative;
  top: 0;
  transform: translateY(7px);
  align-self: flex-start;
}

.layer-chooser .v-treeview-node__checkbox:before {
  opacity: 0.001;
}

.layer-chooser .v-treeview-node__prepend {
  position: absolute;
  transform: translate(-125%, 7px);
  pointer-events: none;
  top: 0;
}
</style>

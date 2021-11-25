<template>
  <div v-if="layersAreProvided" ref="root">
    <v-treeview
      hoverable
      :items="layersWithParents"
      :open.sync="openItems"
      open-on-click
      selectable
      @input="setSelectedIds"
    >
      <template #label="{ item, selected }">
        <layer-control
          :id="item.id"
          :name="item.name"
          :is-layer="Boolean(item.layer)"
          :parent-ids="item.parentIds.toString()"
          :selected="selected"
          @show-info="showInfo"
          @update-layer-opacity="updateLayerOpacity"
        />
      </template>
    </v-treeview>
  </div>
</template>

<script>
  import { watch, ref, toRefs, computed } from '@vue/composition-api'

  const LayerControl = () => import('~/components/LayerControl/LayerControl')

  import addIndex from '~/lib/add-index'
  import addParentIdToLayers from '~/lib/add-parent-id-to-layers'
  import findInTree from '~/lib/find-in-tree'

  import useLegend from './useLegend'
  import useSelected from './useSelected'
  import useSortable from './useSortable'

  const deleteIndex = item => {
    delete item.index
    return item
  }

  export default {
    name: 'LayerListControls',
    components: { LayerControl },
    props: {
      layers: {
        type: Array,
        default: () => [],
      },
    },
    setup(props, context) {
      const root = ref(null)
      const openItems = ref([])

      const { layers } = toRefs(props)

      const layersWithParents = computed(() => addParentIdToLayers(layers.value))
      const layersAreProvided = computed(() => layersWithParents.value.length > 0)
      const sortedSelectedLayers = computed(() => {
        const withIndex = addIndex(layers.value)
        return selectedIds.value
          .map(id => findInTree(withIndex, 'id', id))
          .sort((a, b) => b.index - a.index)
          .map(deleteIndex)
      })

      const { setSelectedIds, selectedIds } = useSelected()
      const { activeLegend, setActiveLegend } = useLegend(selectedIds)
      const { onSortingChange } = useSortable(layers, root, openItems)

      const showInfo = (id) => {
        console.log('show layer info for id:', id)
        context.root.$store.dispatch('data/setLayerDialogOpen', { open: true }, { root: true })
      }

      const updateLayerOpacity = ({ id, opacity }) => {
        context.root.$store.dispatch('map/updateRasterLayerOpacity', { id, opacity }, { root: true })
      }

      onSortingChange(sortedLayers => context.emit('layer-sorting-change', sortedLayers))

      watch(activeLegend, newActiveLegend => context.emit('legend-change', newActiveLegend))
      watch(sortedSelectedLayers, sortedSelected => context.emit('active-layers-change', sortedSelected))

      return {
        root,
        openItems,
        layersWithParents,
        layersAreProvided,
        activeLegend,
        setActiveLegend,
        setSelectedIds,
        showInfo,
        updateLayerOpacity,
      }
    },
  }
</script>

<style lang="scss">
  .v-treeview-node__checkbox {
    margin-top: $spacing-small;
    margin-bottom: auto;
  }
</style>

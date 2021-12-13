<template>
  <v-treeview
    hoverable
    selectable
    :items="layersWithParents"
    :value="value"
    @input="handleInput"
  >
    <template #label="{ item, selected }">
      <layer-control
        :id="item.id"
        :name="item.name"
        :selected="selected"
        :parent-ids="item.parentIds.toString()"
        :is-layer="Boolean(item.layer)"
      />
    </template>
  </v-treeview>
</template>

<script>
  import { difference } from 'ramda'
  import { defineComponent } from '@vue/composition-api'
  import addParentIdToLayers from '~/lib/add-parent-id-to-layers'
  const LayerControl = () => import('~/components/LayerControl/LayerControl.vue')


  export default defineComponent({
    name: 'LayerTree',
    components: { LayerControl },
    props: {
      layers: {
        type: Array,
        default: () => [],
      },
      value: {
        type: Array,
        default: () => [],
      },
    },

    computed: {
      layersWithParents() {
        return addParentIdToLayers(this.layers)
      },
    },

    methods: {
      handleInput(newValue) {
        const added = difference(newValue, this.value)
        const removed = difference(this.value, newValue)

        if (added.length) {
          this.$emit('select-layers', added)
        }

        if (removed.length) {
          this.$emit('deselect-layers', removed)
        }

        this.$emit('input', newValue)
      },
    },
  })
</script>

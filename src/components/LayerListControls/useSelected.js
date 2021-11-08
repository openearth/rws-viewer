/** @typedef {String[]} SelectedIds */
/** @typedef {{ value: SelectedIds }} SelectedIdsRef */
import { ref } from '@vue/composition-api'

/**
 * @type {SelectedIds}
 */
const selectedIds = ref([])

/**
 * @param {SelectedIds} newList
 */
function setSelectedIds(newList) {
  selectedIds.value = newList
}

export default function useSelected() {
  return {
    selectedIds,
    setSelectedIds,
  }
}

import { ref, watch } from '@vue/composition-api'
import last from '~/lib/last'

export default function useLegend(selectedIds) {
  const activeLegend = ref('')

  /**
   * Set the active legend to a new value, or clear it when the same value is provided
   */
  function setActiveLegend(id) {
    activeLegend.value = activeLegend.value === id
      ? ''
      : id
  }

  /**
   * Handler for when `selectedIds` change.
   */
  function handleSelectedIdsChange(newSelectedIds) {
    if (newSelectedIds.includes(activeLegend.value)) {
      return
    }

    const lastSelectedId = last(newSelectedIds)
    setActiveLegend(lastSelectedId)
  }

  watch(selectedIds, handleSelectedIdsChange)

  return {
    activeLegend,
    setActiveLegend,
  }
}

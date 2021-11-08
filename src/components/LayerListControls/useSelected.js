import { ref } from '@vue/composition-api'

const selectedIds = ref([])

function setSelectedIds(newList) {
  selectedIds.value = newList
}

export default function useSelected() {
  return {
    selectedIds,
    setSelectedIds,
  }
}

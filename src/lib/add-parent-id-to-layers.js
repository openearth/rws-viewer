/**
 * Checks if the item is a LayerGroup
 */
const isLayerGroup = item => Boolean(item.children)

/**
 * [Recursive]
 * Adds ParentIds to all Layers and LayerGroups
 */
function addParentIdToLayers(items, parentIds = []) {
  return items.map(item => {
    if (isLayerGroup(item) === false) {
      return { ...item, parentIds }
    }

    const children = addParentIdToLayers(item.children, [ ...parentIds, item.id ])
    return { ...item, children, parentIds }
  })
}

export default addParentIdToLayers

const isGroup = item => Boolean(item.children)
const isLayer = item => Boolean(item.url)

/**
 * [Recursive]
 * Finds an item in the LayerGroup based on the provided property and value
 */
function findInTree(source, property, value) {
  return source.reduce((foundItem, layerOrgroup) => {
    // If we have found our item before, return it right away
    if (foundItem) {
      return foundItem
    }

    // If the current item is a LayerGroup, search through its children
    if (isGroup(layerOrgroup)) {
      return findInTree(layerOrgroup.children, property, value)
    }

    // If the current item is a layer, check if the property/value match on the layer.
    // When it does, the target is found. Return the target
    if (isLayer(layerOrgroup) && layerOrgroup[property] === value) {
      return layerOrgroup
    }

    // The current item is a layer, but not the target layer, return an explicit null
    return null
  }, null)
}

export default findInTree

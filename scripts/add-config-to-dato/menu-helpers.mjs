export const removeFromStructureBy = fn => layer => {
  if (layer.children) {
    layer.children = layer.children.filter(fn).map(removeFromStructureBy(fn))
  }

  if (layer.children.length === 0) {
    delete layer.children
  }

  return layer
}

export const removeIdsFromStructure = layer => {
  if (layer.children) {
    layer.children = layer.children
      .map(({ id, ...child }) => ({ ...child }))
      .map(removeIdsFromStructure)
  }
  return layer
}

export const replaceLayerWithId = layerIdMap => layer => {
  if (layer.children) {
    layer.children = layer.children
      .map(child => layerIdMap[`${ child.url }:${ child.layer }`] || child)
      .map(replaceLayerWithId(layerIdMap))
  }
  return layer
}

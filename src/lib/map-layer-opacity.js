
export default (activeFlattenedLayers, wmsLayers) => {
  if (!activeFlattenedLayers.length || !wmsLayers.length) {
    return wmsLayers
  }

  return wmsLayers.map(wmsLayer => {
    const existingRasterLayer = activeFlattenedLayers.find(rasterLayer => rasterLayer.id === wmsLayer.id)

    if (existingRasterLayer?.opacity) {
      wmsLayer.opacity = existingRasterLayer.opacity
    }

    return wmsLayer
  })
}


export default (rasterLayers, wmsLayers) => {
  if (!rasterLayers.length || !wmsLayers.length) {
    return wmsLayers
  }

  return wmsLayers.map(wmsLayer => {
    const existingRasterLayer = rasterLayers.find(rasterLayer => rasterLayer.id === wmsLayer.id)

    if (existingRasterLayer?.opacity) {
      wmsLayer.opacity = existingRasterLayer.opacity
    }

    return wmsLayer
  })
}

/**
 * Reads the layers.
 * If layer has time filter set to true
 * then adds extra property time equal to timestamp
 * 
 * Warning!! since we have one timeslider all layers with time
 * 
 *  */

export default (layers, timestamp) => {
  if (!layers.length ) {
    return []
  }
  if (!timestamp) {
    return layers
  }

  return layers.map(layer => {
    if (layer?.timeFilter) {
      return {
        ...layer,
        time: timestamp,
      }
    }
  })
}

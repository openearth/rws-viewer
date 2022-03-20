/**
 * For every layer with timeFilter true
 * adds the selectedTimestamp
 * 
 * 
 *  */

export default (layers, timestamp) => {
  console.log('in function', layers, timestamp)
  if (!layers.length ) {
    return []
  }
  if (!timestamp) {
    return layers
  }

  return layers.map(layer => {
    console.log('layer in function', layer)
    if (layer?.timeFilter) {
      console.log('layer has timefilter', layer)
      return {
        ...layer,
        time: timestamp,
      }
    }
  })
}

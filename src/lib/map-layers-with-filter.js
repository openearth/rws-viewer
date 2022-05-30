/**
 * Maps the layers.
 * If layer is active on filters tab
 * It adds to its properties the timestamp and the filter
 * 
 *  */

export default (layers, filtersLayerId, timestamp, filter) => {
  if (!layers.length ) {
    return []
  }
  if (!filtersLayerId) {
    return layers
  }

  return layers.map(layer => {
    if (layer.id === filtersLayerId) {
      return {
        ...layer,
        ...(timestamp) && { time: timestamp },
        ...(filter) && { filter: filter },
      }
    } else {
      return layer
    }
  })
}



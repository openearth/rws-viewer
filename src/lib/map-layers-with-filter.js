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
//TODO: see a more simple implementation
  return layers.map(layer => {
    if (layer.id === filtersLayerId) {
      if (filter) {
              return {
        ...layer,
        ...(timestamp) && { time: timestamp },
        ...(filter) && { filter: filter },
      }
      } else {
        return {
             ...layer,
        ...(timestamp) && { time: timestamp },
        }
      }

    } else {
      return layer
    }
  })
}



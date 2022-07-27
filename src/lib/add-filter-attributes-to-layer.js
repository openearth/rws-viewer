/**
 * Find layer that is filtered from the activeFlattenedLayers
 * Add extra attributes and return it
 *
 *
 *  */

export default (activeFlattenedLayers, filteredLayerId, timestamp, filter) => {

  const layer = activeFlattenedLayers.find(layer => layer.id === filteredLayerId)
  return {
    ...layer,
    ...(timestamp) && { time: timestamp },
    ...(filter) && { filter: filter },
  }
}

/**
 * Find layer that is filtered from the activeFlattenedLayers
 * Add extra attributes and return it
 * 
 * 
 *  */

export default (activeFlattenedLayers, filtersLayerId, timestamp, filter) => {

  const layer = activeFlattenedLayers.find(layer => layer.id === filtersLayerId)
  return {
    ...layer,
    ...(timestamp) && { time: timestamp },
    ...(filter) && { filter: filter },
  }
}

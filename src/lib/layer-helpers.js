import { compose, flatten, map, props, uniq, sort } from 'ramda'

const pickLayersRecursive = el => {
  if(Array.isArray(el)) return el.map(pickLayersRecursive)
  if(el.children) return el.children.map(pickLayersRecursive)
  if(el.layer) return el
}

export const flattenLayers = compose(
  flatten,
  pickLayersRecursive,
)

export const getLayersTags = compose(
  sort((a, b) => a.localeCompare(b)),
  uniq,
  flatten,
  map(props([ 'tags' ])),
)

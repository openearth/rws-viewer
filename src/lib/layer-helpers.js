import { compose, flatten, map, props, uniq } from 'ramda'

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
  uniq,
  flatten,
  map(props([ 'tags' ])),
)

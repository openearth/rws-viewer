import { compose, flatten, map, props, uniq, sort, filter, includes, prop } from 'ramda'

const existsIn = list => value => includes(value, list)
const idIncludedIn = ids => compose(existsIn(ids), prop('id'))

const pickLayersRecursive = el => {
  if (Array.isArray(el)) {
    return el.map(pickLayersRecursive)
  }

  if (el.children) {
    return el.children.map(pickLayersRecursive)
  }

  if (el.layer) {
    return el
  }
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

export const getLayersById = (layers, ids) => 
  compose(
    filter(idIncludedIn(ids)),
    flatten,
    pickLayersRecursive,
  )(layers)
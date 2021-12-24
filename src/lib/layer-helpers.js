import {
  compose,
  filter,
  flatten,
  includes,
  isEmpty,
  map,
  prop,
  props,
  sort,
  uniq,
} from 'ramda'

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

export const omitLayers = (layers, ids) => {
  const nonMatchingLayer = layer => ids.includes(layer.id) === false
  const withChildren = layer => isEmpty(layer.children) === false

  const removeMatchingChildren = layer => {
    let children

    if (layer.children) {
      children = layer.children
        .filter(nonMatchingLayer)
        .map(removeMatchingChildren)
        .filter(withChildren)
    }

    return {
      ...layer,
      ...(children ? { children } : {}),
    }
  }

  return layers
    .map(removeMatchingChildren)
    .filter(withChildren)
}

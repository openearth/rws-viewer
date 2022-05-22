import axios from 'axios'
import { map, uniq, pipe, find, propEq } from 'ramda'
import { getType } from '~/lib/service-helpers'
import extractTimeExtentFromCapabilities from  '~/lib/extract-time-extent-from-capabilities'
const convert = require('xml-js')


import {
  WCS_LAYER_TYPE,
  WFS_LAYER_TYPE,
  WMS_LAYER_TYPE,
} from '~/lib/constants'



const getTagContent = tag => tag.textContent
const getTags = tagName => root =>
  [ ...root ]
    .map(el => [ ...el.getElementsByTagName(tagName) ])
    .flat()

function createParameters(type) {
  switch (type) {
    case WCS_LAYER_TYPE:
      return 'service=WCS&request=GetCapabilities'
    case WMS_LAYER_TYPE: //TODO: fix switch doesn't work correct as always fall under WFS category
    case WFS_LAYER_TYPE:
      return 'service=WFS&request=GetCapabilities'
    default:
      throw new Error(`Could not create parameters for ${ type }`)
  }
}


export async function getCapabilities(service, type) {
  const _type = type || getType(service)
  const serviceUrl = new URL(service)
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`

  const { data } = await axios(`${ servicePath }?${ createParameters(_type) }`)
  return JSON.parse(convert.xml2json(data, { compact: true, spaces: 2 }))
}

export async function getWmsCapabilities(service) {
  //the getcapabilities returns the capabilities of the layers in the workspace.
  const serviceUrl = new URL(service)
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`
  
  const { data } = await axios(`${ servicePath }?service=WMS&version=1.1.1&request=GetCapabilities`)

  return JSON.parse(convert.xml2json(data, { compact: true, spaces: 2 }))
}

export function getSupportedOutputFormats(type, capabilities) {
  const outputFormats = pipe(
      () => [ ...capabilities.querySelectorAll('[name="outputFormat"]') ],
      getTags('ows:AllowedValues'),
      getTags('ows:Value'),
      map(getTagContent),
      uniq,
    )

  const formatSupported = pipe(
      () => capabilities,
      getTags('wcs:ServiceMetadata'),
      getTags('wcs:formatSupported'),
      map(getTagContent),
      uniq,
    )

  switch (type) {
    case WCS_LAYER_TYPE:
      return formatSupported()
    case WMS_LAYER_TYPE:
    case WFS_LAYER_TYPE:
      return outputFormats()
    default:
      throw new Error(`Could not create output formats for ${ type }`)
  }
}

export function getLayerTimeExtent(capabilities, layer) {
  const timeExtent = extractTimeExtentFromCapabilities(capabilities, layer)
  return timeExtent
}


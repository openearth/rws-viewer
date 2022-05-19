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

const getParentNode = tag => tag.parentNode



const getTags = tagName => root =>
  [ ...root ]
    .map(el => [ ...el.getElementsByTagName(tagName) ])
    .flat()

const findLayer = id => layers =>
  [ ...layers ]
    .find(layer => layer.textContent === id)



function createParameters(type) {
  if (type === WCS_LAYER_TYPE) {
    return 'service=WCS&request=GetCapabilities'
  }
  if (type === WFS_LAYER_TYPE) {
    return 'service=WFS&request=GetCapabilities'
  }
}


 
//TODO: remove hardcode type wfs

export async function getCapabilities(service, type) {
  //const _type = type || getType(service)
  const _type = type
  const serviceUrl = new URL(service)
  
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`
  const { data } = await axios(`${ servicePath }?${ createParameters(_type) }`)
  return new DOMParser().parseFromString(data, 'text/xml')
}

export async function getWmsCapabilities(service) {
  /** 
 * The getWmsCapabilitis is made when a layer is clicked. The 
 * 
 * */ 
  //the getcapabilities returns the capabilities of the layers in the workspace. need to search for the layer first
  const serviceUrl = new URL(service)
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`
  
  const { data } = await axios(`${ servicePath }?service=WMS&version=1.3.0&request=GetCapabilities`)

  return new DOMParser().parseFromString(data, 'text/xml')
  //TODO: 
  //return JSON.parse(convert.xml2json(data, { compact: true, spaces: 2 }))
}

export function getSupportedOutputFormats(type, capabilities) {
  
  //wfs works correct
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

  if (type === WCS_LAYER_TYPE) {
    return formatSupported()
  }
  if (type === WFS_LAYER_TYPE) {
    return outputFormats()
  }

}

export function getLayerTimeExtent(capabilities, layer) {
  const timeExtent = extractTimeExtentFromCapabilities(capabilities, layer)
  return timeExtent
}

export function getFormatOfLayer(capabilities, layer) {
/**
 * function that reads the wms capabilities response of the workpspace
 * find the given layer
 * reads the layer properties like keywords and extent. 
 * TODO: extent is read in the getLayerTimeExtent. Eventually read it here?
 *  * */
  const keywords = pipe(
    () => [ ...capabilities.querySelectorAll('[queryable="1"]') ],
    getTags('Name'),
    findLayer(layer),
    getParentNode,
    el => el.getElementsByTagName('KeywordList'),
    getTags('Keyword'),
    map(getTagContent),
  )()
 
 return [ 'features', 'wfs' ].some(val => keywords.includes(val)) ? 'wfs' 
        :keywords.includes('wcs') ? 'wcs' 
        : null
}


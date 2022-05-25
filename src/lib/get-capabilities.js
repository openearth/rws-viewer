import axios from 'axios'
import { map, uniq, pipe, find, propEq } from 'ramda'



import {
  WCS_LAYER_TYPE,
  WFS_LAYER_TYPE,
} from '~/lib/constants'



const getTagContent = tag => tag.textContent
const getParentNode = tag => tag.parentNode
const textToArray = text => text.split(',')

const getTags = tagName => root =>
  [ ...root ]
    .map(el => [ ...el.getElementsByTagName(tagName) ])
    .flat()

const findLayer = id => (layers) => {
  
  let layer = layers.find(layer => layer.textContent === id)
  if (layer) {
    return layer
  } else {
    const idWithoutWorkspace = id.split(':')[1]
    layer = layers.find(layer => layer.textContent === idWithoutWorkspace)
    return layer
  } 
}



function createParameters(type) {
  if (type === WCS_LAYER_TYPE) {
    return 'service=WCS&request=GetCapabilities'
  }
  if (type === WFS_LAYER_TYPE) {
    return 'service=WFS&request=GetCapabilities'
  }
}


 
export async function getCapabilities(service, type) {
  /**
   * GetCapabilities wfs or wcs based on the input type
   * create parameters and make the request
   * parse it as a dom element
   */
  const _type = type
  const serviceUrl = new URL(service)
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`
  const { data } = await axios(`${ servicePath }?${ createParameters(_type) }`)
  return new DOMParser().parseFromString(data, 'text/xml')
}

export async function getWmsCapabilities(service) {
  /** 
 * The getWmsCapabilitis is made when a layer is clicked.  
 * 
 * */ 
  //the getcapabilities returns the capabilities of the layers in the workspace. need to search for the layer first
  const serviceUrl = new URL(service)
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`
  
  const { data } = await axios(`${ servicePath }?service=WMS&version=1.3.0&request=GetCapabilities`)

  return new DOMParser().parseFromString(data, 'text/xml')

}

export function getSupportedOutputFormats(type, capabilities) {
  
  //wfs
  const outputFormats = pipe(
      () => [ ...capabilities.querySelectorAll('[name="outputFormat"]') ],
      getTags('ows:AllowedValues'),
      getTags('ows:Value'),
      map(getTagContent),
      uniq,
    )
  //wcs
  const formatSupported = pipe(
      () => capabilities,
      el => el.getElementsByTagName('wcs:Capabilities'),
      getTags('wcs:ServiceMetadata'),
      getTags('wcs:formatSupported'),
      map(getTagContent),
    )

  if (type === WCS_LAYER_TYPE) {
    return formatSupported()
  }
  if (type === WFS_LAYER_TYPE) {
    return outputFormats()
  }

}

//TODO: I am altering this function to get also the timeExtent if is is there.
export function getLayerProperties(capabilities, layer) {
/**
 * function that reads the wms capabilities response of the workpspace
 * find the given layer
 * reads the layer keywords. 
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
  console.log('keywords', keywords )
  const serviceType = [ 'features', 'wfs', 'FEATURES', 'WFS' ].some(val => keywords.includes(val)) ? 'wfs' 
        :[ 'WCS', 'GeoTIFF', 'wcs' ].some(val => keywords.includes(val)) ? 'wcs' 
        : null

  const timeExtent = pipe(
    () => [ ...capabilities.querySelectorAll('[queryable="1"]') ],
    getTags('Name'),
    findLayer(layer),
    getParentNode,
    el =>[ ...el.getElementsByTagName('Dimension') ],
    map(getTagContent),
    map(textToArray),
    (array) => array.flat(),
  )()
  
  return { serviceType, timeExtent }
}



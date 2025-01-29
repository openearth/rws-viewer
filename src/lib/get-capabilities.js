/* Contains any functions and utils related to the wms, wfs and wcs getCapabilities */
import axios from 'axios'
import { map, uniq, pipe } from 'ramda'

import {
  WCS_LAYER_TYPE,
  WFS_LAYER_TYPE,
} from '~/lib/constants'


const getTagContent = tag => tag.textContent
const getParentNode = tag => tag.parentNode
const textToArray = text => text.split(',') //split at comma


const getTags = (tagName) => root =>
  [ ...root ]
    .map(el => [ ...el.getElementsByTagName(tagName) ])
    .flat()

const getChildTags = (tagName) => root =>
  [ ...root ]
    .map(el => [ ...el.querySelectorAll(`:scope > ${ tagName }`) ])
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

function readBbox(bboxElement) {
  const bbox = [ [ bboxElement.getElementsByTagName('westBoundLongitude')[0].textContent,
  bboxElement.getElementsByTagName('southBoundLatitude')[0].textContent ], 
  [ bboxElement.getElementsByTagName('eastBoundLongitude')[0].textContent,
  bboxElement.getElementsByTagName('northBoundLatitude')[0].textContent ] ]
  return bbox
}

function createParameters(type) {
  if (type === WCS_LAYER_TYPE) {
    return 'service=WCS&request=GetCapabilities'
  }
  if (type === WFS_LAYER_TYPE) {
    return 'service=WFS&request=GetCapabilities'
  }
}

async function getServiceType(serviceUrl) {
  try {
     await axios.get(`${serviceUrl.replace('wms', 'wfs') }?${ createParameters('wfs') }`)
     return 'wfs'
  } catch (error) {
      try {
          await axios.get(`${ serviceUrl.replace('wfs', 'wcs') }?${ createParameters('wcs') }`)
          return 'wcs'
      } catch (error) {
          return 'Unknown'
      }
  }
}
 
export async function getCapabilities(service, type) {
  /**
   * GetCapabilities wfs or wcs based on the input type
   * create parameters and make the request
   * parse it as a dom element
   */

  
  const serviceUrl = new URL(service)
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`
 
  
  try {
   
    const {data} = await axios(`${ servicePath }?${ createParameters(type) }`)
    let parsedData = new DOMParser().parseFromString(data, 'text/xml');
    if (parsedData.getElementsByTagName('ServiceExceptionReport').length > 0) {
      throw new Error('ServiceExceptionReport found');
    }
    return parsedData

  }  catch (error) {
    const {data} = await axios (`${servicePath.replace('wms', type) }?${ createParameters(type) }`)
    return new DOMParser().parseFromString(data, 'text/xml')
  } 
}

export async function getWmsCapabilities(service) {
  /** 
 * The getWmsCapabilitis is made when a layer is clicked.  
 * 
 * */ 
  //the getcapabilities returns the capabilities of the layers in the workspace. need to search for the layer first
  const serviceUrl = new URL(service)
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`
  const { data } = await axios(`${ servicePath }?service=WMS&request=GetCapabilities`)

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

/**
 * Determines if the layer is a raster layer
 */
export function isRasterLayer(type, capabilities, layer) {
  if (type !== 'wcs') {
    return false
  }

  const findCoverageForLayer = id => (layers) => {
    id = id.replace(/:/, '__')
    return layers.find(layer => layer.textContent.trim() === id)
  }

  const keywords = pipe(
    () => [ ...capabilities.querySelectorAll('CoverageId') ],
    findCoverageForLayer(layer),
    getParentNode,
    el => el.getElementsByTagName('ows:Keywords'),
    getTags('ows:Keyword'),
    map(getTagContent),
  )()

  return keywords.includes('GeoTIFF')
}

export async function getLayerProperties(capabilities, layerObject) {
/**
 * function that reads the wms capabilities response of the workpspace
 * 1. find the given layer
 * 2. extracts:   
 *    -wmsVersion
 *    -bbox of layer
 *    -keywords (that contain the service type)
 *    -service type of layer (wfs or wcs)
 *    -time extent of layer
 *  
 *  * */
  const {layer} = layerObject
  const serviceUrl = layerObject.downloadUrl || layerObject.url
  const wmsVersion = pipe(
    () => capabilities.querySelector('WMS_Capabilities'),
    el => el.getAttribute('version'),
  )()

  const bbox = pipe(
    () => [ ...capabilities.querySelectorAll('[queryable="1"], [queryable="0"], [opaque="0"]') ],
    getChildTags('Name'),
    findLayer(layer),
    getParentNode,
    el => el.querySelector('EX_GeographicBoundingBox'),
    readBbox,
  )()
  
  let keywords = pipe(
    () => [ ...capabilities.querySelectorAll('[queryable="1"], [queryable="0"], [opaque="0"]') ],
    getChildTags('Name'),
    findLayer(layer),
    getParentNode,
    el => el.getElementsByTagName('KeywordList'),
    getTags('Keyword'),
    map(getTagContent),  
  )()

  if (!keywords.length) {
    
    keywords = pipe(
      () => [ capabilities.querySelector('KeywordList') ],  
      getTags('Keyword'), 
      map(getTagContent), 
    )()
    
  }
 
  let serviceType = [ 'features', 'wfs', 'FEATURES', 'WFS' ].some(val => keywords.includes(val)) ? 'wfs' 
        :[ 'WCS', 'GeoTIFF', 'wcs' ].some(val => keywords.includes(val)) ? 'wcs' 
        : null
  

  if (!serviceType) {
      serviceType = await getServiceType(serviceUrl)
  }
  
  const timeExtent = pipe(
    () => [ ...capabilities.querySelectorAll('[queryable="1"], [queryable="0"], [opaque="0"]') ],
    getChildTags('Name'),
    findLayer(layer),
    getParentNode,
    el =>[ ...el.getElementsByTagName('Dimension') ],
    map(getTagContent),
    map(textToArray),
    (array) => array.flat(),
  )()
 
  return { serviceType, timeExtent, wmsVersion, bbox }
}



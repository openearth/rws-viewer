/* Contains any functions and utils related to the wms, wfs and wcs getCapabilities */
import axios from 'axios'
import { map, uniq, pipe, filter } from 'ramda'
import checkMapServiceType from './check-map-service-type'

import {
  WCS_LAYER_TYPE,
  WFS_LAYER_TYPE,
} from '~/lib/constants'



const getTagContent = tag => tag.textContent
const getParentNode = tag => tag.parentNode
const textToArray = text => text.split(',') //split at comma


const getTags = (tagName) => root =>
  root ? [ ...root ]
    .map(el => [ ...el.getElementsByTagName(tagName) ])
    .flat() : []

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

async function getDataServiceType(serviceUrl, wmsLayerName) {
  /**
 * Function to determine if the service is WFS or WCS based on the GetCapabilities response
 * Create WFS and WCS URLs based on the service URL
 * First Quick check if one of the requests fails to determine the service type
 * If quick check failes then detailed check:
 *    Parse the responses as XML
 *    Check if the layer exists in the WFS or WCS response
 *    Return 'wfs', 'wcs' or 'Unknown' based on the results
 *    
 *    Hanlde network errors that come out from the checks
 */

  const parser = new DOMParser()

  const tryServiceType = async (url, type) => {
    try {
      const res = await axios.get(url, { validateStatus: () => true })
      if (res.status >= 200 && res.status < 300) {
        console.log(`[Handled] ${ type.toUpperCase() } detected successfully: ${ url }`)
        return res.data
      } else if (res.status === 404) {
        console.log(`[Handled] ${ type.toUpperCase() } check failed with 404: ${ url }`)
      } else {
        console.log(`[Handled] ${ type.toUpperCase() } check failed with status ${ res.status }: ${ url }`)
      }
    } catch (err) {
      console.log(`[Handled] ${ type.toUpperCase() } network or Axios error: ${ url }`, err)
    }
    return null
  }
  const wfsUrl = `${ serviceUrl.replace(/(wms|wcs)/i, 'wfs') }?${ createParameters('wfs') }`
  const wcsUrl = `${ serviceUrl.replace(/(wms|wfs)/i, 'wcs') }?${ createParameters('wcs') }`

 
  const [ wfsData, wcsData ] = await Promise.all([
    tryServiceType(wfsUrl, 'wfs'),
    tryServiceType(wcsUrl, 'wcs')
  ])
 
  if (wfsData && !wcsData) {
return 'wfs'
}
  if (!wfsData && wcsData) {
return 'wcs'
}
  if (!wfsData && !wcsData) {
return 'Unknown'
}

  try {
    const wfsXml = parser.parseFromString(wfsData, 'text/xml')
    const wcsXml = parser.parseFromString(wcsData, 'text/xml')

    // Extract from both ows:Title and Title elements for WFS
    const owsTitles = Array.from(wfsXml.getElementsByTagName('ows:Title')).map(el => el.textContent)
    const plainTitles = Array.from(wfsXml.getElementsByTagName('Title')).map(el => el.textContent)
    const wfsLayers = [ ...new Set([ ...owsTitles, ...plainTitles ]) ]
    
    // Keep WCS as-is
    const wcsLayers = Array.from(wcsXml.getElementsByTagName('ows:Title')).map(el => el.textContent)
    


    if (wfsLayers.includes(wmsLayerName)) {
return 'wfs'
}
    if (wcsLayers.includes(wmsLayerName)) {
return 'wcs'
}
  } catch (err) {
    console.log('[Handled] Error parsing GetCapabilities XML:', err)
  }
  return 'Unknown'
}

export async function getDataServicesCapabilities(service, type) {
  /**
   * GetCapabilities wfs or wcs based on the input type
   * create parameters and make the request
   * parse it as a dom element
   */

  
  const serviceUrl = new URL(service)
 
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`
  try {
    const { data } = await axios(`${ servicePath }?${ createParameters(type) }`)
    let parsedData = new DOMParser().parseFromString(data, 'text/xml');
    if (parsedData.getElementsByTagName('ServiceExceptionReport').length > 0) {
      throw new Error('ServiceExceptionReport found');
    }
    return parsedData

  }  catch (error) {
    const { data } = await axios (`${ servicePath.replace('wms', type) }?${ createParameters(type) }`)
    return new DOMParser().parseFromString(data, 'text/xml')
  } 
}

export async function getMapServicesCapabilities(service) {
  /** 
 * The getMapServicesCapabilitis is made when a layer is clicked.  
 * 
 * */ 
  //the getcapabilities returns the capabilities of the layers in the workspace. Need to search for the layer first


  const mapServiceType = checkMapServiceType(service)

  const serviceUrl = new URL(service)
  const servicePath = `${ serviceUrl.origin }${ serviceUrl.pathname }`

  let response;
  if (mapServiceType === 'wms') {
    response = await axios(`${ servicePath }?service=WMS&request=GetCapabilities`)
    
  } else if (mapServiceType === 'wmts') {
    response = await axios(`${ servicePath }?service=WMTS&request=GetCapabilities`)
    
  }
  return new DOMParser().parseFromString(response.data, 'text/xml')

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
async function readWmsCapabilitiesProperties(capabilities, layerObject) {
/**
 * function that reads the wms capabilities response of the workpspace
 * 1. find the given layer
 * 2. extracts:   
 *    -wmsVersion
 *    -bbox of layer
 *    -keywords (that contain the data service type)
 *    -service type of layer (wfs or wcs)
 *    -time extent of layer
 *  
 *  * */
  const { layer } = layerObject
  const serviceUrl = layerObject.downloadUrl || layerObject.url

  const mapServiceVersion = pipe(
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
      () => [ capabilities.querySelector('KeywordList') ].filter(Boolean),  
      getTags('Keyword'), 
      map(getTagContent), 
    )()
    
  }
 
  let dataServiceType = [ 'features', 'wfs', 'FEATURES', 'WFS' ].some(val => keywords.includes(val)) ? 'wfs' 
        :[ 'WCS', 'GeoTIFF', 'wcs' ].some(val => keywords.includes(val)) ? 'wcs' 
        : null
  

  if (!dataServiceType) {
      dataServiceType = await getDataServiceType(serviceUrl, layer)
   
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
  return { dataServiceType, timeExtent, mapServiceVersion, bbox }
}

async function readWmtsCapabilitiesProperties(capabilities, layerObject) {
  /**
 * function that reads the wms capabilities response of the workpspace
 * 1. find the given layer
 * 2. extracts:   
 *    -mapVersion
 *    -bbox of layer
 *    -keywords (that contain the data service type)
 *    -service type of layer (wfs or wcs)
 *    -time extent of layer
 *  
 *  * */

  const { layer } = layerObject
  const mapServiceVersion = pipe(
    () => capabilities.querySelector(`Capabilities`),
    (el) => el.getAttribute("version")
  )();
  const acceptedFormats = pipe(
    () => [ ...capabilities.querySelectorAll('Layer') ],
    filter(el => {
      return el.getElementsByTagName('ows:Identifier')[0].textContent === layer
    }),
    getTags('Format'),
    map(getTagContent),
    uniq,
  )()

 const bbox = pipe(
  () => [ ...capabilities.querySelectorAll('Layer') ],
  filter(el => {
    return el.getElementsByTagName('ows:Identifier')[0].textContent === layer;
  }),
  (els) => els[0],
  el => el.getElementsByTagName('ows:WGS84BoundingBox')[0],
  (bboxElement) => [
    parseFloat(bboxElement.getElementsByTagName('ows:LowerCorner')[0].textContent.split(' ')[0]),
    parseFloat(bboxElement.getElementsByTagName('ows:LowerCorner')[0].textContent.split(' ')[1]),
    parseFloat(bboxElement.getElementsByTagName('ows:UpperCorner')[0].textContent.split(' ')[0]),
    parseFloat(bboxElement.getElementsByTagName('ows:UpperCorner')[0].textContent.split(' ')[1])
  ]
)();

  
  const workspaceLayer =  layerObject.layer.split(":")
  const layerName = workspaceLayer.pop();
  const workspace = workspaceLayer.pop();
  // for the wcs/wfs reqeusts we need to change the url to the wms url of the service
  const wmsServiceUrl = layerObject.url.replace('/gwc/service/wmts', `/${ workspace }/wms`)
  const dataServiceType = await getDataServiceType(wmsServiceUrl, layerName)
  return { dataServiceType, acceptedFormats, mapServiceVersion, bbox, wmsServiceUrl }
}
export async function getLayerProperties(capabilities, layerObject) {
  const mapServiceType = checkMapServiceType(layerObject.url)
  if (mapServiceType === 'wms'){
    return readWmsCapabilitiesProperties(capabilities, layerObject)
  } else if (mapServiceType === 'wmts') {
    return readWmtsCapabilitiesProperties(capabilities, layerObject)
  }
}



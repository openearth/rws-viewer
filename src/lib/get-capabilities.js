import { map, flatten, uniq, pipe } from 'ramda'
import axios from 'axios'
import { getType } from '~/lib/service-helpers'
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
    case WMS_LAYER_TYPE:
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
  return new DOMParser().parseFromString(data, 'text/xml')
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

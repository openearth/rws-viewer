import { stringify } from 'query-string'
import {
  COORDINATES_HANDLE,
  WCS_LAYER_TYPE,
  WFS_LAYER_TYPE,
  WMS_LAYER_TYPE,
} from '~/lib/constants'

const FILTER_TEMPLATE = `
  <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
    <ogc:Intersects>
      <ogc:PropertyName />
      <gml:Polygon xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:4326">
        <gml:exterior>
          <gml:LinearRing>
            <gml:posList>${ COORDINATES_HANDLE }</gml:posList>
          </gml:LinearRing>
        </gml:exterior>
      </gml:Polygon>
    </ogc:Intersects>
  </ogc:Filter>
`

export const hasWcsTypeUrl = (layer = {}) => Boolean(layer?.downloadUrl.endsWith(WCS_LAYER_TYPE))

export const hasWfsTypeUrl = (layer = {}) => Boolean(layer?.downloadUrl.endsWith(WFS_LAYER_TYPE))

export const hasWmsTypeUrl = (layer = {}) => Boolean(layer?.url.endsWith(WMS_LAYER_TYPE))

const createWfsParameters = ({ layer = '', filter = '' }) => stringify({
  'typeName': layer,
  'request': 'GetFeature',
  'Content-Disposition': 'attachment',
  'filename': layer + '.csv',
  'srsName': 'EPSG:4326',
  'service': 'WFS',
  'version': '1.1.0',
  'outputFormat': 'csv',
  'GetLayers': layer,
  ...(filter && { 'filter': filter }),
})

const createWcsParameters = (layer = '') => stringify({
  'request': 'GetCoverage',
  'CoverageId': layer,
  'service': 'WCS',
  'version': '2.0.1',
  'format': 'image/tiff',
})

export function createDownloadFilter(coordinates = '') {
  const coordinatesArray = coordinates.split(' ')
  const validCoordinates = ((coordinatesArray.length / 2) - 1) >= 3 // 3 = triangle, 4 = rectangle, 5+ = polygon
  let filter = null

  if (validCoordinates) {
    filter = FILTER_TEMPLATE.replace(COORDINATES_HANDLE, coordinates)
  }

  return filter
}

export function createDownloadParameters({ layerData = {}, filter = '' }) {
  const { layer } = layerData
  const isWcsType = hasWcsTypeUrl(layerData)
  const isWfsType = hasWfsTypeUrl(layerData)
  const isWmsType = hasWmsTypeUrl(layerData)

  if (!isWcsType && !isWfsType && !isWmsType) {
    console.warn('No valid `downloadUrl` present for layer: ', layer)
    return null
  }

  if (isWcsType) {
    return createWcsParameters(layer)
  }

  if (isWfsType || isWmsType) {
    return createWfsParameters({ layer, filter })
  }
}

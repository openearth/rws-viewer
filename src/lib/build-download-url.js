import { stringify } from 'query-string'

const filterTemplate = `
  <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
    <ogc:Intersects>
      <ogc:PropertyName />
      <gml:Polygon xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:4326">
        <gml:exterior>
          <gml:LinearRing>
            <gml:posList>{{COORDINATES}}</gml:posList>
          </gml:LinearRing>
        </gml:exterior>
      </gml:Polygon>
    </ogc:Intersects>
  </ogc:Filter>
`

const wfsParams = (layer, filter) => stringify({
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

const wcsParams = (layer) => stringify({
  'request': 'GetCoverage',
  'CoverageId': layer,
  'service': 'WCS',
  'version': '2.0.1',
  'format': 'image/tiff',
})

function createLayerUrl({ layerData, coordinates }) {
  const { downloadUrl, layer } = layerData
  const coordinatesArray = coordinates.split(' ')
  const validCoordinates = ((coordinatesArray.length / 2) - 1) >= 3 // 3 = triangle, 4 = rectangle, 5+ = polygon
  const isWfsLayer = Boolean(downloadUrl && downloadUrl.endsWith('wfs'))
  const isWcsLayer = Boolean(downloadUrl && downloadUrl.endsWith('wcs'))
  const params = isWcsLayer && wcsParams(layer) || isWfsLayer && wfsParams(layer, filter)
  const fileType = isWcsLayer && 'tiff' || isWfsLayer && 'csv'
  let filter = null

  if (!isWfsLayer && !isWcsLayer) {
    console.warn('No valid `downloadUrl` present for layer: ', layer)
    return false
  }

  if (validCoordinates) {
    filter = filterTemplate.replace('{{COORDINATES}}', coordinates)
  }

  return { url: `${ downloadUrl }?${ params }`, fileType }
}

export default function(layerData = [], coordinates = '') {
  return layerData.map(layer => createLayerUrl({ layerData: layer, coordinates }))
}

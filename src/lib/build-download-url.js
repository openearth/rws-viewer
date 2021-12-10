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

function createLayerUrl({ layerData, coordinates }) {
  const { downloadUrl, layer } = layerData
  const coordinatesArray = coordinates.split(' ')
  const validCoordinates = ((coordinatesArray.length / 2) - 1) >= 3 // 3 = triangle, 4 = rectangle, 5+ = polygon
  const isWfsLayer = downloadUrl && downloadUrl.endsWith('wfs')
  const isWcsLayer = downloadUrl && downloadUrl.endsWith('wcs')
  let filter = null

  if (!isWfsLayer && !isWcsLayer) {
    console.warn('No valid `downloadUrl` present for layer: ', layer)
    return
  }

  if (validCoordinates) {
    filter = filterTemplate.replace('{{COORDINATES}}', coordinates)
  }

  const params = stringify({
    'typeName': layer,
    'request': (isWfsLayer && 'GetFeature' || isWcsLayer && 'GetCoverage'),
    'Content-Disposition': 'attachment',
    'filename': layer + '.csv',
    'srsName': 'EPSG:4326',
    'service': (isWfsLayer && 'WFS' || isWcsLayer && 'WCS'),
    'version': '1.1.0',
    'outputFormat': 'csv',
    ...(isWfsLayer && { 'GetLayers': layer }),
    ...(isWcsLayer && { 'GetCoverage': layer }),
    ...(validCoordinates && isWfsLayer && { 'filter': filter }),
  })

  return `${ downloadUrl }?${ params }`
}

export default function(layerData = [], coordinates = '') {
  return layerData.map(layer => createLayerUrl({ layerData: layer, coordinates }))
}

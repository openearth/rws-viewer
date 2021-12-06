import { stringify } from 'query-string'

let filter = `
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

export default function(layerData = {}, coordinates = []) {
  const { downloadUrl, layer } = layerData
  const isWfsLayer = downloadUrl.endsWith('wfs')
  const isWcsLayer = downloadUrl.endsWith('wcs')

  if (coordinates && coordinates.length) {
    filter = filter.replace('{{COORDINATES}}', coordinates)
  }

  const params = stringify({
    'typeName': layer,
    'request': (isWfsLayer && 'GetFeature' || isWcsLayer && 'GetCoverage'),
    'Content-Disposition': 'attachment',
    'filename': layer + '.csv',
    'srsName': 'EPSG:4326',
    'service': (isWfsLayer && 'WFS' || isWcsLayer && 'WCS'),
    'version': '1.1.0',
    'outputFormat': 'csv', // outputformat=<een lijstje hier waaronder aaigrid, tif, netcdf3>
    ...(isWfsLayer && { 'GetLayers': layer }), // GetLayers=<laagnaam>
    ...(isWcsLayer && { 'GetCoverage': layer }), // GetCoverage=<laagnaam>
    ...(coordinates.length && { 'filter': filter }),
  })

  return `${ downloadUrl }?${ params }`
}

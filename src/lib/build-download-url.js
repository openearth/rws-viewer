import { stringify } from 'query-string'

let filter = `
  <ogc:Filter xmlns:ogc="http://www.opengis.net/ogc">
    <ogc:Intersects>
      <ogc:PropertyName/>
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
  if (coordinates && coordinates.length) {
    filter = filter.replace('{{COORDINATES}}', coordinates)
  }

  const params = stringify({
    'typeName': layerData.layer,
    'request': 'GetFeature',
    'Content-Disposition': 'attachment',
    'filename': layerData.layer + '.csv',
    'srsName': 'EPSG:4326',
    'service': 'WFS',
    'version': '1.1.0',
    'outputFormat': 'csv',
    ...(coordinates.length && { filter: filter }),
  })

  return `${ layerData.downloadUrl }?${ params }`
}

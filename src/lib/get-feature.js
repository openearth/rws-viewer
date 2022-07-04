import buildGeoServerUrl from './build-geoserver-url'
import { createDownloadFilter } from './download-helpers'



export default async function getFeature ({ url, layer, coordinates }) {
  const filter = createDownloadFilter(coordinates)

  const geoServerUrl = await buildGeoServerUrl({
    url,
    request: 'GetFeature',
    service: 'WFS',
    outputFormat: 'application/json',
    srs: 'EPSG:4326',
    typeName: layer,
    query_layers: layer,
    filter,
  })

  return fetch(geoServerUrl)
    .then(response => response.json())
    .catch(() => undefined)
}
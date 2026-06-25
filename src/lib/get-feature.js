import buildGeoServerUrl from './build-geoserver-url'
import { createWfsDownloadFilter } from './download-helpers'

export default async function getFeature ({ url, layer, coordinates, count }) {
  const filter = coordinates ? createWfsDownloadFilter([], coordinates) : null

  const geoServerUrl = await buildGeoServerUrl({
    url,
    request: 'GetFeature',
    service: 'WFS',
    outputFormat: 'application/json',
    srs: 'EPSG:4326',
    typeName: layer,
    query_layers: layer,
    ...(filter && { filter }),
    ...(count != null && { count }),
  })

  return fetch(geoServerUrl)
    .then(response => response.json())
    .catch(() => undefined)
}

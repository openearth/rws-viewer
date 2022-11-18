import buildGeoServerUrl from './build-geoserver-url'
//https://gis.stackexchange.com/questions/79201/lat-long-values-in-a-wms-getfeatureinfo-request
export default async function getFeatureInfo({ url, lng, lat,  layer, x=50, y=50, bounds, width=110, height=110 }) {
  let bbox = null
  // Bounding box used with area selection.
  if (bounds) {
    bbox = [
      bounds._sw.lng,
      bounds._sw.lat,
      bounds._ne.lng,
      bounds._ne.lat,
    ].join()
  }

  // Bounding box used with single point selection.
  if (lng && lat) {
    bbox = [
      (lng - 0.01),
      (lat - 0.01),
      (lng + 0.01),
      (lat + 0.01),
    ].join(',')
  }
  const geoServerUrl = await buildGeoServerUrl({
    url,
    request: 'GetFeatureInfo',
    service: 'WMS',
    version: '1.1.1',
    info_format: 'application/json',
    crs: 'EPSG:4326',
    layers: layer,
    query_layers: layer,
    width,
    height,
    x,
    y,
    bbox,
  })

  return fetch(geoServerUrl)
    .then(response => response.json())
    .then(({ features }) => features[0])
    .then((feature) => ({
      ...feature,
      id: String(feature.properties.id),
    }))
    .catch(() => undefined)
}

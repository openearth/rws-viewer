import buildGeoServerUrl from './build-geoserver-url'

export default async function getFeatureInfo({ url, bounds, x, y, width, height, layer }) {
  const bbox = [
    bounds._sw.lng,
    bounds._sw.lat,
    bounds._ne.lng,
    bounds._ne.lat,
  ].join()

  const geoServerUrl = await buildGeoServerUrl({
    url,
    request: 'GetFeatureInfo',
    service: 'WMS',
    info_format: 'application/json',
    srs: 'EPSG:4326',
    layers: layer,
    query_layers: layer,
    width: width,
    height: height,
    x: Math.round(x),
    y: Math.round(y),
    bbox,
  })
  
  return fetch(geoServerUrl)
    .then(response => response.json())
    .then(({ features }) => features[0])
    .then((feature) => ({
      ...feature,
      id: feature.geometry.type === 'Point' ? feature.properties.measurementobject : feature.id,//timestamp
    }))
    .catch(() => undefined)
}

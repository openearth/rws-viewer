import geoServerUrl from './build-geoserver-url'

export default async function getFeatureInfo({ bounds, x, y, width, height, layer }) {
  const bbox = [
    bounds._sw.lng,
    bounds._sw.lat,
    bounds._ne.lng,
    bounds._ne.lat,
  ].join()

  const url = await geoServerUrl({
    url: 'https://datahuiswadden.openearth.nl/geoserver/wms',
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

  console.log(url)

  return fetch(url)
    .then(response => response.json())
    .then(({ features }) => features[0])
    .then((feature) => ({
      ...feature,
      id: String(feature.properties.id),
    }))
    .catch(() => undefined)
}

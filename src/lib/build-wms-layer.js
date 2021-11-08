import buildGeoserverUrl from './build-geoserver-url'

const defaultUrl = process.env.VUE_APP_GEOSERVER_BASE_URL

export default ({ url = defaultUrl, id, layer, style = '', paint = {}, tileSize = 256 }) => {
  const tile = buildGeoserverUrl({
    url,
    service: 'WMS',
    request: 'GetMap',
    layers: layer,
    style,
    width: 256,
    height: 256,
    srs: 'EPSG:3857',
    transparent: true,
    bbox: '{bbox-epsg-3857}',
    format: 'image/png',
    encode: false,
  })

  return {
    id,
    layer,
    type: 'raster',
    source: {
      type: 'raster',
      tiles: [ tile ],
      tileSize,
    },
    paint,
  }
}

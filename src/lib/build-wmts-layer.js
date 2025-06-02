import buildGeoserverUrl from './build-geoserver-url'

const defaultUrl = process.env.VUE_APP_GEOSERVER_BASE_URL

export default ({ url: rawUrl = defaultUrl, id, layer, style = '', paint = {}, version = '1.0.0', bbox = [] }) => {


  const url = new URL(rawUrl)
  const tile = buildGeoserverUrl({
    url: url.origin + url.pathname,
    service: 'WMTS',
    request: 'GetTile',
    layer: layer, 
    style,
    version, 
    format: 'image/png',
    tilematrixset: 'EPSG:900913',
    tilematrix: 'EPSG:900913:{z}',
    tilerow: '{y}',
    tilecol: '{x}',
    encode: false
  })
  
  return {
    id,
    layer,
    type: 'raster',
    source: {
      type: 'raster',
      tiles: [ tile ],
      tileSize: 256,
      bounds: bbox

    },
    paint,

  }
}

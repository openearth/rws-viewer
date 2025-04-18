import { max } from 'date-fns'
import buildGeoserverUrl from './build-geoserver-url'

const defaultUrl = process.env.VUE_APP_GEOSERVER_BASE_URL

export default ({ url: rawUrl = defaultUrl, id, layer, style = '', paint = {}, version = '1.0.0' }) => {
  //TODO:'https://datahuiswadden.openearth.nl/geoserver/gwc/service/
  // wmts?SERVICE=WMTS&
  // REQUEST=GetTile&
  // VERSION=1.0.0&
  // LAYER=terpen:terp_dem_20210308_cog&
  // STYLE=&
  // TILEMATRIXSET=EPSG:900913&TILEMATRIX=EPSG:900913:{z}&
  // TILEROW={y}&TILECOL={x}&FORMAT=image/png' 

  const url = new URL(rawUrl)
 
  const tile = buildGeoserverUrl({
    url: url.origin + url.pathname,
    service: 'WMTS',
    request: 'GetTile',
    layer: layer, 
    style,
    version, //either 1.0.0 or pass it from the capabilities
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
    },
    paint,

  }
}

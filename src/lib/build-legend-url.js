import { stringify } from 'query-string'
import checkMapServiceType from './check-map-service-type'

// GeoServer - GetLegendGraphic Docs
// https://docs.geoserver.org/stable/en/user/services/wms/get_legend_graphic/index.html
export default function (layerData) {
  const { url, layer } = layerData

  // GetLegendGraphic is a WMS operation. If the layer's url points at the
  // WMTS/GWC endpoint, swap it for the equivalent WMS endpoint of the layer's workspace.
  const isWmts = checkMapServiceType(url) === 'wmts'
  const workspace = layer.includes(':') ? layer.split(':')[0] : null
  const legendBaseUrl = isWmts && workspace
    ? url.replace('/gwc/service/wmts', `/${ workspace }/wms`)
    : url

  // Set the query params for the GetLegendGraphic request
  const params = stringify({
    'request': 'GetLegendGraphic',
    'service':'wms',
    'version': '1.0.0',
    'format': 'image/png',
    'layer': layer,
    'legend_options': 'fontAntiAliasing:true;fontColor:0x000000;fontSize:16;labelMargin:8;dpi:90;',
  })

  return `${ legendBaseUrl }?${ params }`
}

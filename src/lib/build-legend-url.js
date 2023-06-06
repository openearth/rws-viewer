import { stringify } from 'query-string'

// GeoServer - GetLegendGraphic Docs
// https://docs.geoserver.org/stable/en/user/services/wms/get_legend_graphic/index.html
export default function (layerData) {
  const { url, layer } = layerData
  const params = stringify({
    'request': 'GetLegendGraphic',
    'service':'wms',
    'version': '1.0.0',
    'format': 'image/png',
    'layer': layer,
    'legend_options': 'fontAntiAliasing:true;fontColor:0x000000;fontSize:16;labelMargin:8;dpi:90;',
  })

  return `${ url }?${ params }`
}

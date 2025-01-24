
import {
  createDownloadParameters,
  createLegendDownloadParameters,
  mapFormatToFileExtension,
} from '~/lib/download-helpers'

export default function({ layer = {}, filters = [], format, coordinates  = '' }) {

  let url
  if (layer.downloadUrl) {
    url = layer.downloadUrl
  } else {
    url = layer.url
  }

  const params = createDownloadParameters({ layerData: layer, filters, coordinates, format })

  const legendParams = createLegendDownloadParameters({ layerData: layer })
  return [ {
    url: `${ url }?${ params }`,
    fileType: mapFormatToFileExtension[format],
  },
  {
    url: `${ url }?${ legendParams }`,
    fileType: 'sld',
  },
  ]

}

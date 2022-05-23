
import {
  createDownloadFilter,
  createDownloadParameters,
  mapFormatToFileExtension,
} from '~/lib/download-helpers'

function getUrlAndOutputType({ layer = {}, coordinates = '', format }) {

  const { url } = layer
  const filter = createDownloadFilter(coordinates)
  const params = createDownloadParameters({ layerData: layer, filter, format })
  
  return {
    url: `${ url }?${ params }`,
    fileType: mapFormatToFileExtension[format],
  }
  
}

export default function({ layers = [], coordinates = '', formats = [] }) {
  return layers.map((layer, index) => (
    getUrlAndOutputType({ layer, coordinates, format: formats[index] })),
  )
}

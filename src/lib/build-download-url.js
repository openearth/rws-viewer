
import {
  createDownloadFilter,
  createDownloadParameters,
  mapFormatToFileExtension,
} from '~/lib/download-helpers'

export default function({ layer = {}, filters = [], format, coordinates  = '' }) {
  
  const { url } = layer
  const filter = createDownloadFilter(filters, coordinates)
  const params = createDownloadParameters({ layerData: layer, filter, format })
  
  return {
    url: `${ url }?${ params }`,
    fileType: mapFormatToFileExtension[format],
  }
  
}

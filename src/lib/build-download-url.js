import {
  OWS_LAYER_TYPE,
  WMS_LAYER_TYPE,
} from '~/lib/constants'
import {
  createDownloadFilter,
  createDownloadParameters,
  hasWcsTypeUrl,
  hasWfsTypeUrl,
  hasWmsTypeUrl,
  mapFormatToFileExtension,
} from '~/lib/download-helpers'

function getDownloadUrl(layerData = {}) {
  const { downloadUrl, layer, url } = layerData
  const isWcsType = hasWcsTypeUrl(layerData)
  const isWfsType = hasWfsTypeUrl(layerData)
  const isWmsType = hasWmsTypeUrl(layerData)

  if (!isWcsType && !isWfsType && !isWmsType) {
    console.warn('No valid type present in `downloadUrl` or `url` for layer: ', layer)
    return null
  }

  if (isWcsType || isWfsType) {
    return downloadUrl
  }

  if (isWmsType) {
    return url.replace(`/${ WMS_LAYER_TYPE }`, `/${ OWS_LAYER_TYPE }`)
  }
}

function getUrlAndOutputType({ layer = {}, coordinates = '', format }) {
  const url = getDownloadUrl(layer)
  const filter = createDownloadFilter(coordinates)
  const params = createDownloadParameters({ layerData: layer, filter })

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

import {
  createDownloadFilter,
  createDownloadParameters,
  isWcsLayer,
  isWfsLayer,
} from '~/lib/download-helpers'

function buildDownloadUrl({ layerData = {}, coordinates = '' }) {
  const { downloadUrl } = layerData
  const isWcsType = isWcsLayer(layerData)
  const isWfsType = isWfsLayer(layerData)
  const outputType = isWcsType && 'tiff' || isWfsType && 'csv'
  const filter = createDownloadFilter(coordinates)
  const params = createDownloadParameters({ layerData, filter })

  return {
    url: `${ downloadUrl }?${ params }`,
    fileType: outputType,
  }
}

export default function(layerData = [], coordinates = '') {
  return layerData.map(layer => buildDownloadUrl({ layerData: layer, coordinates }))
}

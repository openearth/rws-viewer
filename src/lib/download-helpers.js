import { stringify } from 'query-string'
import { filterTemplate } from './wfs-filter-helpers'


//getFeature request
const createWfsParameters = ({ layer = '', filters = '', coordinates, format = '' }) => {
  const filter = createWfsDownloadFilter(filters, coordinates)

  return stringify({
    'typeName': layer,
    'Content-Disposition': 'attachment',
    'request': 'GetFeature',
    'srsName': 'EPSG:4326',
    'service': 'WFS',
    'version': '1.1.0',
    'outputFormat': format,
    ...(filter && { 'filter': filter }),
  })
}

//getCoverage request //TODO: add bbox in the request if an area is selected.
const createWcsParameters = ({ layer = '', coordinates, format = '' }) => {

  return stringify({
    'request': 'GetCoverage',
    'CoverageId': layer,
    'service': 'WCS',
    'version': '2.0.1',
    'format': format,
    'subsettingcrs': 'http://www.opengis.net/def/crs/EPSG/0/4326',
    ...(coordinates && { subset: coordinatesToSubset(coordinates) }),
  })
}

const createLegendParameters = ({ layer = '' }) => stringify({
  'request': 'GetStyles',
  'service': 'WMS',
  'version': '1.1.1',
  'layers': layer,
})

function coordinatesToSubset(coordinates) {
  const [ l, b, , , r, t ] = coordinates.split(' ')
  return [ `Lat(${ t }, ${ b })`, `Long(${ l }, ${ r })` ]
}

export function createWfsDownloadFilter(filtersArray = [], coordinates = '') {
  const coordinatesArray = coordinates.split(' ')
  const validCoordinates = ((coordinatesArray.length / 2) - 1) >= 3 // 3 = triangle, 4 = rectangle, 5+ = polygon
  if (validCoordinates) {
    filtersArray = [ ...filtersArray, {
      comparer: 'intersects',
      name: '',
      value: coordinates,
    } ]
  }
  return filterTemplate(filtersArray)
}


export function createDownloadParameters({ layerData = {}, filters = '', format = '', coordinates }) {
  const { layer, serviceType, downloadLayer } = layerData
  if (!serviceType) {
    console.warn('No valid `downloadUrl` present for layer: ', layer)
    return null
  }

  if (serviceType === 'wcs') {
    return createWcsParameters({ layer, format, filters, coordinates })
  }

  if (serviceType === 'wfs' && downloadLayer) {
    return createWfsParameters({ layer:downloadLayer, filters, format, coordinates })
  }

  if (serviceType === 'wfs' && !downloadLayer) {
    return createWfsParameters({ layer, filters, format, coordinates })
  }
}

export function createLegendDownloadParameters({ layerData = {} }) {
  const { layer } = layerData
  return createLegendParameters({ layer })
}

export const mapFormatToFileExtension = {
  'application/gml+xml': 'gml',
  'application/gml+xml; version=3.2': 'gml',
  'application/json': 'json',
  'application/vnd.google-earth.kml xml': 'kml',
  'application/vnd.google-earth.kml+xml': 'kml',
  'application/x-gzip': 'gz',
  'application/x-netcdf': 'nc',
  'application/x-netcdf4': 'nc',
  'csv': 'csv',
  'GML2': 'gml',
  'gml3': 'gml',
  'gml32': 'gml',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/tiff': 'tiff',
  'json': 'json',
  'KML': 'kml',
  'SHAPE-ZIP': 'zip',
  'text/csv': 'csv',
  'text/plain': 'txt',
  'text/xml; subtype=gml/2.1.2': 'xml',
  'text/xml; subtype=gml/3.1.1': 'xml',
  'text/xml; subtype=gml/3.2': 'xml',
}


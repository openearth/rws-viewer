export const VALID_VIEWER_CONFIGS = require('../../public/data/available-configs.json')

export const CATEGORIES = require('../../public/data/app.json').categories

export const COORDINATES_HANDLE = '[[COORDINATES]]'

// Layer types
export const OWS_LAYER_TYPE = 'ows'
export const WCS_LAYER_TYPE = 'wcs'
export const WMS_LAYER_TYPE = 'wms'
export const WFS_LAYER_TYPE = 'wfs'

// Layer formats
//
// WCS list source: https://publicwiki.deltares.nl/display/OET/WCS+primer - GetCapabilities
// WMS & WFS list source: https://publicwiki.deltares.nl/display/OET/WFS+primer - GetCapabilities
//
export const WCS_LAYER_FORMATS = [
  'application/gml+xml',
  'application/x-gzip',
  'application/x-netcdf',
  'application/x-netcdf4',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'text/plain',
]
export const WMS_LAYER_FORMATS = [
  'application/gml+xml; version=3.2',
  'GML2',
  'KML',
  'SHAPE-ZIP',
  'application/json',
  'application/vnd.google-earth.kml xml',
  'application/vnd.google-earth.kml+xml',
  'csv',
  'gml3',
  'gml32',
  'json',
  'text/csv',
  'text/xml; subtype=gml/2.1.2',
  'text/xml; subtype=gml/3.1.1',
  'text/xml; subtype=gml/3.2',
]
export const WFS_LAYER_FORMATS = [
  'application/gml+xml; version=3.2',
  'GML2',
  'KML',
  'SHAPE-ZIP',
  'application/json',
  'application/vnd.google-earth.kml xml',
  'application/vnd.google-earth.kml+xml',
  'csv',
  'gml3',
  'gml32',
  'json',
  'text/csv',
  'text/xml; subtype=gml/2.1.2',
  'text/xml; subtype=gml/3.1.1',
  'text/xml; subtype=gml/3.2',
]

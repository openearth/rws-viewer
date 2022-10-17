export const VALID_VIEWER_CONFIGS = require('../../public/data/available-configs.json')
console.log(VALID_VIEWER_CONFIGS)

export const CATEGORIES = require('../../public/data/app.json').categories

export const COORDINATES_HANDLE = '[[COORDINATES]]'


export const NEDERLANDS_MAP_CENTER = [ 5.2913, 52.1326 ] // LONG, LAT
export const WADDEN_SEA_MAP_CENTER = [ 5.787, 53.198 ]

export const WADDEN_SEA_MAP_ZOOM = 8.5
export const NEDERLANDAS_MAP_ZOOM = 7

// Layer types
export const OWS_LAYER_TYPE = 'ows'
export const WCS_LAYER_TYPE = 'wcs'
export const WMS_LAYER_TYPE = 'wms'
export const WFS_LAYER_TYPE = 'wfs'

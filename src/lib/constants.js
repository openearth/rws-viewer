export const VALID_VIEWER_CONFIGS = require('../../public/data/available-configs-viewers.json')

export const VALID_VIEWER_NAMES =  VALID_VIEWER_CONFIGS.map(({ name }) => name)

export const CATEGORIES = require('../../public/data/app.json').categories

export const COORDINATES_HANDLE = '[[COORDINATES]]'

// A default map center and zoom level are necessary for vue2mapbox-gl to watch for changes
export const NEDERLANDS_MAP_CENTER = [5.2913, 52.1326]
export const NEDERLANDAS_MAP_ZOOM = 7

// Layer types
export const OWS_LAYER_TYPE = 'ows'
export const WCS_LAYER_TYPE = 'wcs'
export const WMS_LAYER_TYPE = 'wms'
export const WFS_LAYER_TYPE = 'wfs'

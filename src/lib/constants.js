const DATO_VIEWER_CONFIGS = require('../../public/datoData/available-configs.json')
  .map(name => ({ name, source: 'dato' }))

const OTHER_VIEWER_CONFIGS = [
  {
    name: 'some-new-viewer',
    source: 'file',
    path: 'path/to/file',
  },
]

export const VALID_VIEWER_CONFIGS = [ ...DATO_VIEWER_CONFIGS, ...OTHER_VIEWER_CONFIGS ]

export const CATEGORIES = require('../../public/datoData/app.json').categories

export const COORDINATES_HANDLE = '[[COORDINATES]]'

// Layer types
export const OWS_LAYER_TYPE = 'ows'
export const WCS_LAYER_TYPE = 'wcs'
export const WMS_LAYER_TYPE = 'wms'
export const WFS_LAYER_TYPE = 'wfs'

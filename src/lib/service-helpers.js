import {
  WCS_LAYER_TYPE,
  WFS_LAYER_TYPE,
  WMS_LAYER_TYPE,
} from '~/lib/constants'

export const hasWcsTypeUrl = service => service.endsWith(WCS_LAYER_TYPE)

export const hasWfsTypeUrl = service => service.endsWith(WFS_LAYER_TYPE)

export const hasWmsTypeUrl = service => service.endsWith(WMS_LAYER_TYPE)

export const getType = service => {
  const url = new URL(service)

  switch (true) {
    case (url.pathname.endsWith(WCS_LAYER_TYPE)):
      return WCS_LAYER_TYPE
    case (url.pathname.endsWith(WFS_LAYER_TYPE)):
      return WFS_LAYER_TYPE
    case (url.pathname.endsWith(WMS_LAYER_TYPE)):
      return WMS_LAYER_TYPE
    default:
      throw new Error(`Could not find type for service ${ service }`)
  }
}

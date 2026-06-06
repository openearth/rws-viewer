import buildGeoserverUrl from './build-geoserver-url'

const defaultUrl = process.env.VUE_APP_GEOSERVER_BASE_URL
const VECTOR_TILE_FORMAT = 'application/vnd.mapbox-vector-tile'

function mapboxLayerTypeFromGeometry(geometryType) {
  switch (geometryType) {
    case 'Polygon':
    case 'MultiPolygon':
      return 'fill'
    case 'LineString':
    case 'MultiLineString':
      return 'line'
    case 'Point':
    case 'MultiPoint':
      return 'circle'
    default:
      return 'fill'
  }
}

const defaultPaintByType = {
  fill: {
    'fill-color': 'black',
    'fill-opacity': 0,
  },
  line: {
    'line-color': 'black',
    'line-width': 0,
  },
  circle: {
    'circle-color': 'black',
    'circle-radius': 0,
  },
}

/**
 * Build a Mapbox GL layer spec for WMTS vector tiles (MVT).
 * Layer type (fill / line / circle) is derived from featureType (GeoJSON geometry type).
 */
export default function buildWmtsVectorLayer ({
  url: rawUrl = defaultUrl,
  layer,
  style = '',
  paint = {},
  mapServiceVersion = '1.0.0',
  bbox = [],
  featureType,
}) {
  const url = new URL(rawUrl)
  const tile = buildGeoserverUrl({
    url: url.origin + url.pathname,
    service: 'WMTS',
    request: 'GetTile',
    layer,
    style,
    version: mapServiceVersion,
    format: VECTOR_TILE_FORMAT,
    tilematrixset: 'EPSG:900913',
    tilematrix: 'EPSG:900913:{z}',
    tilerow: '{y}',
    tilecol: '{x}',
    encode: false,
    transparent: true,
  })

  const sourceLayerId = layer.split(':')[1]
  const layerType = mapboxLayerTypeFromGeometry(featureType)

  return {
    id: sourceLayerId,
    layer,
    type: layerType,
    source: {
      type: 'vector',
      tiles: [ tile ],
      ...(bbox && Array.isArray(bbox) && bbox.length > 0 && { bounds: bbox }),
    },
    'source-layer': sourceLayerId,
    paint: {
      ...defaultPaintByType[layerType],
      ...paint,
    },
  }
}

import buildGeoserverUrl from './build-geoserver-url'

const defaultUrl = process.env.VUE_APP_GEOSERVER_BASE_URL
const VECTOR_TILE_FORMAT = 'application/vnd.mapbox-vector-tile'

/**
 * Build a Mapbox GL layer spec for WMTS vector tiles (MVT).
 * Same inputs as the raster WMTS builder, plus vectorType (e.g. 'line', 'fill', 'circle')
 * from the feature geometry type.
 */
export default function buildWmtsVectorLayer ({
  url: rawUrl = defaultUrl,
  id,
  layer,
  style = '',
  paint = {},
  mapServiceVersion = '1.0.0',
  bbox = [],
  vectorType,
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
  const defaultFillPaint = {
    'fill-color': [
      'case',
      [ 'boolean', [ 'feature-state', 'selected' ], false ],
      '#ffcc00',
      'black',
    ],
    'fill-opacity': [
      'case',
      [ 'boolean', [ 'feature-state', 'selected' ], false ],
      1,
      0.8,
    ],
  }

  return {
    id: sourceLayerId,
    layer,
    type: "fill",
    source: {
      type: 'vector',
      tiles: [ tile ],
      ...(bbox && Array.isArray(bbox) && bbox.length > 0 && { bounds: bbox }),
    },
    'source-layer': sourceLayerId,
    paint: {
      ...defaultFillPaint,
      ...paint,
    },
  }
}

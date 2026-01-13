export default ({ url: rawUrl = '', id, layer, paint = {} }) => {
  // For ESRI layers, we need to return a special structure
  // The actual source will be created using mapbox-gl-esri-sources in the MapLayer component
  // This function just returns the layer configuration
  
  // Ensure URL ends with / if it doesn't already
  const esriUrl = rawUrl.endsWith('/') ? rawUrl : `${ rawUrl }/`
  
  return {
    id,
    layer,
    type: 'raster',
    source: {
      type: 'esri-tiled', // Special type to indicate ESRI source
      url: esriUrl,
    },
    paint: {
      'raster-opacity': paint.opacity !== undefined ? paint.opacity : 1,
      ...paint,
    },
  }
}


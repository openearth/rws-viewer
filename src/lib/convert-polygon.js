export function multiPolygon2Polygon(feature) {
  const featureClone = { ...feature }

  delete featureClone.bbox
  featureClone.geometry.type = 'Polygon'
  featureClone.geometry.coordinates[0] = feature.geometry.coordinates[0][0]

  return featureClone
}

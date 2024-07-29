export const MenuWithLayersFragment = /* graphql */ `
fragment menuWithLayers on MenuRecord {
  id
  name
  children: viewerLayers {
    layerInstance: layer {
      id
      name
      description
      url
      layer
      downloadUrl
      downloadLayer
      timeFilter
      columnFilter
      externalApi {
        id
        name
        url
        propertyMapping
        apiKey
        filters
        dateFilters
        formatCsv
        maxPageSize
        freehandRectangleDrawing
        pointSelection
        multipleSelection
        selectableLayer
      }
      tags {
        title
      }
      metadata {
        key: title
        value: content
      }
      bron
      bijsluiter
      info
    }
  }
  parent {
    id
  }
  metadata {
    key: title
    value: content
  }
  bron
  bijsluiter
  info
}
`

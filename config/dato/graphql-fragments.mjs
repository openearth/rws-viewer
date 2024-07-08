export const MenuWithLayersFragment = /* graphql */ `
fragment menuWithLayers on MenuRecord {
  id
  name
  children: viewerLayers {
    layerInstance: layer {
      id
      name
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
    }
    metadata {
      key: title
      value: content
    }
  }
  parent {
    id
  }
  metadata {
    key: title
    value: content
  }
}
`

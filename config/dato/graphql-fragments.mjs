export const MenuWithLayersFragment = /* graphql */ `
fragment menuWithLayers on MenuRecord {
  id
  name
  children: viewerLayers {
    viewerLayerId: id
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
        requestType
        propertyMapping
        apiKey
        filters
        dateFilters
        formatCsv
        maxPageSize
        endpoint
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

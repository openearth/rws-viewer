/*
  Function that implements the DescribeFeatureType operation of the WFS protocol
  Return a json with all the attributes of the feature
*/


import buildGeoServerUrl from './build-geoserver-url'


export async function describeFeatureType({ url, layer }) {

  const geoServerUrl = await buildGeoServerUrl({
    url,
    request: 'describeFeatureType',
    service: 'WFS',
    outputFormat: 'application/json',
    typenames: layer,
  })

  return fetch(geoServerUrl)
    .then(response => response.json())
    .catch(() => undefined)
}

/*
  Function that reads the DescribeFeatureType response and returns the available attributes to filter and their type
  excludes geom
*/
export function readFeatureProperties(describeFeatureTypeResponse) {

  const { featureTypes } = describeFeatureTypeResponse
  const properties = featureTypes[0].properties

  const filteredProperties = properties.filter((property) =>
    property.type.includes('xsd')).map(({ name, type }) => {
      return { name, type }
    })
  return filteredProperties
}

//const of the filterTemplate
export const filterTemplate = (filters) =>
  `
<ogc:Filter
	xmlns:ogc="http://www.opengis.net/ogc">
	<ogc:And>
    ${ filters.length ? createOgcFiltersXml(filters) : '' }
  </ogc:And>
</ogc:Filter>

`
//For each filter object in the filtersArray, calls the ogcFilterLibrary to create the filter based on the comparer case
function createOgcFiltersXml(filtersArray) {
  let ogcFilters = ''
  filtersArray.forEach(({ comparer, name, value }) => {
    const ogcFilter = ogcFilterLibrary(comparer, name, value)
    ogcFilters = ogcFilters + ogcFilter
  })
  return ogcFilters
}

//library for different ogc filters
function ogcFilterLibrary(comparer, name, value) {
  switch (comparer) {
    case '=':
      return `
        <ogc:PropertyIsEqualTo matchCase="true">
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsEqualTo>
       `
    case '!=':
      return `
        <ogc:PropertyIsNotEqualTo matchCase="true">
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsNotEqualTo>
       `
    case '<':
      return `
        <ogc:PropertyIsLessThan>
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsLessThan>
       `
    case '>':
      return `
        <ogc:PropertyIsGreaterThan >
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsGreaterThan>
       `
    case '<=':
      return `
        <ogc:PropertyIsLessThanOrEqualTo>
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsLessThanOrEqualTo>
        `
    case '>=':
      return `
        <ogc:PropertyIsGreaterThanOrEqualTo>
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsGreaterThanOrEqualTo>
       `
    case 'Like':
      return `
        <ogc:PropertyIsLike wildCard="*" singleChar="." escapeChar="!">
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsLike>
       `
    case 'Between':
      return `
        <ogc:PropertyIsBetween>
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsBetween>
       `
    case 'Not between':
      return `
        <ogc:PropertyIsNotBetween>
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsNotBetween>
       `
    case 'In':
      return `
        <ogc:PropertyIsIn>
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsIn>
       `
    case 'Not in':
      return `
        <ogc:PropertyIsNotIn>
          <ogc:PropertyName>${ name }</ogc:PropertyName>
          <ogc:Literal>${ value }</ogc:Literal>
        </ogc:PropertyIsNotIn>
       `
    case 'intersects':
      return ` <ogc:Intersects>
      <ogc:PropertyName />
      <gml:Polygon xmlns:gml="http://www.opengis.net/gml" srsName="EPSG:4326">
        <gml:exterior>
          <gml:LinearRing>
            <gml:posList>${ value }</gml:posList>
          </gml:LinearRing>
        </gml:exterior>
      </gml:Polygon>
    </ogc:Intersects>`
    default:
      console.log('something went wrong')
      return ''
  }

}




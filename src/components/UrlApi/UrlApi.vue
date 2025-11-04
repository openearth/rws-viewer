<template>
  <div>
    <h3 class="pb-3">
      {{ $t('filtersDownload') }}
    </h3>

    <p v-if="!selectedFilters || !selectedFilters.length" class="body-2">
      {{ $t('noFilterSelected') }}
    </p>

    <key-value-filter
      :filters="filters"
      :comparers="urlComparers"
      :date-filters="dateFilters"
      @change="handleFilterChange"
    />
  </div>
</template>

<script>
  import KeyValueFilter from '~/components/KeyValueFilter/KeyValueFilter'
  import { generateDownloadUrl, downloadFromUrl } from '~/lib/external-api'
  import getFeature from '~/lib/get-feature'
  import _ from 'lodash'

  export default {
    components: { KeyValueFilter },
    props: {
      filters: {
        type: Array,
        required: true,
      },
      dateFilters: {
        type: Array,
        required: false,
        default: () => [],
      },
      externalApi: {
        type: Object,
        required: true,
      },
      selectedFilters: {
        type: Array,
        default: null,
      },
      drawnFeatures: {
        type: Array,
        required: true,
      },
      selectedAreaName: {
        type: String,
        default: null,
      },
      selectedLayerToDownloadFrom: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        // URL-based API operators (legacy external APIs)
        urlComparers: Object.freeze([
          'eq',
          'ne',
          'lt',
          'le',
          'ge',
          'gt',
          'in',
          'notin',
          'like',
          'startswith',
          'endswith',
        ]),
      }
    },
    methods: {
      handleFilterChange(filters) {
        this.$emit('change', filters)
      },
      
      selectionCoordinates(features) {
        return features.toString().replace(/,/g, ' ')
      },
      
      drawnFeatureCoordinates(drawnFeature) {
        let featureCoordinates = []
        if (Array.from(drawnFeature?.geometry?.coordinates).length === 2) {
          const coords = Array.from(drawnFeature?.geometry?.coordinates)
          const margin = 0.001
          const minx = coords[0] - margin
          const maxx = coords[0] + margin
          const miny = coords[1] - margin
          const maxy = coords[1] + margin
          featureCoordinates = [ minx, maxy, maxx, maxy, maxx, miny, minx, miny, minx, maxy ]
        } else {
          featureCoordinates = drawnFeature?.geometry?.coordinates
            ? Array.from(drawnFeature?.geometry?.coordinates).map(coordinates => coordinates.flat())
            : []
        }
        return featureCoordinates
      },
      
      async getValuesOfFeature(layer, selectedFeatures) {
        const url = layer.url
        let referenceLayer = layer.downloadLayer || layer.layer

        const { features } = await getFeature({
          url,
          layer: referenceLayer,
          coordinates: this.selectionCoordinates(selectedFeatures),
        })
        
        const { layerAttributeArea, layerAttributePreFilter } = this.externalApi.propertyMapping
        const selectedAreasNamesAll = features.map(feature => feature.properties[layerAttributeArea])
        const selectedAreasNames = [ ...new Set(selectedAreasNamesAll) ]

        const preFiltersArray = layerAttributePreFilter ? layerAttributePreFilter.split(', ') : []
        const preFiltersValuesAll = preFiltersArray.map(filter => {
          return features.map(feature => feature.properties[filter])
        })
        const preFiltersValues = preFiltersValuesAll.map(preFilter => [ ... new Set(preFilter) ][0])

        return { selectedAreasNames, preFiltersValues }
      },
      
      async download() {
        this.$emit('downloading', true)
        this.$emit('error', null)
        
        const externalApi = this.externalApi
        let selectedArea
        let selectedAreas = []
        let preFiltersValues = []

        const { apiAttributeArea, apiAttributePreFilter } = externalApi.propertyMapping
        const { formatCsv, name } = externalApi

        if (!externalApi.pointSelection) {
          selectedArea = this.selectedAreaName
        } else {
          for await (const featureValues of this.drawnFeatures.map(drawnFeature => 
            this.getValuesOfFeature(
              this.selectedLayerToDownloadFrom, 
              this.drawnFeatureCoordinates(drawnFeature)
            )
          )) {
            selectedAreas = [ ...selectedAreas, _.get(featureValues, 'selectedAreasNames') ].flat()
            preFiltersValues = [ ...preFiltersValues, _.get(featureValues, 'preFiltersValues') ].flat()
          }
        }

        let areaFilter
        let preFilter = []

        if (selectedArea) {
          areaFilter = {
            name: apiAttributeArea,
            comparer: 'eq',
            value: selectedArea,
          }
        } else if (selectedAreas.length) {
          areaFilter = {
            name: apiAttributeArea,
            comparer: 'in',
            value: `[ ${ selectedAreas.map(area => `"${ area }"`) } ]`,
          }
        }

        if (apiAttributePreFilter) {
          const preFiltersArray = apiAttributePreFilter.split(',')
          preFilter = preFiltersArray.map((a, ind) => ({
            name: a,
            comparer: 'eq',
            value: JSON.stringify(preFiltersValues[ind]),
          }))
        }

        const fileExtension = formatCsv ? 'csv' : 'json'
        const downloadUrl = generateDownloadUrl({
          ...externalApi, 
          filters: [
            areaFilter,
            ...(preFilter && preFilter),
            ...(this.selectedFilters || []),
          ].filter(Boolean),
        })

        const date = new Date(Date.now())
        const fileName = `${ name }_${ date.toLocaleString() }.${ fileExtension }`

        try {
          await downloadFromUrl({
            url: downloadUrl,
            apiKey: process.env[externalApi.apiKey],
            formatCsv,
            fileName,
          })
          this.$emit('download-success')
          this.$trackEvent('download', 'api')
        } catch (err) {
          console.log('ERROR', err)
          this.$emit('error', `Request failed: ${ err }`)
        } finally {
          this.$emit('downloading', false)
        }
      },
    },
  }
</script>

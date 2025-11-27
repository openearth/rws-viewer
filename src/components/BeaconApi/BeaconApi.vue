<template>
  <v-container class="pa-0">
    <h3 class="pb-3">
      {{ $t('filtersDownload') }}
    </h3>

    <p v-if="!visibleFilters || !visibleFilters.length" class="body-2">
      {{ $t('noFilterSelected') }}
    </p>
    <v-row v-for="filter in visibleFilters" :key="filter.name + '-' + (filter.comparer || '')">
      <v-col :cols="3" class="d-flex align-center text-break">
        {{ filter.name }}
      </v-col>
      <v-col :cols="4">
        <v-select
          v-model="filter.comparer"
          :items="dateItems(filter)"
          item-text="text"
          item-value="value"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col :cols="4">
        <template v-if="checkDateFilters(filter)">
          <v-text-field
            v-model="filter.minDate"
            :label="$t('minDate') || 'Min Date'"
            type="date"
            dense
            outlined
            hide-details
            class="mb-2"
            style="padding-right: 8px;"
          />
          <v-text-field
            v-model="filter.maxDate"
            :label="$t('maxDate') || 'Max Date'"
            type="date"
            dense
            outlined
            hide-details
            style="padding-right: 8px;"
          />
        </template>
        <template v-else-if="filter.comparer === 'min_max'">
          <v-text-field
            v-model="filter.minValue"
            :label="$t('minValue') || 'Min'"
            dense
            outlined
            hide-details
            class="mb-2"
            style="padding-right: 8px;"
          />
          <v-text-field
            v-model="filter.maxValue"
            :label="$t('maxValue') || 'Max'"
            dense
            outlined
            hide-details
            style="padding-right: 8px;"
          />
        </template>
        <v-text-field
          v-else
          v-model="filter.value"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col :cols="1">
        <v-btn
          icon
        >
          <v-icon @click="removeFilter(filter)">
            mdi-delete
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col :cols="10">
        <v-select
          v-model="selectedFilter"
          :items="selectableFilters"
          :label="$t('name')"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col :cols="2">
        <v-btn
          icon
          :title="$t('addFilter')"
          :disabled="!selectedFilter"
          @click="addFilter"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import bbox from '@turf/bbox'
  import { parseISO, startOfDay, endOfDay, formatISO } from 'date-fns'
  import JSZip from 'jszip'

  export default {
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
      drawnFeatures: {
        type: Array,
        required: false,
        default: () => [],
      },
      externalApis: {
        type: Array,
        required: false,
        default: () => [],
      },
      filterConfig: {
        type: Object,
        required: false,
        default: () => ({
          hiddenFilters: [ 'longitude', 'latitude' ],
          combinableFilters: [ 'longitude', 'latitude' ],
          defaultComparer: 'equals',
          dateComparer: 'datetime_range',
        }),
      },
    },
    data() {
      return {
        enabledFilters: [],
        selectedFilter: null,
        processedRectangle: null,
        beaconComparers: Object.freeze([
          'equals',
          'min_max',
          'datetime_range'
        ]),
      }
    },
    computed: {
      selectableFilters() {
        return this.filters
          .filter(filter => {
            const actualFilterName = filter.includes(':') 
              ? filter.split(':').slice(1).join(':') 
              : filter
            return !this.filterConfig.hiddenFilters.includes(actualFilterName)
          })
          .filter(filter => 
            !this.enabledFilters.find(enabledFilter => enabledFilter.name === filter)
          )
      },
      visibleFilters() {
        return this.enabledFilters.filter(filter => {
          if (filter.hidden) {
            return false
          }
          const actualFilterName = filter.name.includes(':') 
            ? filter.name.split(':').slice(1).join(':') 
            : filter.name
          return !this.filterConfig.hiddenFilters.includes(actualFilterName)
        })
      },
      comparerMap() {
        return {
          equals: (value, name) => ({
            eq: value,
            for_query_parameter: name,
          }),
          min_max: (minValue, maxValue, name) => ({
            min: this.parseFilterValue(minValue),
            max: this.parseFilterValue(maxValue),
            for_query_parameter: name,
          }),
          between: (value, name) => {
            const parts = value.split(',').map(v => v.trim())
            if (parts.length === 2) {
              return {
                min: this.parseFilterValue(parts[0]),
                max: this.parseFilterValue(parts[1]),
                for_query_parameter: name,
              }
            }
            return {
              min: this.parseFilterValue(value),
              for_query_parameter: name,
            }
          },
        }
      },
    },
    watch: {
      enabledFilters: {
        handler(newValue, oldValue) {
          if (newValue.length || newValue.length !== oldValue.length) {
            this.$emit('change', newValue)
          }
        },
        deep: true,
      },
      drawnFeatures: {
        handler(newFeatures) {
          if (newFeatures && newFeatures.length > 0) {
            const feature = newFeatures[0]
            if (feature && feature.id !== this.processedRectangle) {
              this.extractBboxFromFeature(feature)
            }
          } else if (!newFeatures || newFeatures.length === 0) {
            this.processedRectangle = null
          }
        },
        immediate: false,
      },
    },
    mounted() {
      this.selectedFilter = this.selectableFilters[0]
    },
    methods: {
      extractBboxFromFeature(feature) {
        if (!feature || !feature.geometry) {
          return
        }

        try {
          const [ minLng, minLat, maxLng, maxLat ] = bbox(feature)

          this.processedRectangle = feature.id

          const spatialFields = this.filterConfig.combinableFilters
          const externalApis = this.externalApis || []

          // Create filter configs for each external API with prefixed names
          externalApis.forEach(api => {
            const apiPrefix = `${ api.name }:`
            const filterConfigs = []

            if (spatialFields.includes('longitude')) {
              filterConfigs.push({
                name: `${ apiPrefix }longitude`,
                comparer: 'min_max',
                minValue: minLng.toString(),
                maxValue: maxLng.toString(),
              })
            }
            if (spatialFields.includes('latitude')) {
              filterConfigs.push({
                name: `${ apiPrefix }latitude`,
                comparer: 'min_max',
                minValue: minLat.toString(),
                maxValue: maxLat.toString(),
              })
            }

            filterConfigs.forEach(config => {
              const existingFilter = this.enabledFilters.find(
                f => f.name === config.name && f.comparer === config.comparer
              )

              if (existingFilter) {
                if (config.minValue !== undefined) {
                  existingFilter.minValue = config.minValue
                }
                if (config.maxValue !== undefined) {
                  existingFilter.maxValue = config.maxValue
                }
                if (config.value !== undefined) {
                  existingFilter.value = config.value.toString()
                }
              } else {
                this.enabledFilters.push({
                  name: config.name,
                  comparer: config.comparer,
                  value: config.value ? config.value.toString() : '',
                  minValue: config.minValue || '',
                  maxValue: config.maxValue || '',
                  hidden: true,
                })
              }
            })
          })
        } catch (error) {
          console.error('Error extracting bbox from feature:', error)
        }
      },
      addFilter() {
        const isDateFilter = this.checkDateFilters({ name: this.selectedFilter })
        this.enabledFilters.push({
          name: this.selectedFilter,
          comparer: isDateFilter ? this.filterConfig.dateComparer : this.filterConfig.defaultComparer,
          value: '',
          minDate: '',
          maxDate: '',
          minValue: '',
          maxValue: '',
        })
        this.selectedFilter = this.selectableFilters[0]
      },
      removeFilter(filter) {
        this.enabledFilters = this.enabledFilters.filter(enabledFilter => enabledFilter !== filter)
        this.selectedFilter = this.selectableFilters[0]
      },
      checkDateFilters(filter) {
        const filterName = filter.name || filter
        // Check if the filter name (with or without prefix) matches any date filter
        return this.dateFilters.some(dateFilter => {
          // Extract actual name from dateFilter (remove prefix if present)
          const actualDateFilterName = dateFilter.includes(':') 
            ? dateFilter.split(':').slice(1).join(':') 
            : dateFilter
          // Extract actual name from filter name (remove prefix if present)
          const actualFilterName = filterName.includes(':') 
            ? filterName.split(':').slice(1).join(':') 
            : filterName
          return actualDateFilterName === actualFilterName
        })
      },
      dateItems() {
        return this.beaconComparers.map(comparer => {
          if (comparer === 'min_max') {
            return { text: 'min, max', value: comparer }
          }
          return { text: comparer, value: comparer }
        })
      },
      
      buildBeaconFilter(filter) {
        const { name, comparer, value, minDate, maxDate, minValue, maxValue } = filter
        
        if (this.checkDateFilters(filter) && minDate && maxDate) {
          const minDateFormatted = this.formatDateForFilter(minDate, true)
          const maxDateFormatted = this.formatDateForFilter(maxDate, false)
          return {
            min: minDateFormatted,
            max: maxDateFormatted,
            for_query_parameter: name,
          }
        }
        
        if (comparer === 'min_max' && minValue && maxValue) {
          return this.comparerMap.min_max(minValue, maxValue, name)
        }
        
        const mapper = this.comparerMap[comparer]
        if (mapper) {
          return mapper(value, name)
        }
        
        return this.comparerMap.equals(value, name)
      },
      formatDateForFilter(dateString, isMin) {
        if (!dateString) {
          return null
        }
        
        try {
          const date = parseISO(dateString)
          const dateWithTime = isMin ? startOfDay(date) : endOfDay(date)
          return formatISO(dateWithTime)
        } catch (error) {
          console.error('Error formatting date:', error)
          return null
        }
      },
      parseFilterValue(value) {
        const numValue = Number(value)
        if (!isNaN(numValue) && value !== '' && value !== null) {
          return numValue
        }
        return value
      },
      
      async download() {
        this.$emit('downloading', true)
        this.$emit('error', null)
        
        try {
          const externalApis = this.externalApis || []
          
          if (externalApis.length === 0) {
            throw new Error('No external APIs configured')
          }
          
          // Always use zip approach, even for single API
          const zip = new JSZip()
          const date = new Date(Date.now())
          const dateString = date.toLocaleString().replace(/[/:]/g, '-')
          
          // Make all requests in parallel using Promise.all
          const downloadPromises = externalApis.map(async (externalApi) => {
            const { name, endpoint } = externalApi
            
            // Filter enabled filters by API name prefix (e.g., "beacon_test:")
            const apiPrefix = `${ name }:`
            const apiEnabledFilters = this.enabledFilters.filter(filter => 
              filter.name && filter.name.startsWith(apiPrefix)
            )
            
            // Extract filter names without prefix for this API
            const apiFilterNames = this.filters
              .filter(filterName => filterName.startsWith(apiPrefix))
              .map(filterName => filterName.replace(apiPrefix, ''))
            
            // Build query parameters for this API (only filters with matching prefix)
            const queryParameters = apiFilterNames.map(filterName => ({
              column: filterName,
              alias: null,
            }))
            
            // Build filters for this API (only enabled filters with matching prefix)
            const filters = []
            
            apiEnabledFilters.forEach(filter => {
              // Check if it's a date filter using the original prefixed name
              const isDateFilter = this.checkDateFilters(filter)
              
              if (isDateFilter && (!filter.minDate || !filter.maxDate)) {
                return
              }
              
              // Check for min_max comparer
              if (filter.comparer === 'min_max' && (!filter.minValue || !filter.maxValue)) {
                return
              }
              
              // Check for other comparers that need a value
              if (!isDateFilter && filter.comparer !== 'min_max' && !filter.value) {
                return
              }
              
              // Extract the actual filter name (without prefix)
              const actualFilterName = filter.name.replace(apiPrefix, '')
              
              // Create a filter object with the actual name (without prefix)
              const filterWithActualName = {
                ...filter,
                name: actualFilterName,
              }
              
             
              if (isDateFilter) {
                const minDateFormatted = this.formatDateForFilter(filter.minDate, true)
                const maxDateFormatted = this.formatDateForFilter(filter.maxDate, false)
                filters.push({
                  min: minDateFormatted,
                  max: maxDateFormatted,
                  for_query_parameter: actualFilterName,
                })
              } else {
                filters.push(this.buildBeaconFilter(filterWithActualName))
              }
            })
            
            // Build request body (different filters and query parameters per API)
            const requestBody = {
              from: endpoint,
              query_parameters: queryParameters,
              filters: filters,
              output: {
                format: 'csv',
              },
            }
            
         
            const options = {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(externalApi.apiKey ? { 'x-api-key': process.env[externalApi.apiKey] } : {}),
              },
              body: JSON.stringify(requestBody),
            }
            
            const response = await fetch(externalApi.url, options)
            
            if (!response.ok) {
              let errorMessage = `HTTP error! status: ${ response.status }`
              try {
                const errorData = await response.json()
                if (errorData.message || errorData.error) {
                  errorMessage = errorData.message || errorData.error
                }
              } catch {
                // If response is not JSON, use default error message
              }
              throw new Error(`${ name }: ${ errorMessage }`)
            }
            
            const blob = await response.blob()
            const filename = `${ name }_${ dateString }.csv`
            
            return { filename, blob }
          })
          
        
          const results = await Promise.all(downloadPromises)
          results.forEach(({ filename, blob }) => {
            zip.file(filename, blob, { binary: true })
          })
          
         
          const zipBlob = await zip.generateAsync({ type: 'blob' })
          
          const { saveAs } = await import('file-saver')
          const zipFileName = `beacon_apis_${ dateString }.zip`
          saveAs(zipBlob, zipFileName)
          
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

<template>
  <v-container class="pa-0">
    <h3 class="pb-3">
      {{ $t('filtersDownload') }}
    </h3>

    <p v-if="!visibleFilters || !visibleFilters.length" class="body-2">
      {{ $t('noFilterSelected') }}
    </p>
    <!-- Filter Section -->
    <v-row v-for="filter in visibleFilters" :key="filter.name + '-' + (filter.comparer || '')">
      <v-col :cols="3" class="d-flex align-center text-break">
        {{ filter.name }}
      </v-col>
      <v-col :cols="4">
        <v-select
          v-model="filter.comparer"
          :items="dateItems(filter)"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col :cols="4">
        <!-- Date picker for date filters -->
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
        <!-- Regular text field for non-date filters -->
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

    <!-- Add Filter Section -->
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
      externalApi: {
        type: Object,
        required: false,
        default: null,
      },
    },
    data() {
      return {
        enabledFilters: [],
        selectedFilter: null,
        processedRectangle: null, // Track processed rectangle to avoid reprocessing
        // Beacon API operators (same for all filters)
        beaconComparers: Object.freeze([
          'equals',
          'min',
          'max',
          'between',
          'datetime_range'
        ]),
      }
    },
    computed: {
      selectableFilters() {
        // Exclude longitude and latitude from selectable filters
        return this.filters
          .filter(filter => filter !== 'longitude' && filter !== 'latitude')
          .filter(filter => 
            !this.enabledFilters.find(enabledFilter => enabledFilter.name === filter)
          )
      },
      visibleFilters() {
        // Only show filters that are not hidden (exclude longitude/latitude)
        return this.enabledFilters.filter(filter => 
          !filter.hidden && filter.name !== 'longitude' && filter.name !== 'latitude'
        )
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
          // Process rectangle when features are added after entering the menu
          if (newFeatures && newFeatures.length > 0) {
            const feature = newFeatures[0]
            // Only process if it's a new rectangle (not already processed)
            if (feature && feature.id !== this.processedRectangle) {
              this.processRectangleFeature(feature)
            }
          } else if (!newFeatures || newFeatures.length === 0) {
            // Reset processed rectangle when features are cleared
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
        if (!feature || !feature.geometry || !feature.geometry.coordinates) {
          return null
        }

        const coordinates = feature.geometry.coordinates
        let allCoords = []

        // Handle polygon format: [[[lng1, lat1], [lng2, lat2], ...]]
        if (feature.geometry.type === 'Polygon' && Array.isArray(coordinates[0])) {
          // Flatten the first ring (exterior ring) of the polygon
          allCoords = coordinates[0]
        } else if (feature.geometry.type === 'Point' && Array.isArray(coordinates)) {
          // Handle point format: [lng, lat]
          allCoords = [ coordinates ]
        } else {
          return null
        }

        // Extract longitude and latitude values
        const lngs = []
        const lats = []

        allCoords.forEach(coord => {
          if (Array.isArray(coord) && coord.length >= 2) {
            lngs.push(coord[0])
            lats.push(coord[1])
          }
        })

        if (lngs.length === 0 || lats.length === 0) {
          return null
        }

        return {
          minLng: Math.min(...lngs),
          maxLng: Math.max(...lngs),
          minLat: Math.min(...lats),
          maxLat: Math.max(...lats),
        }
      },
      processRectangleFeature(feature) {
        const bbox = this.extractBboxFromFeature(feature)
        if (!bbox) {
          return
        }

        // Mark this rectangle as processed
        this.processedRectangle = feature.id

        // Define filter configurations for longitude and latitude
        const filterConfigs = [
          { name: 'longitude', comparer: 'min', value: bbox.minLng },
          { name: 'longitude', comparer: 'max', value: bbox.maxLng },
          { name: 'latitude', comparer: 'min', value: bbox.minLat },
          { name: 'latitude', comparer: 'max', value: bbox.maxLat },
        ]

        // Add or update each filter
        filterConfigs.forEach(config => {
          const existingFilter = this.enabledFilters.find(
            f => f.name === config.name && f.comparer === config.comparer
          )

          if (existingFilter) {
            // Update existing filter value
            existingFilter.value = config.value.toString()
          } else {
            // Add new filter (hidden from UI)
            this.enabledFilters.push({
              name: config.name,
              comparer: config.comparer,
              value: config.value.toString(),
              hidden: true,
            })
          }
        })
      },
      addFilter() {
        const isDateFilter = this.checkDateFilters({ name: this.selectedFilter })
        this.enabledFilters.push({
          name: this.selectedFilter,
          comparer: isDateFilter ? 'datetime_range' : this.beaconComparers[0], // default to datetime_range for date filters
          value: '',
          minDate: '',
          maxDate: '',
        })
        this.selectedFilter = this.selectableFilters[0]
      },
      removeFilter(filter) {
        this.enabledFilters = this.enabledFilters.filter(enabledFilter => enabledFilter !== filter)
        this.selectedFilter = this.selectableFilters[0]
      },
      checkDateFilters(filter) {
        return this.dateFilters.includes(filter.name)
      },
      dateItems() {
        // All filters use the same comparers
        return this.beaconComparers
      },
      
      buildBeaconFilter(filter) {
        const { name, comparer, value, minDate, maxDate } = filter
        
        // Handle date filters with minDate and maxDate
        if (this.checkDateFilters(filter) && minDate && maxDate) {
          // Format dates to ISO 8601 format with time
          const minDateFormatted = this.formatDateForFilter(minDate, true)
          const maxDateFormatted = this.formatDateForFilter(maxDate, false)
          return {
            min: minDateFormatted,
            max: maxDateFormatted,
            for_query_parameter: name,
          }
        }
        
        switch (comparer) {
        case 'equals':
          return {
            eq: value,
            for_query_parameter: name,
          }
        case 'min':
          return {
            min: this.parseFilterValue(value),
            for_query_parameter: name,
          }
        case 'max':
          return {
            max: this.parseFilterValue(value),
            for_query_parameter: name,
          }
        case 'between':
        case 'datetime_range': {
          // For between/datetime_range, value should be a string like "min,max"
          const parts = value.split(',').map(v => v.trim())
          if (parts.length === 2) {
            return {
              min: this.parseFilterValue(parts[0]),
              max: this.parseFilterValue(parts[1]),
              for_query_parameter: name,
            }
          }
          // Fallback to single value if format is incorrect
          return {
            min: this.parseFilterValue(value),
            for_query_parameter: name,
          }
        }
        default:
          return {
            eq: value,
            for_query_parameter: name,
          }
        }
      },
      formatDateForFilter(dateString, isMin) {
        // Convert date string (YYYY-MM-DD) to ISO 8601 format with time
        if (!dateString) {
          return null
        }
        
        if (isMin) {
          // For min date, use 00:00:00.000Z
          return `${ dateString }T00:00:00.000Z`
        } else {
          // For max date, use 23:59:59Z
          return `${ dateString }T23:59:59Z`
        }
      },
      parseFilterValue(value) {
        // Try to parse as number for numeric filters (like longitude/latitude)
        const numValue = Number(value)
        if (!isNaN(numValue) && value !== '' && value !== null) {
          return numValue
        }
        // Return as string for dates and other non-numeric values
        return value
      },
      
      async download() {
        this.$emit('downloading', true)
        this.$emit('error', null)
        
        try {
          const externalApi = this.externalApi
          if (!externalApi) {
            throw new Error('External API configuration is missing')
          }
          
          const { name, endpoint } = externalApi
          
          // Build query_parameters from ALL filters (not just selected ones)
          const queryParameters = this.filters.map(filterName => ({
            column: filterName,
            alias: null,
          }))
          
          // Build filters array - only include selected/enabled filters
          const filters = []
          
          // Group filters by name for longitude/latitude combination
          const filterGroups = {}
          
          // Group all enabled filters (including hidden longitude/latitude)
          this.enabledFilters.forEach(filter => {
            // Skip filters without values
            if (this.checkDateFilters(filter) && (!filter.minDate || !filter.maxDate)) {
              return
            }
            if (!this.checkDateFilters(filter) && !filter.value) {
              return
            }
            
            // For longitude and latitude, group by name and comparer
            if ((filter.name === 'longitude' || filter.name === 'latitude') &&
              (filter.comparer === 'min' || filter.comparer === 'max')) {
              if (!filterGroups[filter.name]) {
                filterGroups[filter.name] = {}
              }
              filterGroups[filter.name][filter.comparer] = filter
            } else {
              // Process other filters directly
              filters.push(this.buildBeaconFilter(filter))
            }
          })
          
          // Combine longitude and latitude filters if both min and max exist
          ;[ 'longitude', 'latitude' ].forEach(name => {
            const group = filterGroups[name]
            if (group && group.min && group.max) {
              // Combine into single object
              filters.push({
                min: this.parseFilterValue(group.min.value),
                max: this.parseFilterValue(group.max.value),
                for_query_parameter: name,
              })
            } else {
              // Add individual filters
              if (group?.min) {
                filters.push(this.buildBeaconFilter(group.min))
              }
              if (group?.max) {
                filters.push(this.buildBeaconFilter(group.max))
              }
            }
          })
          
          // Build request body
          const requestBody = {
            from: endpoint,
            query_parameters: queryParameters,
            filters: filters,
            output: {
              format: 'csv', // TODO: add support of all the formats
            },
          }
          
          // Make POST request
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
            // Try to get error message from response
            let errorMessage = `HTTP error! status: ${ response.status }`
            try {
              const errorData = await response.json()
              if (errorData.message || errorData.error) {
                errorMessage = errorData.message || errorData.error
              }
            } catch {
              // If response is not JSON, use default error message
            }
            throw new Error(errorMessage)
          }
          
          // Download the file
          // Since we're requesting CSV format, the response will be CSV
          const blob = await response.blob()
          
          // Ensure correct MIME type for CSV
          const csvBlob = new Blob([ blob ], { type: 'text/csv;charset=utf-8;' })
          
          const { saveAs } = await import('file-saver')
          const date = new Date(Date.now())
          const fileName = `${ name }_${ date.toLocaleString().replace(/[/:]/g, '-') }.csv`
          
          saveAs(csvBlob, fileName)
          
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

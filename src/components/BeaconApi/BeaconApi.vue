<template>
  <v-container class="pa-0">
   

    <!-- Column Selection Section -->
    <v-row v-if="availableColumns.length">
      <v-col>
        <h4>{{ $t('selectColumns') }}</h4>
        <p class="body-2">{{ $t('selectColumnsDesc') }}</p>
        
        <v-combobox
          v-model="selectedColumns"
          :items="availableColumns"
          :label="$t('chooseColumns')"
          multiple
          small-chips
          deletable-chips
          dense
          outlined
          @change="handleColumnChange"
        />
        <div class="mt-2">
          <v-chip
            v-for="col in hardcodedDisplayColumns"
            :key="col"
            x-small
            color="grey"
            text-color="white"
            class="mr-1 mb-1"
          >
            {{ col }} (hardcoded)
          </v-chip>
        </div>
      </v-col>
    </v-row>

    <v-divider v-if="availableColumns.length" class="my-4" />
    <h3 class="pb-3">
      {{ $t('filtersDownload') }}
    </h3>

    <p v-if="!enabledFilters || !enabledFilters.length" class="body-2">
      {{ $t('noFilterSelected') }}
    </p>
    <!-- Filter Section -->
    <v-row v-for="filter in allDisplayedFilters" :key="filter.name + '-' + (filter.comparer || 'hardcoded')">
      <v-col :cols="3" class="d-flex align-center text-break">
        {{ filter.name }}
        <v-chip
          v-if="filter.hardcoded"
          x-small
          color="grey"
          text-color="white"
          class="ml-2"
        >
          Hardcoded
        </v-chip>
      </v-col>
      <v-col :cols="4">
        <v-select
          v-if="!filter.hardcoded"
          v-model="filter.comparer"
          :items="dateItems(filter)"
          dense
          outlined
          hide-details
        />
        <v-text-field
          v-else
          value="FLUORCTE"
          readonly
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
          v-else-if="!filter.hardcoded"
          v-model="filter.value"
          dense
          outlined
          hide-details
        />
        <v-text-field
          v-else
          value="FLUORCTE"
          readonly
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col :cols="1">
        <v-btn
          v-if="!filter.hardcoded"
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
      availableColumns: {
        type: Array,
        required: true,
        default: () => []
      },
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
        selectedColumns: [],
        enabledFilters: [],
        selectedFilter: null,
        processedRectangle: null, // Track processed rectangle to avoid reprocessing
        // Beacon API specific operators
        beaconComparers: Object.freeze([
          'equals',
          'min',
          'max',
          'between',
          'datetime_range'
        ]),
        // Date comparers for date filters
        dateComparers: Object.freeze([
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
        return this.filters.filter(filter => 
          !this.enabledFilters.find(enabledFilter => enabledFilter.name === filter)
        )
      },
      allDisplayedFilters() {
        // Combine enabled filters with hardcoded filters for display
        const hardcodedFilter = {
          name: 'grootheidcode',
          comparer: 'equals',
          value: 'FLUORCTE',
          hardcoded: true,
        }
        return [ ...this.enabledFilters, hardcodedFilter ]
      },
      allDisplayedColumns() {
        // Combine selected columns with hardcoded columns for display
        const hardcodedColumns = [ 'grootheidcode' ]
        const selectedColumnNames = this.selectedColumns.map(col => 
          typeof col === 'string' ? col : col.value || col.text || col
        )
        const allColumnNames = [ ...new Set([ ...selectedColumnNames, ...hardcodedColumns ]) ]
        
        // Map back to column objects preserving format
        return allColumnNames.map(val => {
          const colObj = this.availableColumns.find(col => {
            const colVal = typeof col === 'string' ? col : col.value || col.text
            return colVal === val
          })
          return colObj || val
        })
      },
      hardcodedDisplayColumns() {
        return [ 'grootheidcode' ]
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

        // Check if longitude/latitude filters already exist
        const hasLongitudeMinFilter = this.enabledFilters.some(f => f.name === 'longitude' && f.comparer === 'min')
        const hasLongitudeMaxFilter = this.enabledFilters.some(f => f.name === 'longitude' && f.comparer === 'max')
        const hasLatitudeMinFilter = this.enabledFilters.some(f => f.name === 'latitude' && f.comparer === 'min')
        const hasLatitudeMaxFilter = this.enabledFilters.some(f => f.name === 'latitude' && f.comparer === 'max')

        // Add longitude min filter if it doesn't exist
        if (!hasLongitudeMinFilter) {
          this.enabledFilters.push({
            name: 'longitude',
            comparer: 'min',
            value: bbox.minLng.toString(),
          })
        }

        // Add longitude max filter if it doesn't exist
        if (!hasLongitudeMaxFilter) {
          this.enabledFilters.push({
            name: 'longitude',
            comparer: 'max',
            value: bbox.maxLng.toString(),
          })
        }

        // Add latitude min filter if it doesn't exist
        if (!hasLatitudeMinFilter) {
          this.enabledFilters.push({
            name: 'latitude',
            comparer: 'min',
            value: bbox.minLat.toString(),
          })
        }

        // Add latitude max filter if it doesn't exist
        if (!hasLatitudeMaxFilter) {
          this.enabledFilters.push({
            name: 'latitude',
            comparer: 'max',
            value: bbox.maxLat.toString(),
          })
        }

        // Auto-select longitude and latitude columns
        const columnValues = this.availableColumns.map(col => 
          typeof col === 'string' ? col : col.value || col.text
        )
        
        const selectedValues = Array.isArray(this.selectedColumns) 
          ? this.selectedColumns.map(col => typeof col === 'string' ? col : col.value || col.text || col)
          : []

        // Add longitude if not already selected
        if (!selectedValues.includes('longitude') && columnValues.includes('longitude')) {
          selectedValues.push('longitude')
        }

        // Add latitude if not already selected
        if (!selectedValues.includes('latitude') && columnValues.includes('latitude')) {
          selectedValues.push('latitude')
        }

        // Update selectedColumns with the proper format
        this.selectedColumns = selectedValues.map(val => {
          // Find the matching column object to preserve format
          const colObj = this.availableColumns.find(col => {
            const colVal = typeof col === 'string' ? col : col.value || col.text
            return colVal === val
          })
          return colObj || val
        })

        // Emit column change
        this.handleColumnChange(this.selectedColumns)
      },
      addFilter() {
        const isDateFilter = this.checkDateFilters({ name: this.selectedFilter })
        const filterName = this.selectedFilter // Capture filter name before resetting
        this.enabledFilters.push({
          name: this.selectedFilter,
          comparer: isDateFilter ? 'datetime_range' : this.beaconComparers[0], // default to datetime_range for date filters
          value: '',
          minDate: '',
          maxDate: '',
        })
        this.selectedFilter = this.selectableFilters[0]
        
        // Auto-select the column when a filter is added
        this.autoSelectFilterColumn(filterName)
      },
      autoSelectFilterColumn(filterName) {
        if (!filterName) {
          return
        }
        
        const columnValues = this.availableColumns.map(col => 
          typeof col === 'string' ? col : col.value || col.text
        )
        
        const selectedValues = Array.isArray(this.selectedColumns) 
          ? this.selectedColumns.map(col => typeof col === 'string' ? col : col.value || col.text || col)
          : []

        // Add filter column if not already selected and it exists in availableColumns
        if (!selectedValues.includes(filterName) && columnValues.includes(filterName)) {
          selectedValues.push(filterName)
        }

        // Update selectedColumns with the proper format
        this.selectedColumns = selectedValues.map(val => {
          // Find the matching column object to preserve format
          const colObj = this.availableColumns.find(col => {
            const colVal = typeof col === 'string' ? col : col.value || col.text
            return colVal === val
          })
          return colObj || val
        })

        // Emit column change
        this.handleColumnChange(this.selectedColumns)
      },
      removeFilter(filter) {
        this.enabledFilters = this.enabledFilters.filter(enabledFilter => enabledFilter !== filter)
        this.selectedFilter = this.selectableFilters[0]
      },
      handleColumnChange(columns) {
        this.$emit('columns-change', columns)
      },
      checkDateFilters(filter) {
        return this.dateFilters.includes(filter.name)
      },
      dateItems(filter) {
        return this.checkDateFilters(filter) ? this.dateComparers : this.beaconComparers
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
          
          const { name, from } = externalApi
          
          // Build query_parameters from selectedColumns
          // Start with selected columns
          const selectedColumnNames = this.selectedColumns.map(column => {
            // Handle both string and object formats
            const columnName = typeof column === 'string' ? column : (column.value || column.text || column)
            return columnName
          })
          
          // Ensure all filter columns are included in query_parameters
          const filterColumnNames = this.enabledFilters
            .filter(filter => {
              // Include filters with values OR date filters with minDate/maxDate
              if (this.checkDateFilters(filter)) {
                return filter.minDate && filter.maxDate
              }
              return filter.value
            })
            .map(filter => filter.name)
          
          // Hardcoded columns that should always be included
          const hardcodedColumns = [ 'grootheidcode' ]
          
          // Combine and deduplicate column names
          const allColumnNames = [ ...new Set([ ...selectedColumnNames, ...filterColumnNames, ...hardcodedColumns ]) ]
          
          // Build query_parameters array
          const queryParameters = allColumnNames.map(columnName => ({
            column: columnName,
            alias: null,
          }))
          
          // Build filters array
          const filters = []
          
          // Add user-defined filters
          this.enabledFilters.forEach(filter => {
            // Include filters with values OR date filters with minDate/maxDate
            if (this.checkDateFilters(filter)) {
              if (filter.minDate && filter.maxDate) {
                filters.push(this.buildBeaconFilter(filter))
              }
            } else if (filter.value) {
              filters.push(this.buildBeaconFilter(filter))
            }
          })
          
          // Hardcoded filter for grootheidcode (TODO: make this configurable)
          filters.push({
            or: [
              {
                eq: 'FLUORCTE',
                for_query_parameter: 'grootheidcode',
              },
            ],
          })
          
          // Build request body
          const requestBody = {
            from: from,
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

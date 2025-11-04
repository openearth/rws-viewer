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
          chips
          deletable-chips
          dense
          outlined
          hide-details
          @change="handleColumnChange"
        />
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
    <v-row v-for="filter in enabledFilters" :key="filter.name">
      <v-col :cols="3" class="d-flex align-center text-break">
        {{ filter.name }}
      </v-col>
      <v-col :cols="3">
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
          <v-btn title="Select Date" @click="handleDateSelectorClick(filter)">
            {{ filter.value || $t('select') }}
          </v-btn>
          <v-dialog
            v-model="showDialog"
            max-width="280"
            @click:outside="handleDialogClose"
          >
            <v-container class="white pa-0">
              <v-date-picker
                v-model="currentFilterValue"
              />
              <v-container class="pa-2 d-flex">
                <v-spacer />
                <v-btn
                  color="primary"
                  text
                  @click="handleDialogClose"
                >
                  {{ $t('close') }}
                </v-btn>
              </v-container>
            </v-container>
          </v-dialog>
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
      <v-col :cols="2">
        <v-btn icon>
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
        showDialog: false,
        currentFilter: null, // Track which filter is using the date picker
        currentFilterValue: null, // Track the date picker value
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
        const hasLongitudeFilter = this.enabledFilters.some(f => f.name === 'longitude')
        const hasLatitudeFilter = this.enabledFilters.some(f => f.name === 'latitude')

        // Add longitude filter if it doesn't exist
        if (!hasLongitudeFilter) {
          this.enabledFilters.push({
            name: 'longitude',
            comparer: 'between',
            value: `${ bbox.minLng },${ bbox.maxLng }`,
          })
        }

        // Add latitude filter if it doesn't exist
        if (!hasLatitudeFilter) {
          this.enabledFilters.push({
            name: 'latitude',
            comparer: 'between',
            value: `${ bbox.minLat },${ bbox.maxLat }`,
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
        this.enabledFilters.push({
          name: this.selectedFilter,
          comparer: this.beaconComparers[0], // default value
          value: '',
        })
        this.selectedFilter = this.selectableFilters[0]
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
      handleDateSelectorClick(filter) {
        this.currentFilter = filter
        this.currentFilterValue = filter.value || null
        this.showDialog = true
      },
      handleDialogClose() {
        if (this.currentFilter && this.currentFilterValue !== null) {
          this.currentFilter.value = this.currentFilterValue
        }
        this.showDialog = false
        this.currentFilter = null
        this.currentFilterValue = null
      },
      
      buildBeaconFilter(filter) {
        const { name, comparer, value } = filter
        
        switch (comparer) {
        case 'equals':
          return {
            eq: value,
            for_query_parameter: name,
          }
        case 'min':
          return {
            min: value,
            for_query_parameter: name,
          }
        case 'max':
          return {
            max: value,
            for_query_parameter: name,
          }
        case 'between':
        case 'datetime_range': {
          // For between/datetime_range, value should be a string like "min,max"
          const parts = value.split(',').map(v => v.trim())
          if (parts.length === 2) {
            return {
              min: parts[0],
              max: parts[1],
              for_query_parameter: name,
            }
          }
          // Fallback to single value if format is incorrect
          return {
            min: value,
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
      
      async download() {
        this.$emit('downloading', true)
        this.$emit('error', null)
        
        try {
          const externalApi = this.externalApi
          const { formatCsv, name, from } = externalApi
          
          // Build query_parameters from selectedColumns
          const queryParameters = this.selectedColumns.map(column => {
            // Handle both string and object formats
            const columnName = typeof column === 'string' ? column : (column.value || column.text || column)
            return {
              column: columnName,
              alias: null,
            }
          })
          
          // Build filters array
          const filters = []
          
          // Add user-defined filters
          this.enabledFilters.forEach(filter => {
            if (filter.value) {
              filters.push(this.buildBeaconFilter(filter))
            }
          })
          
          // Build request body
          const requestBody = {
            from: from,
            query_parameters: queryParameters,
            filters: filters,
            output: {
              format: formatCsv ? 'csv' : 'json',
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
          const blob = formatCsv 
            ? await response.blob()
            : new Blob([ JSON.stringify(await response.json()) ], { type: 'application/json' })
          
          const { saveAs } = await import('file-saver')
          const date = new Date(Date.now())
          const fileExtension = formatCsv ? 'csv' : 'json'
          const fileName = `${ name }_${ date.toLocaleString() }.${ fileExtension }`
          
          saveAs(blob, fileName)
          
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

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
        processedRectangle: null,
        beaconComparers: Object.freeze([
          'equals',
          'min',
          'max',
          'datetime_range'
        ]),
      }
    },
    computed: {
      selectableFilters() {
        return this.filters
          .filter(filter => filter !== 'longitude' && filter !== 'latitude')
          .filter(filter => 
            !this.enabledFilters.find(enabledFilter => enabledFilter.name === filter)
          )
      },
      visibleFilters() {
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

          const filterConfigs = [
            { name: 'longitude', comparer: 'min', value: minLng },
            { name: 'longitude', comparer: 'max', value: maxLng },
            { name: 'latitude', comparer: 'min', value: minLat },
            { name: 'latitude', comparer: 'max', value: maxLat },
          ]

          filterConfigs.forEach(config => {
            const existingFilter = this.enabledFilters.find(
              f => f.name === config.name && f.comparer === config.comparer
            )

            if (existingFilter) {
              existingFilter.value = config.value.toString()
            } else {
              this.enabledFilters.push({
                name: config.name,
                comparer: config.comparer,
                value: config.value.toString(),
                hidden: true,
              })
            }
          })
        } catch (error) {
          console.error('Error extracting bbox from feature:', error)
        }
      },
      addFilter() {
        const isDateFilter = this.checkDateFilters({ name: this.selectedFilter })
        this.enabledFilters.push({
          name: this.selectedFilter,
          comparer: isDateFilter ? 'datetime_range' : this.beaconComparers[0],
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
        return this.beaconComparers
      },
      
      buildBeaconFilter(filter) {
        const { name, comparer, value, minDate, maxDate } = filter
        
        if (this.checkDateFilters(filter) && minDate && maxDate) {
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
        }
        default:
          return {
            eq: value,
            for_query_parameter: name,
          }
        }
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
          const externalApi = this.externalApi
          if (!externalApi) {
            throw new Error('External API configuration is missing')
          }
          
          const { name, endpoint } = externalApi
          
          const queryParameters = this.filters.map(filterName => ({
            column: filterName,
            alias: null,
          }))
          
          const filters = []
          
          const filterGroups = {}
          
          this.enabledFilters.forEach(filter => {
            if (this.checkDateFilters(filter) && (!filter.minDate || !filter.maxDate)) {
              return
            }
            if (!this.checkDateFilters(filter) && !filter.value) {
              return
            }
            
            if ((filter.name === 'longitude' || filter.name === 'latitude') &&
              (filter.comparer === 'min' || filter.comparer === 'max')) {
              if (!filterGroups[filter.name]) {
                filterGroups[filter.name] = {}
              }
              filterGroups[filter.name][filter.comparer] = filter
            } else {
              filters.push(this.buildBeaconFilter(filter))
            }
          })
          
          ;[ 'longitude', 'latitude' ].forEach(name => {
            const group = filterGroups[name]
            if (group && group.min && group.max) {
              filters.push({
                min: this.parseFilterValue(group.min.value),
                max: this.parseFilterValue(group.max.value),
                for_query_parameter: name,
              })
            } else {
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
          
          const blob = await response.blob()
          
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

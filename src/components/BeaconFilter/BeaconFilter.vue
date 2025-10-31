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

    <!-- Filter Section -->
    <v-row v-for="filter in enabledFilters" :key="filter.name">
      <v-col :cols="3" class="d-flex align-center text-break">
        {{ filter.name }}
      </v-col>
      <v-col :cols="3">
        <v-select
          v-model="filter.comparer"
          :items="beaconComparers"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col :cols="4">
        <!-- Beacon-specific filter inputs will go here -->
        <v-text-field
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
    },
    data() {
      return {
        selectedColumns: [],
        enabledFilters: [],
        selectedFilter: null,
        // Beacon API specific operators
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
    },
    mounted() {
      this.selectedFilter = this.selectableFilters[0]
    },
    methods: {
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
    },
  }
</script>

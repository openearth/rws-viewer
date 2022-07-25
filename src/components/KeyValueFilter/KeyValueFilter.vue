<template>
  <v-container class="pa-0">
    <v-row v-for="filter in enabledFilters" :key="filter.name">
      <v-col :cols="3" class="d-flex align-center text-break">
        {{ filter.name }}
      </v-col>
      <v-col :cols="3">
        <v-select
          v-model="filter.comparer"
          :items="comparers"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col :cols="4">
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
          <v-icon>
            mdi-plus
          </v-icon>
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
      comparers: {
        type: Array,
        required: true,
      },
      validateValues: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data() {
      return {
        enabledFilters: [],
        selectedFilter: null,
      }
    },
    computed: {
      selectableFilters() {
        if (this.validateValues) {
          return this.filters.map(filter => filter.name)
        }
        return this.filters.filter(filter => !this.enabledFilters.find(enabledFilter => enabledFilter.name === filter))
      },
    },
    watch: {
      filters() {
        this.enabledFilters = []
      },
      enabledFilters: {
        handler(value) {
          if (value.length) {
            this.$emit('change', value)
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
          comparer: this.comparers[0], //default value
          value: '', 
        })
        this.selectedFilter = this.selectableFilters[0] 
      },
      removeFilter(filter) {
        this.enabledFilters = this.enabledFilters.filter(enabledFilter => enabledFilter !== filter)
        this.selectedFilter = this.selectableFilters[0] 
      },
    },
  }
</script>

<template>
  <v-container class="pa-0">
    <v-row v-for="filter in enabledFilters" :key="filter.name">
      <v-col :cols="3" class="d-flex align-center text-break">
        {{ filter.name }}
      </v-col>
      <v-col :cols="3">
        <v-select
          v-model="filter.comparer"
          :items="dateFilters.includes(filter.name) ? comparers : dateComparers"
          dense
          outlined
          hide-details
        />
      </v-col>
      <v-col :cols="4">
        <template v-if="dateFilters.includes(filter.name)">
          <v-btn title="Select Date" @click="handleDateSelectorClick">
            {{ filter.value || $t('select') }}
          </v-btn>
          <v-dialog
            v-model="showDialog"
            max-width="280"
            @click:outside="handleDialogClose"
          >
            <v-container class="white pa-0">
              <v-date-picker
                v-model="filter.value"
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
      dateFilters: {
        type: Array,
        required: false,
        default: () =>[],
      },
    },
    data() {
      return {
        enabledFilters: [],
        selectedFilter: null,
        showDialog: false,
        dateComparers: Object.freeze([ //TODO: make them prop
          'eq',
          'ne',
          'lt',
          'le',
          'ge',
          'gt',
        ]),
      }
    },
    computed: { //TODO: suggestion simplify don't use the allFitlers but just filters
      selectableFilters() {
        if (this.validateValues) {
          return this.allFilters.map(filter => filter.name)
        }
        return this.allFilters.filter(filter => !this.enabledFilters.find(enabledFilter => enabledFilter.name === filter))
      },
      allFilters() {
        return this.filters.concat(this.dateFilters)
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
      handleDialogClose() {
        this.showDialog = false
      },
      handleDateSelectorClick() {
        this.showDialog = true
      },
    },
  }
</script>

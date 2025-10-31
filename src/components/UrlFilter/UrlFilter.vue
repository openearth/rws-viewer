<template>
  <key-value-filter
    :filters="filters"
    :comparers="urlComparers"
    :date-filters="dateFilters"
    @change="handleFilterChange"
  />
</template>

<script>
  import KeyValueFilter from '~/components/KeyValueFilter/KeyValueFilter'

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
    },
  }
</script>

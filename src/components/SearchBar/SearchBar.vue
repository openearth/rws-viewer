<template>
  <v-col cols="2">
    <v-text-field
      :placeholder="$t('search')"
      hide-details
      :loading="loading && 'info'"
      @input="(val) => $emit('onSearch', val)"
    />
  </v-col>
</template>

<script>
  export default {
    props: {
      loading: {
        type: Boolean,
        default: false,
      },
    },
  }
</script>

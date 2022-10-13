<template>
  <v-col cols="2">
    <v-text-field 
      :placeholder="$t('search')" 
      hide-details 
      @input="(val) => $emit('onSearch', val)" 
    />
  </v-col>
</template>

<template>
  <v-container class="favourites pt-4">
    <v-row>
      <v-col>
        <v-alert
          dense
          outlined
          type="info"
        >
          {{ $t('notYetAvailable') }}
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'Home',
  }
</script>

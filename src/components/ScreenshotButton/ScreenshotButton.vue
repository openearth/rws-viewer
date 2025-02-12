<template>
  <v-tooltip bottom max-width="200px">
    <template v-slot:activator="{ on }">
      <v-btn
        class="ma-auto"
        v-on="on"
        icon
        target="blank"
        download="coastviewer.png"
      >
        <v-icon> mdi-content-save </v-icon>
      </v-btn>
    </template>
    <span>
      {{ $t('screenshot') }}
    </span>
  </v-tooltip>
</template>

<script>
  export default {
    methods: {
      snapShot () {
      }
    }
  }
</script>

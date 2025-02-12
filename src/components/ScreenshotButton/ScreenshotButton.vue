<template>
  <v-tooltip bottom max-width="200px">
    <template v-slot:activator="{ on }">
      <v-btn
        class="ma-auto"
        v-on="on"
        icon
      >
        <v-icon> mdi-content-save </v-icon>
      </v-btn>
    </template>
    <span
      >Maak een snapshot van het huidige beeld en sla deze op naar
      png.</span
    >
  </v-tooltip>
</template>

<script>
  export default {
  }
</script>

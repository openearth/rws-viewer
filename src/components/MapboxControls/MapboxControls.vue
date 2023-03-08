<template>
  <ul class="map-controls">
    <li>
      <v-btn @click=" $emit('print')">
        <v-icon>
          mdi-printer
        </v-icon>
      </v-btn>
    </li>
  </ul>
</template>

<style lang="scss">
  .map-controls {
    display: flex;
    flex-direction: column;
    right: $spacing-tiny * 2;
    top: $spacing-huge + $spacing-tiny;
    position: absolute;
    list-style-type: none;
    padding-left: 0!important;
  }
</style>

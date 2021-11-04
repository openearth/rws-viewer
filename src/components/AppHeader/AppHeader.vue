<template>
  <v-app-bar
    app
    class="app-header"
    :color="color"
    :dark="theme === 'dark'"
    width="100%"
  >
    <v-toolbar-title v-if="title">
      {{ title }}
    </v-toolbar-title>

    <v-spacer />

    <slot name="right" />
  </v-app-bar>
</template>

<script>
  export default {
    name: 'AppHeader',
    props: {
      title: {
        type: String,
        default: '',
      },
      theme: {
        type: String,
        default: 'dark',
        validator: value => value === 'dark' || value === 'light',
      },
      color: {
        type: String,
        default: 'primary',
      },
    },
  }
</script>

<style lang="scss">
  .app-header {
    left: 0 !important;
  }
</style>

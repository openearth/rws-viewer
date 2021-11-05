<template>
  <v-app-bar
    app
    :color="color"
    :dark="theme === 'dark'"
    width="100%"
  >
    <v-app-bar-nav-icon @click.stop="onMenuButtonClick" />

    <v-toolbar-title v-if="title">
      {{ title }}
    </v-toolbar-title>

    <v-spacer />

    <slot name="right" />
  </v-app-bar>
</template>

<script>
  import { mapActions, mapState } from 'vuex'

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
    computed: {
      ...mapState('app', [ 'appNavigationOpen' ]),
    },
    methods: {
      ...mapActions('app', [ 'setNavigationOpen' ]),
      onMenuButtonClick() {
        this.setNavigationOpen({ open: !this.appNavigationOpen })
      },
    },
  }
</script>

<template>
  <v-app-bar
    data-v-step="1"
    app
    :color="color"
    :dark="theme === 'dark'"
    width="100%"
  >
    <v-app-bar-nav-icon v-if="appNavigationOpen" @click.stop="onMenuButtonClick">
      <v-icon>mdi-arrow-left</v-icon>
    </v-app-bar-nav-icon>
    <v-app-bar-nav-icon v-else @click.stop="onMenuButtonClick">
      <v-icon>mdi-arrow-right</v-icon>
    </v-app-bar-nav-icon>
    <v-toolbar-title v-if="title">
      {{ title }}
    </v-toolbar-title>
    <img
    v-if="viewerLogo"
    :src="viewerLogo"
    height="50"
    style="margin-left: 20px;"
    />

    <v-spacer />
    <category-switcher />    
    <v-spacer />

    <slot name="right" />
  </v-app-bar>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import CategorySwitcher from '../CategorySwitcher/CategorySwitcher.vue'

  export default {
    name: 'AppHeader',
    components: { CategorySwitcher },
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
      ...mapGetters('app', [ 'appNavigationOpen', 'viewerLogo' ]),
    },
    methods: {
      ...mapActions('app', [ 'setNavigationOpen' ]),
      onMenuButtonClick() {
        this.setNavigationOpen({ open: !this.appNavigationOpen })
      },
    },
  }
</script>

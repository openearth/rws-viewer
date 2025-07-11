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

    <v-img
    src="/test_tree.png"
    max-height="50"
    max-width="50"
    style="margin-left: 20px"
    >

    </v-img>

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
      ...mapGetters('app', [ 'appNavigationOpen' ]),
    },
    methods: {
      ...mapActions('app', [ 'setNavigationOpen' ]),
      onMenuButtonClick() {
        this.setNavigationOpen({ open: !this.appNavigationOpen })
      },
    },
  }
</script>

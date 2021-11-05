<template>
  <v-navigation-drawer
    floating
    absolute
    width="440"
    :value="appNavigationOpen"
  >
    <v-tabs
      v-model="tabs.name"
      grow
      icons-and-text
      background-color="blue-grey lighten-5"
    >
      <template v-for="tab in tabs">
        <v-tab
          :key="tab.name"
          :to="tab.page"
          :ripple="false"
        >
          {{ tab.name }}
          <v-icon>{{ tab.icon }}</v-icon>
        </v-tab>
      </template>
    </v-tabs>

    <v-divider />

    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </v-navigation-drawer>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'AppSidebar',
    data: () => ({
      drawer: false,
      tabs: [
        { name: 'Layers', page: '/', icon: 'mdi-layers' },
        { name: 'Download', page: '/download', icon: 'mdi-download' },
        { name: 'Favourites', page: '/favourites', icon: 'mdi-star' },
      ],
    }),
    computed: {
      ...mapState('app', [ 'appNavigationOpen' ]),
    },
  }
</script>

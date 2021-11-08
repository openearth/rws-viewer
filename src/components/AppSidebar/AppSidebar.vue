<template>
  <v-navigation-drawer
    class="app-sidebar"
    absolute
    floating
    stateless
    :value="appNavigationOpen"
    width="440"
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

<style lang="scss">
  .app-sidebar {
    z-index: 3;
    box-shadow:
      0 3px 5px -1px rgba(0, 0, 0, .2),
      0 6px 10px 0 rgba(0, 0, 0, .14),
      0 1px 18px 0 rgba(0, 0, 0, .12);
  }
</style>

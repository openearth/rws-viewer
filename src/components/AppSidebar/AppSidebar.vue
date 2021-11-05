<template>
  <v-navigation-drawer
    app
    clipped
    width="400"
  >
    <v-tabs
      v-model="tabs.name"
      grow
      icons-and-text
    >
      <template v-for="tab in tabs">
        <v-tab :key="tab.name" :to="tab.page">
          {{ tab.name }}
          <v-icon>{{ tab.icon }}</v-icon>
        </v-tab>
      </template>
    </v-tabs>
    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </v-navigation-drawer>
</template>

<script>
  export default {
    name: 'AppSidebar',
    data() {
      return {
        tabs: [
          { name: 'Layers', page: '/layers', icon: 'mdi-layers' },
          { name: 'Download', page: '/download', icon: 'mdi-download' },
          { name: 'Favourites', page: '/favourites', icon: 'mdi-star' },
        ],
      }
    },
  }
</script>

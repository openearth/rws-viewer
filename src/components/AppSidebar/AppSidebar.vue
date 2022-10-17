<template>
  <v-navigation-drawer
    class="app-sidebar"
    absolute
    floating
    stateless
    :value="appNavigationOpen"
    :width="appNavigationWidth"
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
          :to="`/${viewerConfig}${tab.page}`"
          :ripple="false"
          :exact-path="tab.page === '/'"
          :disabled="tab.disabled"
        >
          {{ $t(tab.name) }}
          <v-icon>{{ tab.icon }}</v-icon>
        </v-tab>
      </template>
    </v-tabs>

    <v-divider />

    <transition name="fade" mode="out-in">
      <keep-alive>
        <router-view />
      </keep-alive>
    </transition>
  </v-navigation-drawer>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    name: 'AppSidebar',
    data: () => ({
      drawer: false,
      tabs: [
        { name: 'layers', page: '/', icon: 'mdi-layers', disabled: false },
        { name: 'download', page: '/download', icon: 'mdi-download', disabled: false },
        { name: 'favourites', page: '/favourites', icon: 'mdi-star', disabled: false },
        { name: 'filters', page:'/filters', icon: 'mdi-clock-time-three', disabled: true },
      ],
    }),
    computed: {
      ...mapGetters('app', [ 'appNavigationOpen', 'appNavigationWidth', 'viewerConfig' ]),
      ...mapGetters('map', [ 'activeFlattenedLayersIdsWithTimeOption' ]),
    },
    watch: {
      activeFlattenedLayersIdsWithTimeOption() {
        const filterTabIndex = this.tabs.findIndex(tab=> tab.name ==='filters')
        if (this.activeFlattenedLayersIdsWithTimeOption.length) {
          this.tabs[filterTabIndex].disabled = false
        } else {
          this.tabs[filterTabIndex].disabled = true
        }
      },
    },

    methods: {
      ...mapActions('data', [ 'resetTimeExtent' ]),
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
  .v-navigation-drawer__content {
    overflow-y:hidden;
  }
</style>

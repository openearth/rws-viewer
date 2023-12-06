<template>
  <v-navigation-drawer
    class="app-sidebar"
    absolute
    floating
    stateless
    data-v-step="1"
    :value="appNavigationOpen"
    :width="appNavigationWidth"
  >
    <v-tabs
      v-model="tabs.name"
      fixed-tabs
      icons-and-text
      background-color="blue-grey lighten-5"
      data-v-step="2"
    >
      <template v-for="tab in tabs">
        <v-tab
          :key="tab.name"
          :to="`/${viewerConfig}${tab.page}`"
          :ripple="false"
          :exact-path="tab.page === '/'"
          :disabled="tab.disabled"
          data-v-step="3"
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

    <v-tour name="AppSidebar" :steps="steps" />
  </v-navigation-drawer>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { VTour, VStep } from 'vue-tour'

  export default {
    name: 'AppSidebar',
    components: {
      VTour,
      VStep,
    },
    data: () => ({
      drawer: false,
      tabs: [
        { name: 'layers', page: '/', icon: 'mdi-layers', disabled: false },
        { name: 'download', page: '/download', icon: 'mdi-download', disabled: false },
        { name: 'favourites', page: '/favourites', icon: 'mdi-star', disabled: false },
        { name: 'filters', page:'/filters', icon: 'mdi-clock-time-three', disabled: true },
      ],
      return: {
        steps: [
          {
            target: '[data-v-step="1"]',  // We're using document.querySelector() under the hood
            header: {
              title: 'Get Started',
            },
            content: 'Discover <strong>Vue Tour</strong>!',
          },
          {
            target: '[data-v-step="2"]',
            content: 'An awesome plugin made with Vue.js!',
          },
          {
            target: '[data-v-step="3"]',
            content: 'Try it, you\'ll love it!<br>You can put HTML in the steps and completely customize the DOM to suit your needs.',
            params: {
              placement: 'top', // Any valid Popper.js placement. See https://popper.js.org/popper-documentation.html#Popper.placements
            },
          },
        ],
      },
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

    mounted: function () {
      this.$tours['AppSidebar'].start()
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
    overflow-y: hidden;
  }
</style>

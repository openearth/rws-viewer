<template>
  <div class="mapbox-coordinates" :style="`--sidebar-width: ${appNavigationWidth}px`">
    {{ coordinates }}
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    props: {
      lngLat: {
        type: Object,
        default: null,
      },
    },

    computed: {
      ...mapGetters('app', [ 'appNavigationWidth' ]),

      coordinates() {
        if (!this.lngLat) {
          return ''
        }

        return `lng/lat: ${ this.lngLat.lng }, ${ this.lngLat.lat }`
      },
    },
  }
</script>

<style lang="scss">
  @import '~/components/AppCore/mixins.scss';

  .mapbox-coordinates {
    --translate-x: var(--sidebar-width);

    position: absolute;
    bottom: 0;
    left: calc(50% - var(--sidebar-width));
    transform: translate(var(--translate-x));
    transition: transform .3s cubic-bezier(0.25, 0.8, 0.25, 1);
    z-index: 2;
  }
</style>

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
        return `lon/lat(WGS84): ${ this.lngLat.lng.toFixed(4) }, ${ this.lngLat.lat.toFixed(4) }`
      },
    },
  }
</script>

<style lang="scss">
  @import '~/components/AppCore/mixins.scss';

  .mapbox-coordinates {
    --translate-x: var(--sidebar-width);

    position: absolute;
    z-index: 1;
    bottom: 0;
    left: calc(50% - var(--sidebar-width));
    transform: translate(var(--translate-x));
    transition: transform .3s cubic-bezier(.25, .8, .25, 1);
  }
</style>

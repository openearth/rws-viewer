<template>
  <v-card
    class="layer-order"
    :class="{ 'layer-order--open': show }"
    elevation="2"
    width="360"
    :style="`--sidebar-width: ${appNavigationWidth}px`"
  >
    <v-card-title
      class="layer-order__title subtitle-2"
      @click="togglePanel"
    >
      {{ $t('layerOrder') }}
      <v-icon
        class="layer-order__button"
        :class="{ 'layer-order__button--active': show }"
      >
        mdi-chevron-down
      </v-icon>
    </v-card-title>

    <v-card-text class="layer-order__content">
      <Container :get-ghost-parent="getGhostParent" @drop="onDrop">
        <Draggable v-for="layer in activeLayers" :key="layer.id">
          <v-list-item>
            <v-list-item-icon>
              <v-icon v-text="'mdi-reorder-horizontal'" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ layer.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </Draggable>
      </Container>
    </v-card-text>
  </v-card>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { Container, Draggable } from 'vue-dndrop'

  export default {
    name: 'LayerOrder',

    components: { Container, Draggable },

    data: () => ({
      show: false,
    }),

    computed: {
      ...mapGetters('app', [ 'appNavigationWidth' ]),
      ...mapGetters('map', [ 'activeFlattenedLayerIds' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
      activeLayers() {
        return this.activeFlattenedLayerIds.map(id => this.flattenedLayers.find(layer => layer.id === id))
      },
    },

    methods: {
      ...mapActions('map', [ 'moveRasterLayer' ]),
      togglePanel(){
        this.show = !this.show
      },
      onDrop(dropResult) {
        this.moveRasterLayer({ fromIndex: dropResult.removedIndex, toIndex: dropResult.addedIndex })
        
      },
      getGhostParent() {
        return document.body.querySelector('main')
      },
    },
  }
</script>

<style lang="scss">
  @import '~/components/AppCore/mixins.scss';

  @include max-sm-screen {
    .layer-order:not(.layer-order--open) .layer-order__content {
      display: none;
    }
  }

  .layer-order {
    --translate-y: #{$spacing-default};
    --translate-x: calc(100vw - 105% - #{$spacing-default});

    position: absolute;
    z-index: 2;
    top: 0;
    left: 0;
    transform: translate(var(--translate-x), var(--translate-y));
    transition: transform .3s cubic-bezier(.25, .8, .25, 1);
  }

  .layer-order__button {
    transform: rotate(0deg);
    transition: transform .4s cubic-bezier(.25, .8, .5, 1);
  }

  .layer-order__button--active {
    transform: rotate(180deg);
  }

  .layer-order__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: $spacing-small;
    padding-bottom: $spacing-small;
  }

  .layer-order__content.v-card__text {
    padding-top: $spacing-tiny;
    overflow-y: auto;
  }

  .layer-order__content {
    position: relative;
    z-index: 0;
  }

  @include lg-screen {
    .layer-order {
      --translate-x: calc(var(--sidebar-width) + #{$spacing-default});
      --translate-y: calc(100vh - 64px - 48px);
    }

    .layer-order--open {
      --translate-y: calc(100vh - 64px - 100% - #{$spacing-default});
    }

    .layer-order__button {
      transform: rotate(180deg);
    }

    .layer-order__button--active {
      transform: rotate(0deg);
    }
  }
</style>

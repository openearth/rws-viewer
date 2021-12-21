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
      <Container @drop="onDrop">
        <Draggable v-for="layer in activeLayers.reverse()" :key="layer.id">
          <v-list-item>
            <v-list-item-icon>
              <v-icon v-text="'mdi-reorder-horizontal'" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ layer.id }} - {{ layer.name }}</v-list-item-title>
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
      show: true,
    }),

    computed: {
      ...mapGetters('app', [ 'appNavigationWidth' ]),
      ...mapGetters('map', [ 'rasterLayerIds' ]),
      ...mapGetters('data', [ 'flattenedLayers' ]),
      activeLayers() {
        return this.rasterLayerIds.map(id => this.flattenedLayers.find(layer => layer.id === id))
      },
    },

    methods: {
      ...mapActions('map', [ 'setRasterLayers' ]),
      togglePanel(){
        this.show = !this.show
      },
      onDrop(dropResult) {
        const newArray = [ ...this.rasterLayerIds ]
        const itemToMove = newArray.splice(dropResult.removedIndex, 1)[0]
        newArray.splice(dropResult.addedIndex, 0, itemToMove)
        const layers = newArray.map(id => this.flattenedLayers.find(layer => layer.id === id))
        
        this.setRasterLayers({ layers })
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
  --translate-x: calc(100vw - 100% - #{$spacing-default});

  position: absolute;
  top: 0;
  left: 0;
  transform: translate(var(--translate-x), var(--translate-y));
  transition: transform .3s cubic-bezier(0.25, 0.8, 0.25, 1);
  z-index: 2;
}

  .layer-order__button {
    transform: rotate(0deg);
    transition: transform .4s cubic-bezier(0.25, 0.8, 0.5, 1);
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

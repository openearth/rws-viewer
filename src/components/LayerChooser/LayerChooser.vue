<template>
  <v-sheet class="layer-chooser">
    <v-text-field
      v-model="searchString"
      :label="$t('searchInAvailableLayerNames')"
      hide-details
      dense
      clearable
      :disabled="onlyActive"
    />
    <div class="layer-chooser__filter-options">
      <v-switch
        v-model="onlyActive"
        class="layer-chooser__only-active-switch"
        :label="$t('onlyActiveLayers')"
      />
      <!-- Discuss if this is a useful feature -->
      <!-- <v-btn
          depressed
          x-small
          @click="expandAll"
        >
          {{ $t('expandAll') }}
        </v-btn>
        <v-btn
          depressed
          x-small
          @click="collapseAll"
        >
          {{ $t('collapseAll') }}
        </v-btn> -->
    </div>
    <div class="layers-scrollable">
      <v-treeview
        ref="tree"
        class="layer-chooser__tree"
        :value="activeFlattenedLayerIds"
        hoverable
        selectable
        dense
        expand-icon="mdi-chevron-down"
        :items="layersWithParents"
        :search="search"
        :filter="activeFilter"
        :open="openedItems"
        @input="handleInput"
        @update:open="handleOpenedFolders"
      >
        <template #prepend="{selected, open, item, indeterminate}">
          <div v-if="!item.layer">
            <v-icon>
              <template v-if="selected">
                {{ open
                  ? `mdi-folder-open${selected ? '' : '-outline'}`
                  : `mdi-folder${selected ? '-check' : '-outline'}`
                }}
              </template>
              <template v-else-if="indeterminate">
                {{ open
                  ? `mdi-folder-open`
                  : `mdi-folder`
                }}
              </template>
              <template v-else>
                {{ open
                  ? `mdi-folder-open-outline`
                  : `mdi-folder-outline`
                }}
              </template>
            </v-icon>
          </div>
          <div v-else>
            <v-row no-gutters>
              <v-col class="ml-n5">
                <v-icon v-if="item.timeFilter">
                  {{ selected ? 'mdi-clock-time-three' : 'mdi-clock-time-three-outline' }}
                </v-icon>
              </v-col>
              <v-col>
                <v-icon v-if="item.layer">
                  {{ selected ? 'mdi-layers' : 'mdi-layers-outline' }}
                </v-icon>
              </v-col>
            </v-row>
          </div>
        </template>
        <template #label="{ item, selected }">
          <layer-control
            :id="item.id"
            :name="item.name"
            :selected="selected"
            :parent-ids="item.parentIds.toString()"
            :is-layer="!!item.layer"
            :has-metadata="!!item.metadata.length || getUrl(item) !== ''"
            @update-layer-opacity="updateLayerOpacity"
            @zoom-to-layer-extent="zoomToLayerExtent"
            @select="handleSelect"
          >
            <template #info="{ isOpen, close, showFeedbackDialog }">
              <layer-info-dialog
                :title="item.name"
                :content="item.metadata"
                :share-url="getUrl(item)"
                :open="isOpen"
                :layer-id="item.id"
                :layer="item.layer"
                :url="item.url"
                :viewer-name="viewerName"
                @close="close"
                @showFeedbackDialog="showFeedbackDialog"
              />
            </template>
            <template #feedback="{ isOpen, close }">
              <feedback-dialog
                :open="isOpen"
                :menu-or-layer="item"
                :viewer="viewerName"
                :share-url="getUrl(item)"
                :privacy-statement="viewerPrivacyStatement"
                @close="close"
              />
            </template>
          </layer-control>
        </template>
      </v-treeview>
    </div>
  </v-sheet>
</template>

<script>
  import { difference } from 'ramda'
  import { mapGetters, mapActions } from 'vuex'
  import LayerInfoDialog from '~/components/LayerInfoDialog/LayerInfoDialog'
  import FeedbackDialog from '~/components/FeedbackDialog/FeedbackDialog'
  import addParentIdToLayers from '~/lib/add-parent-id-to-layers'
  import _ from 'lodash'

  const LayerControl = () => import('~/components/LayerControl/LayerControl')

  export default {
    components: { LayerControl, LayerInfoDialog, FeedbackDialog },

    data: () => ({
      show: true,
      searchString: '',
      value: [],
      onlyActive: false,
      openedItems: [],
    }),

    computed: {
      ...mapGetters('app', [ 'viewerConfig', 'viewerName', 'viewerPrivacyStatement' ]),
      ...mapGetters('data', [ 'displayLayers' ]),
      ...mapGetters('map', [ 'activeFlattenedLayerIds' ]),
      layersWithParents() {
        return addParentIdToLayers(this.displayLayers)
      },
      search() {
        return this.onlyActive ? ':active-only' : this.searchString
      },
    },

    watch: {
      searchString(newValue, oldValue) {
        if (oldValue === '') {
          this.$refs.tree.updateAll(true)
        }
      },
      onlyActive(newValue) {
        this.$refs.tree.updateAll(newValue)
      },
    },
    mounted () {
      const searchParams = new URLSearchParams(window.location.search)
      const folders = (searchParams.get('folders') || '').split(',')
      this.openedItems = folders
    },
    methods: {
      ...mapActions('map', [ 'updateWmsLayerOpacity', 'updateZoomExtent' ]),
      handleOpenedFolders(newValue, oldValue) {
        if (newValue.length === 0 && !oldValue) {
          return 
        }
        const url = new URL(window.location.href)
        if (url.searchParams.get('folders') === newValue.join(',')) {
          return 
        }
        if (newValue.length > 0 ) {
          url.searchParams.set('folders', newValue.join(','))
        }
        this.$router.replace(`/${ this.viewerConfig }/?${ url.searchParams.toString() }`)
      },
      handleInput(newValue) {
        const added = difference(newValue, this.activeFlattenedLayerIds)
        const removed =  difference(this.activeFlattenedLayerIds, newValue)

        added.length && this.$emit('select-layers', added)
        removed.length && this.$emit('remove-layers', removed)
      },
      handleSelect(id) {
        if (this.activeFlattenedLayerIds.includes(id)) {
          this.$emit('remove-layers', [ id ])
        } else {
          this.$emit('select-layers', [ id ])
        }
      },
      expandAll() {
        this.$refs.tree.updateAll(true)
      },
      collapseAll() {
        this.$refs.tree.updateAll(false)
      },
      activeFilter(item, input, textKey) {
        switch (input) {
        case ':active-only':
          return this.activeFlattenedLayerIds.includes(item.id)
        case ':in-active-only':
          return this.activeFlattenedLayerIds.includes(item.id) === false
        default:
          return item.layer
            ? item[textKey].toLowerCase().indexOf(input.toLowerCase()) > -1
            : undefined
        }
      },
      updateLayerOpacity({ id, opacity }) {
        this.updateWmsLayerOpacity({ id, opacity })
      },
      zoomToLayerExtent(id) {
        this.updateZoomExtent(id)
      },
      getUrl(item) {
        let folders = {}
        folders = [ ...item.parentIds ]
        let layers = item.id
        let layersNames = item.name
        if (_.get(item, 'children', []).length > 0) {
          folders.push(item.id)
          layers = ''
          layersNames = ''
        }

        const url = new URL(window.location.href)
        url.searchParams.set('folders', folders)
        url.searchParams.set('layers', layers)
        url.searchParams.set('layerNames', layersNames)
        const shareUrl = `${ url.origin }/${ this.viewerConfig }/?${ url.searchParams.toString() }`
        return shareUrl
      },
    },
  }
</script>

<style lang="scss">
  .v-treeview-node__root {
    margin-bottom: -8px;
  }

  .v-treeview-node__checkbox {
    display: none !important;
  }

  .v-treeview-node--leaf .v-treeview-node__checkbox {
    display: block !important;
  }

  .v-treeview-node__content {
    margin-left: 36px !important;
  }

  .v-treeview-node--leaf .v-treeview-node__content {
    margin-left: 6px !important;
  }

  .layer-chooser {
    margin-right: -10px !important;
  }

  .layer-chooser__dialog {
    width: 90vw;
    max-width: 960px;
    height: calc(90vh);
  }

  .layer-chooser__filter-options {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: $spacing-tiny;
  }

  .layer-chooser__only-active-switch {
    margin-right: auto !important;
  }

  .layer-chooser .v-treeview-node__checkbox {
    position: relative;
    top: 0;
    align-self: flex-start;
    transform: translateY(7px);
  }

  .layer-chooser .v-treeview-node__checkbox::before {
    opacity: .001;
  }

  .layer-chooser .v-treeview-node__prepend {
    position: absolute;
    top: 0;
    transform: translate(-125%, 7px);
    pointer-events: none;
  }

  .layers-scrollable {
    height: calc(100vh - 248px);
    overflow-y: auto;
  }
</style>

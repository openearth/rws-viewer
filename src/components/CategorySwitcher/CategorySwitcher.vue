<template>
  <v-slide-group
    multiple
    show-arrows
    :value="value"
  >
    <v-slide-item
      v-for="category in categories"
      :key="category"
      v-slot="{ active }"
      :value="category"
    >
      <v-btn
        text
        dark
        :input-value="active"
        :loading="isLoading(category)"
        :disabled="isLoading(category)"
        @click="toggleCategory(category)"
      >
        {{ category }}
      </v-btn>
    </v-slide-item>
  </v-slide-group>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { CATEGORIES } from '../../lib/constants.js'
  import slugify from '@sindresorhus/slugify'

  export default {
    name: 'CategorySwitcher',
    data: () => ({
      categories: CATEGORIES,
      loading: [],
    }),
    computed: {
      ...mapGetters('data', [ 'rawDisplayLayers', 'loadedViewerConfigs' ]),
      value() {
        return this.rawDisplayLayers.map(item => slugify(item.name))
      },
    },
    methods: {
      ...mapActions('data', [ 'addViewerData', 'removeViewerData' ]),
      toggleCategory(category) {
        if (this.loadedViewerConfigs.includes(category)) {
          this.removeViewerData(category)
        } else {
          this.loading.push(category)
          this.addViewerData(category)
            .finally(() => {
              const index = this.loading.indexOf(category)
              this.loading.splice(index, 1)
            })
        }
      },
      isLoading(category) {
        return this.loading.indexOf(category) !== -1
      },
    },
  }
</script>

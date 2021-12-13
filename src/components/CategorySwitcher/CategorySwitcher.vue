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
        @click="toggleCategory(category)"
      >
        {{ category }}
      </v-btn>
    </v-slide-item>
  </v-slide-group>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'
  import { CATEGORIES } from '../../lib/constants'
  import slugify from '@sindresorhus/slugify'

  export default {
    name: 'CategorySwitcher',
    data: () => ({
      categories: CATEGORIES,
    }),
    computed: {
      ...mapGetters('data', [ 'rawDisplayLayers' ]),
      value() {
        return this.rawDisplayLayers.map(item => slugify(item.name))
      },
    },
    methods: {
      ...mapActions('data', [ 'addViewerData' ]),
      toggleCategory(category) {
        this.addViewerData(category)
      },
    },
  }
</script>

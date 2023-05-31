<template>
  <v-menu>
    <template #activator="{ on, attrs }">
      <v-btn
        text
        dark
        v-bind="attrs"
        :loading="loading"
        :disabled="loading"
        v-on="on"
      >
        {{ currentLocale }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item-group
        :value="currentLocale"
        color="primary"
      >
        <v-list-item
          v-for="item in items"
          :key="item.title"
          @click="$emit('input', item)"
        >
          <v-list-item-title>{{ item.title.toUpperCase() }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
  export default {
    props: {
      currentLocale: {
        type: String,
        required: true,
      },
      loading: {
        type: Boolean,
        required: true,
      },
      items: {
        type: Array,
        required: true,
      },
    },
  }
</script>

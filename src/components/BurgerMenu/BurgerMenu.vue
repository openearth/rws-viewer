<template>
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-btn
        dark
        v-bind="attrs"
        :loading="loadingburger"
        :disabled="loadingburger"
        v-on="on"
        icon
      >
        <v-icon> mdi-menu </v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item-group
        color="primary"
      >
        <v-list-item
          v-for="item in items"
          :key="item.title"
          @click="$emit('input', item)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
  export default {
    props: {
      loadingburger: {
        type: Boolean,
        required: true,
      },
    },
    data: () => ({
      items: [
        { title: 'Manual' },
        { title: 'Contact' },
        { title: 'Acknowledgments' },
        { title: 'Disclaimer' },
        { title: 'Privacy statement' },
      ],
    }),
  }
</script>

<template>
  <v-menu offset-y>
    <template #activator="{ on, attrs }">
      <v-btn
        dark
        v-bind="attrs"
        :loading="loadingburger"
        :disabled="loadingburger"
        icon
        v-on="on"
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
          @click="handleItemClick(item)"
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
      // TODO: make the names change based on selected language
      items: [
        { title: 'Manual', url: 'https://waterinfo-extra.rws.nl/doorverwijzingen/overzicht-handleidingen-viewer/'  },
        { title: 'Contact' },
        { title: 'Acknowledgments' },
        { title: 'Disclaimer' },
        { title: 'Privacy statement' },
      ],
    }),
    methods: {
      handleItemClick(item) {
        if (item.url) {
          window.open(item.url, '_blank')
        } if (item.title ==='Contact') {
          this.$emit('open-contact-form')
        }
      },
    },
  }
</script>

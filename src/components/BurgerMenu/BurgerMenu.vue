<template>
  <v-menu offset-y>
    <template #activator="{ attrs }">
      <v-btn
        dark
        v-bind="attrs"
        :loading="loadingburger"
        :disabled="loadingburger"
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
          @click="handleItemClick(item)"
        >
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
  import { mapGetters } from 'vuex'
  
  export default {
    props: {
      loadingburger: {
        type: Boolean,
        required: true,
      },
    },

    computed: {
      ...mapGetters('app', [ 'viewerPrivacyStatement', 'acknowledgments', 'viewerUserAgreement' ]),

      // TODO: make the names change based on selected language
      items() {
        let baseItems = [
          { title: this.$t('manual'), url: 'https://waterinfo-extra.rws.nl/doorverwijzingen/overzicht-handleidingen-viewer/' },
          { title: this.$t('contact') },

        ]
        if (this.acknowledgments) {
          baseItems.push({ title: this.$t('acknowledgments') })
        }
        if (this.viewerUserAgreement) {
          baseItems.push({ title: this.$t('disclaimer') })
        }
        if (this.viewerPrivacyStatement) {
          baseItems.push({ title: this.$t('privacyStatement') })
        }

        return baseItems
      },
    },

    methods: {
      handleItemClick(item) {
        if (item.url) {
          window.open(item.url, '_blank')
        } if (item.title === this.$t('contact')) {
          this.$emit('open-contact-form')
        } if (item.title === this.$t('acknowledgments')) {
          this.$emit('open-acknowledgments')
        } if (item.title === this.$t('disclaimer')) {
          this.$emit('open-user-agreement')
        } if (item.title === this.$t('privacyStatement')) {
          this.$emit('open-privacy-statement')
        }
      },
    },
  }
</script>

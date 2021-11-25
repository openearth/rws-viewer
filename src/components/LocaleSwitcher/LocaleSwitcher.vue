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
        v-model="currentLocale"
        color="primary"
      >
        <v-list-item
          v-for="item in items"
          :key="item.title"
          @click="handleInput(item)"
        >
          <v-list-item-title>{{ item.title.toUpperCase() }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
  import { defaultLocale, availableLocales } from '~/plugins/i18n'
  import axios from 'axios'

  const removeRegion = locale => locale.replace(/-.+/, '')
  const localeIsAvailable = locale => availableLocales.includes(locale)

  export default {
    data: () => ({
      currentLocale: defaultLocale,
      loading: false,
      loadedLocales: [ defaultLocale ],
      items: availableLocales.map(locale => ({ title: locale })),
    }),

    created() {
      const savedLocale = window.localStorage.getItem('locale')
      let browserLocales = []

      if (navigator.languages != undefined) {
        const languages = navigator.languages.map(removeRegion)
        browserLocales = [ ...new Set(languages) ].filter(localeIsAvailable)
      } 

      const localeToUse = savedLocale || browserLocales[0] || defaultLocale
      if (localeToUse !== defaultLocale) {
        this.switchLocale(localeToUse)
      }
    },

    methods: {
      handleInput(event) {
        this.switchLocale(event.title)
      },
      async switchLocale(locale) {
        this.loading = true

        const promise = this.loadedLocales.includes('locale') 
          ? Promise.resolve(locale)
          : axios({ method: 'get', url: `/translations/${ locale }.json` })
            .then(({ data }) => {
              this.$i18n.setLocaleMessage(locale, data)
              this.loadedLocales.push(locale)
              return locale
            })
        
        promise.then(newLocale => {
          window.localStorage.setItem('locale', locale)
          this.$i18n.locale = newLocale
          this.currentLocale = newLocale
          this.loading = false
        })  
      },
    },
  }
</script>

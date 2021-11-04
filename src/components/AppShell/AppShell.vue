<template>
  <v-app>
    <app-header
      :title="headerTitle"
      :theme="theme"
    >
      <template slot="right">
        <slot name="header-right" />
      </template>
    </app-header>

    <v-main>
      <router-view />
      <slot />
      <slot name="map" />
    </v-main>
  </v-app>
</template>

<script>
  const AppHeader = () => import(/* webpackChunkName: "app-header" */ '~/components/AppHeader/AppHeader')

  export default {
    name: 'AppShell',
    components: {
      AppHeader,
    },
    props: {
      headerTitle: {
        type: String,
        default: '',
      },
      theme: {
        type: String,
        default: 'dark',
        validator: value => value === 'dark' || value === 'light',
      },
    },
  }
</script>

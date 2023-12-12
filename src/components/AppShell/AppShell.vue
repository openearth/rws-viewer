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
      <slot name="map" />
      <slot />
      <app-sidebar />
    </v-main>
  </v-app>
</template>

<script>
  import AppHeader from '~/components/AppHeader/AppHeader'
  import AppSidebar from '~/components/AppSidebar/AppSidebar'

  export default {
    name: 'AppShell',
    components: {
      AppHeader,
      AppSidebar,
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

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
      <app-sidebar />
      <slot />
      <slot name="map" />
    </v-main>
  </v-app>
</template>

<script>
  const AppHeader = () => import('~/components/AppHeader/AppHeader')
  const AppSidebar = () => import('~/components/AppSidebar/AppSidebar')

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

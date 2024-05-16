<template>
  <v-dialog
    scrollable
    :value="open && acknowledgments"
    persistent
    width="800"
  >
    <v-card>
      <v-app-bar class="pr-1 pl-2" flat>
        <v-toolbar-title>{{ $t('acknowledgments') }}</v-toolbar-title>

        <v-spacer />

        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-app-bar>

      <v-divider />

      <div class="px-4 py-5 flex-grow-1 overflow-y-auto justify-center" v-html="acknowledgments" />
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      acknowledgments: {
        type: String,
        required: true,
      },
    },

    data() {
      return {
        conditionsOfUse: false,
      }
    },

    methods: {
      close() {
        this.$emit('close')
      },
    },
  }
</script>

<style>
</style>

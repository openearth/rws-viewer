<template>
  <v-dialog
    scrollable
    :value="open && userAgreement"
    persistent
    width="800"
  >
    <v-card>
      <v-app-bar class="pr-1 pl-2" flat>
        <v-toolbar-title>{{ $t('disclaimer') }}</v-toolbar-title>
      </v-app-bar>

      <v-divider />

      <div class="px-7 py-3 flex-grow-1 overflow-y-auto justify-center" v-html="userAgreement" />
      <v-card-text>
        <v-form>
          <v-checkbox
            v-model="conditionsOfUse"
            :label="$t('conditionsOfUseConsent')"
          />
          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              :disabled="!conditionsOfUse"
              @click="close"
            >
              {{ $t('iAgree') }}
            </v-btn>
          </div>
        </v-form>
      </v-card-text>
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
      userAgreement: {
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
        localStorage.setItem('userAgreement', true)
        this.$emit('close')
      },
    },
  }
</script>

<style>
</style>

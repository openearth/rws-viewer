<template>
  <v-dialog
    scrollable
    :value="open && userAgreement"
    persistent
    width="800"
  >
    <v-card class="pa-3">
      <div class="scrollbar" v-html="userAgreement" />
      <v-card :flat="true" class="pa-2">
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
      </v-card>
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
  .scrollbar {
    overflow-y: scroll;
  }
</style>

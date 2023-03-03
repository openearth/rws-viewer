<template>
  <v-dialog
    scrollable
    width="600"
    :value="open"
    @click:outside="close"
  >
    <v-card>
      <v-app-bar class="pr-1 pl-2" flat>
        <v-toolbar-title>{{ $t('feedbackForm') }}</v-toolbar-title>

        <v-spacer />

        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-app-bar>

      <v-divider />

      <div class="px-2 py-2 flex-grow-1 overflow-y-auto justify-center">
        <v-card-text>
          <v-form
            ref="form"
            v-model="valid"
            @submit.prevent="submit"
          >
            <v-text-field
              v-if="layerOrMenu"
              :value="layerOrMenu.name"
              :label="layerOrMenuLabel"
              disabled
            />

            <v-text-field
              v-model="name"
              :label="$t('whoAreYou')"
              :rules="nameRules"
              required
            />

            <v-text-field
              v-model="email"
              :label="$t('whatIsYourEmail')"
              :rules="emailRules"
              required
            />

            <v-textarea
              v-model="feedback"
              rows="3"
              :label="$t('whatCanBeImproved')"
              :rules="feedbackRules"
              required
            />

            <v-btn
              type="submit"
              block
              class="mr-4 primary"
              :disabled="!valid"
            >
              Submit
            </v-btn>
          </v-form>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import * as EmailValidator from 'email-validator'

  export default {
    props: {
      open: {
        type: Boolean,
        default: false,
      },
      layerOrMenu: {
        type: Object,
        default: undefined,
      },
    },

    data() {
      return {
        valid: false,
        feedback: '',
        name: '',
        email: '',
        feedbackRules: [ (v) => !!v || this.$t('thisFieldIsRequired') ],
        nameRules: [ (v) => !!v || this.$t('thisFieldIsRequired') ],
        emailRules: [
          (v) => !!v || this.$t('thisFieldIsRequired'),
          (v) => EmailValidator.validate(v) || this.$t('emailMustBeValid'),
        ],
      }
    },

    computed: {
      layerOrMenuLabel() {
        return this.layerOrMenu.children
          ? this.$t('viewerName')
          : this.$t('layerName')
      },
    },

    watch: {
      open(val) {
        if (val) {
          this.$refs.form.reset()
        }
      },
    },

    methods: {
      close() {
        this.$emit('close')
      },

      submit() {
        console.log('lets go')
      },
    },
  }
</script>

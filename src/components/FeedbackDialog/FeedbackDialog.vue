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
            :disabled="isLoading"
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

            <div class="red--text mb-6">
              {{ errorMessage }}
            </div>

            <v-btn
              type="submit"
              block
              class="primary"
              :disabled="!valid"
              :loading="isLoading"
            >
              {{ $t('submit') }}
            </v-btn>
          </v-form>
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import * as EmailValidator from 'email-validator'
  import axios from 'axios'

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
      viewer: {
        type: String,
        default: '',
      },
    },

    data() {
      return {
        valid: false,
        name: '',
        email: '',
        feedback: '',
        feedbackRules: [ (v) => !!v || this.$t('thisFieldIsRequired') ],
        nameRules: [ (v) => !!v || this.$t('thisFieldIsRequired') ],
        emailRules: [
          (v) => !!v || this.$t('thisFieldIsRequired'),
          (v) => EmailValidator.validate(v) || this.$t('emailMustBeValid'),
        ],
        errorMessage: '',
        isLoading: false,
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
          this.$refs?.form?.resetValidation()
          this.name = ''
          this.email = ''
          this.feedback = ''
          this.errorMessage = ''
        }
      },
    },

    methods: {
      close() {
        this.$emit('close')
      },

      async submit() {
        try {
          this.errorMessage = ''
          this.isLoading = true
          await axios.post('/api/feedback', {
            viewer: this.viewer,
            layerOrMenuId: this.layerOrMenu.id,
            name: this.name,
            email: this.email,
            feedback: this.feedback,
          })
        } catch {
          this.errorMessage = this.$t('sendFeedbackError')
        } finally {
          this.isLoading = false
        }
      },
    },
  }
</script>

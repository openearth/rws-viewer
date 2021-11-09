<template>
  <v-dialog
    scrollable
    :value="layerDialogOpen"
    width="600"
    @click:outside="$emit('close-dialog')"
  >
    <v-card>
      <v-app-bar class="pr-1 pl-2" flat>
        <v-toolbar-title>
          Fusce sed malesuada leo
        </v-toolbar-title>

        <v-spacer />

        <v-btn icon @click="onClickClose">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-app-bar>

      <v-divider />

      <div class="px-2 py-2 flex-grow-1 overflow-y-auto">
        <v-card-text>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Donec eleifend, mi id condimentum bibendum, purus enim iaculis lacus,
          vitae posuere mauris risus non mauris. Vivamus eget mattis sem.
          Nunc volutpat, nulla et semper elementum, magna odio sagittis ex,
          vitae sodales ligula justo ut est. Donec semper metus odio,
          id cursus neque cursus vel. Nunc sapien justo, convallis porta sollicitudin vitae,
          porttitor nec ligula. Phasellus ullamcorper, nisl ac mattis gravida,
          nibh sem sagittis quam, ut aliquet nulla est quis ligula.
          Vestibulum molestie mi id libero commodo vehicula. Aliquam et porttitor ex.
          Etiam posuere, nibh sit amet tristique mattis, lectus purus pretium dolor,
          auctor dignissim tortor velit at urna. Suspendisse mi libero,
          porta nec turpis ut, porta placerat eros. Proin ullamcorper,
          eros ut vulputate egestas, nunc ex pharetra risus, et vulputate diam felis sed elit.
          Integer eget egestas nisi, ac euismod erat.
        </v-card-text>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    computed: {
      ...mapGetters('data', [ 'layerDialogOpen' ]),
    },

    methods: {
      ...mapActions('data', [ 'setLayerDialogOpen' ]),
      onClickClose() {
        this.setLayerDialogOpen({ open: false })
      },
    },
  }
</script>

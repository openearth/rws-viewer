<template>
  <v-container class="download">
    <!-- class="d-flex flex-wrap justify-space-between" -->
    <v-row>
      <v-col>
        <v-btn
          :color="drawMode === 'rectangle' ? 'primary' : null"
          @click="setDrawMode({ mode: 'rectangle' })"
        >
          Draw rectangle
        </v-btn>
      </v-col>
      <v-col>
        <v-btn
          :color="drawMode === 'polygon' ? 'primary' : null"
          @click="setDrawMode({ mode: 'polygon' })"
        >
          Draw polygon
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    computed: {
      ...mapGetters('map', [ 'drawMode' ]),
    },

    methods: {
      ...mapActions('map', [ 'setDrawMode' ]),
    },
  }
</script>

<style>
.download .v-btn {
  width: 100%;
}
</style>

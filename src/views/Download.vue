<template>
  <v-card class="downloads" flat>
    <div class="d-flex flex-wrap justify-space-between">
      <v-btn
        class="flex-grow-0"
        :color="drawMode === 'rectangle' ? 'primary' : null"
        @click="setDrawMode({ mode: 'rectangle' })"
      >
        Draw rectangle
      </v-btn>
      <v-btn
        class="flex-grow-0"
        :color="drawMode === 'polygon' ? 'primary' : null"
        @click="setDrawMode({ mode: 'polygon' })"
      >
        Draw polygon
      </v-btn>
    </div>
    <pre>{{ drawMode }}</pre>
  </v-card>
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

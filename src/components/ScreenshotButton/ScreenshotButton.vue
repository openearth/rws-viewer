<template>
  <v-tooltip bottom max-width="200px">
    <template v-slot:activator="{ on }">
      <v-btn
        class="ma-auto"
        v-on="on"
        icon
        @click="snapShot"
      >
        <v-icon> mdi-content-save </v-icon>
      </v-btn>
    </template>
    <span>
      {{ $t('screenshot') }}
    </span>
  </v-tooltip>
</template>

<script>
  export default {
    props: {
      map: Object // Accept the map instance as a prop
    },
    methods: {
      snapShot() {
        if (!this.map) {
          console.error("Map instance is not available");
          return;
        }
      
        // Ensure that the latest frame is fully rendered
        this.map.once('render', () => {
          const mapCanvas = this.map.getCanvas();
          const mapImage = mapCanvas.toDataURL("image/png");

          // Create a downloadable link
          const link = document.createElement("a");
          link.href = mapImage;
          link.download = "map_snapshot.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });

        // Force the map to render the latest frame
        this.map.triggerRepaint();
      }
    }
  };
</script>

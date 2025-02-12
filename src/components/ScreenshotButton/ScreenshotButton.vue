<template>
  <v-tooltip bottom max-width="200px">
    <template v-slot:activator="{ on }">
      <v-btn class="ma-auto"
        v-on="on"
        icon
        @click="snapShot"
      >
        <v-icon>mdi-content-save</v-icon>
      </v-btn>
    </template>
    <span>{{ $t('screenshot') }}</span>
  </v-tooltip>
</template>

<script>
  export default {
    props: {
      map: Object
    },
    methods: {
      snapShot() {
        if (!this.map) {
          console.error("Map instance is not available");
          return;
        }
      
        this.map.once('render', () => {
          const mapImage = this.map.getCanvas().toDataURL("image/png");
          const link = document.createElement("a");
          link.href = mapImage;
          link.download = "map_snapshot.png";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        });
      
        this.map.triggerRepaint();
      }
    }
  };
</script>

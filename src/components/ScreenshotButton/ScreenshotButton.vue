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
  import html2canvas from 'html2canvas';

  export default {
    props: {
      map: Object
    },
    methods: {
      async snapShot() {
        if (!this.map) {
          console.error("Map instance is not available");
          return;
        }
      
        this.map.once('render', async () => {
          const mapCanvas = this.map.getCanvas();
          const mapImage = mapCanvas.toDataURL("image/png");

          // Capture Layer Order UI
          const layerOrderElement = document.querySelector(".layer-order");
          if (!layerOrderElement) {
            console.error("Layer order UI not found");
            return;
          }
        
          const layerOrderCanvas = await html2canvas(layerOrderElement, { backgroundColor: null });

          // Merge Map Image and Layer Order
          const finalCanvas = document.createElement("canvas");
          finalCanvas.width = mapCanvas.width;
          finalCanvas.height = mapCanvas.height;
          const ctx = finalCanvas.getContext("2d");
        
          // Draw the map first
          const mapImg = new Image();
          mapImg.src = mapImage;
          await new Promise((resolve) => (mapImg.onload = resolve));
          ctx.drawImage(mapImg, 0, 0);
        
          // Draw the layer order on top
          ctx.drawImage(layerOrderCanvas, 10, 10);
        
          // Convert to an image and trigger download
          finalCanvas.toBlob((blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "map_with_layer_order.png";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, "image/png");
        });
      
        this.map.triggerRepaint();
      }
    }
  };
</script>

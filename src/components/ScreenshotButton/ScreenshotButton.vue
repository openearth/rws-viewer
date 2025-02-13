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
      
        // Ensure the Layer Order component is expanded before capturing
        const layerOrderElement = document.querySelector(".layer-order");
        if (!layerOrderElement) {
          console.error("Layer order UI not found");
          return;
        }
        layerOrderElement.classList.add("layer-order--open");
      
        // Ensure the Map Legend component is expanded before capturing
        const mapLegendElement = document.querySelector(".map-legend");
        if (!mapLegendElement) {
          console.error("Map legend UI not found");
          return;
        }
        mapLegendElement.classList.add("map-legend--open");
      
        // Expand all v-expansion-panels inside Map Legend
        document.querySelectorAll(".map-legend .v-expansion-panel").forEach(panel => {
          panel.classList.add("v-expansion-panel--active");
        });
      
        // Apply computed styles to maintain appearance
        const applyComputedStyles = (element) => {
          const computedStyles = window.getComputedStyle(element);
          const originalStyles = {};
          for (let prop of computedStyles) {
            originalStyles[prop] = element.style[prop];
            element.style[prop] = computedStyles.getPropertyValue(prop);
          }
          return originalStyles;
        };
      
        const originalLayerOrderStyles = applyComputedStyles(layerOrderElement);
        const originalLegendStyles = applyComputedStyles(mapLegendElement);
      
        this.map.once('render', async () => {
          const mapCanvas = this.map.getCanvas();
          const mapImage = mapCanvas.toDataURL("image/png");
        
          // Capture Layer Order UI
          const layerOrderCanvas = await html2canvas(layerOrderElement, { backgroundColor: null });
        
          // Capture Map Legend UI
          const mapLegendCanvas = await html2canvas(mapLegendElement, { backgroundColor: null });
        
          // Restore original styles
          Object.assign(layerOrderElement.style, originalLayerOrderStyles);
          Object.assign(mapLegendElement.style, originalLegendStyles);
        
          // Merge Map Image, Layer Order, and Legend
          const finalCanvas = document.createElement("canvas");
          finalCanvas.width = mapCanvas.width;
          finalCanvas.height = mapCanvas.height;
          const ctx = finalCanvas.getContext("2d");
        
          // Draw the map first
          const mapImg = new Image();
          mapImg.src = mapImage;
          await new Promise((resolve) => (mapImg.onload = resolve));
          ctx.drawImage(mapImg, 0, 0);
        
          // Draw the layer order UI in the bottom left corner
          const layerX = 10;
          const layerY = finalCanvas.height - layerOrderCanvas.height - 10;
          ctx.drawImage(layerOrderCanvas, layerX, layerY);
        
          // Draw the map legend UI in the bottom right corner
          const legendX = finalCanvas.width - mapLegendCanvas.width - 10;
          const legendY = finalCanvas.height - mapLegendCanvas.height - 10;
          ctx.drawImage(mapLegendCanvas, legendX, legendY);
        
          // Convert to an image and trigger download
          finalCanvas.toBlob((blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "map_with_layer_order_and_legend.png";
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

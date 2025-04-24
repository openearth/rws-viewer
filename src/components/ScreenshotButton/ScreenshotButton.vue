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
  import { mapGetters } from 'vuex'
  import html2canvas from 'html2canvas';

  export default {
    props: {
      map: Object
    },
    computed: {
      ...mapGetters('app', [ 'viewerName' ]),
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
      
        // Ensure the Mapbox Legend component is expanded before capturing
        const mapLegendElement = document.querySelector(".map-legend");
        if (!mapLegendElement) {
          console.error("Map legend UI not found");
          return;
        }
        mapLegendElement.classList.add("map-legend--open");
      
        // Expand all legend items
        document.querySelectorAll(".map-legend .v-expansion-panel").forEach(panel => {
          panel.classList.add("v-expansion-panel--active");
          const panelContent = panel.querySelector(".v-expansion-panel-content");
          if (panelContent) {
            panelContent.style.display = "block";
            panelContent.style.maxHeight = "none";
          }
        });
      
        // Clone the Layer Order component
        const clonedLayerOrder = layerOrderElement.cloneNode(true);
        clonedLayerOrder.style.position = "absolute";
        clonedLayerOrder.style.left = "-9999px";
        document.body.appendChild(clonedLayerOrder);
        this.copyComputedStyles(layerOrderElement, clonedLayerOrder);

        // Stabilize Map Legend styling
        document.querySelectorAll(".map-legend .v-expansion-panel").forEach(panel => {
          panel.style.transition = "none";
          panel.style.overflow = "visible";
        });
        document.querySelectorAll(".map-legend .v-expansion-panel-content").forEach(content => {
          content.style.display = "block";
          content.style.maxHeight = "none";
          content.style.opacity = "1";
          content.style.visibility = "visible";
        });

        await this.$nextTick();

        // Clone the Mapbox Legend component
        const clonedMapLegend = mapLegendElement.cloneNode(true);
        clonedMapLegend.style.position = "absolute";
        clonedMapLegend.style.left = "-9999px";
        document.body.appendChild(clonedMapLegend);
        this.copyComputedStyles(mapLegendElement, clonedMapLegend);
      
        // Convert legend images to Base64 before capturing
        await this.convertImagesToBase64(clonedMapLegend);
      
        this.map.once('render', async () => {
          const mapCanvas = this.map.getCanvas();
          const mapImage = mapCanvas.toDataURL("image/png");
        
          // Capture cloned components with html2canvas
          const layerOrderCanvas = await html2canvas(clonedLayerOrder, { backgroundColor: null });
          const mapLegendCanvas = await html2canvas(clonedMapLegend, { backgroundColor: null });
        
          document.body.removeChild(clonedLayerOrder);
          document.body.removeChild(clonedMapLegend);
        
          // Merge Map Image, Layer Order, and Map Legend
          const finalCanvas = document.createElement("canvas");
          finalCanvas.width = mapCanvas.width;
          finalCanvas.height = mapCanvas.height;
          const ctx = finalCanvas.getContext("2d");
        
          // Draw the map first
          const mapImg = new Image();
          mapImg.src = mapImage;
          await new Promise((resolve) => (mapImg.onload = resolve));
          ctx.drawImage(mapImg, 0, 0);
        
          // Draw a white box with a grey border for the date and time
          const timestamp = new Date().toLocaleString();
          const text = this.viewerName + " - " + "Image generated at " + timestamp;
          ctx.font = "16px Arial";
          const textWidth = ctx.measureText(text).width + 20;
          const textHeight = 30;
          ctx.fillStyle = "white";
          ctx.fillRect(5, 5, textWidth, textHeight);
          ctx.strokeStyle = "grey";
          ctx.strokeRect(5, 5, textWidth, textHeight);
        
          // Draw the timestamp text inside the box
          ctx.fillStyle = "black";
          ctx.fillText(text, 15, 25);
        
          // Draw the cloned layer order UI in the bottom left corner
          const layerX = 10;
          const layerY = finalCanvas.height - layerOrderCanvas.height - 10;
          ctx.drawImage(layerOrderCanvas, layerX, layerY);
        
          // Draw the cloned map legend UI in the bottom right corner
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
      },

      async convertImagesToBase64(container) {
        const images = container.querySelectorAll("img");
        const promises = Array.from(images).map(async (img) => {
          if (!img.src.startsWith("data:image")) {
            const base64 = await this.imageToBase64(img.src);
            if (base64) {
              img.src = base64;
            }
          }
        });
        await Promise.all(promises);
      },

      imageToBase64(url) {
        return new Promise((resolve) => {
          fetch(url)
            .then(response => response.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            })
            .catch(() => resolve(null));
        });
      },

      copyComputedStyles(sourceElement, targetElement) {
        const computedStyle = window.getComputedStyle(sourceElement);
        for (let key of computedStyle) {
          targetElement.style[key] = computedStyle.getPropertyValue(key);
        }
        Array.from(sourceElement.children).forEach((child, index) => {
          if (targetElement.children[index]) {
            this.copyComputedStyles(child, targetElement.children[index]);
          }
        });
      }
    }
  };
</script>

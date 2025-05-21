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

      
        // Ensure the Mapbox Legend component is expanded before capturing
        const mapLegendElement = document.querySelector(".map-legend");
        if (!mapLegendElement) {
          console.error("Map legend UI not found");
          return;
        }

        // Store initial states
        const wasMapLegendOpen = mapLegendElement.classList.contains("map-legend--open");

        // Store which legend panels were open
        const legendPanels = document.querySelectorAll(".map-legend .v-expansion-panel");
        const openPanels = [];
        legendPanels.forEach((panel, index) => {
          if (panel.classList.contains("v-expansion-panel--active")) {
            openPanels.push(index);
          }
        });

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

        // Ensure Map Legend is fully expanded
        mapLegendElement.classList.add("map-legend--open");
        document.querySelectorAll(".map-legend .v-expansion-panel").forEach(panel => {
          panel.classList.add("v-expansion-panel--active");
        });
        document.querySelectorAll(".map-legend .v-expansion-panel-content").forEach(content => {
          content.style.display = "block";
          content.style.maxHeight = "none";
        });

        // Clone the Mapbox Legend component
        const clonedMapLegend = mapLegendElement.cloneNode(true);
        clonedMapLegend.style.position = "absolute";
        clonedMapLegend.style.left = "-9999px";
        document.body.appendChild(clonedMapLegend);

        document.body.appendChild(clonedMapLegend);
        this.copyComputedStyles(mapLegendElement, clonedMapLegend);

        // Force clean styling
        clonedMapLegend.style.backgroundColor = "white";
        clonedMapLegend.style.border = "none";
        clonedMapLegend.style.boxShadow = "none";

        // Prevent cropping by enforcing layout rules
        clonedMapLegend.style.height = "auto";
        clonedMapLegend.style.maxHeight = "none";
        clonedMapLegend.style.overflow = "visible";
        clonedMapLegend.style.transform = "none";
        clonedMapLegend.style.transition = "none";

        clonedMapLegend.querySelectorAll('.v-expansion-panel, .v-expansion-panel-content').forEach(el => {
          el.style.height = "auto";
          el.style.maxHeight = "none";
          el.style.overflow = "visible";
          el.style.transform = "none";
          el.style.transition = "none";
        });

        clonedMapLegend.querySelectorAll('.v-card, .v-card__text, .v-expansion-panel, .v-expansion-panel-content').forEach(el => {
          el.style.backgroundColor = "white";
          el.style.border = "none";
          el.style.color = "black";
        });

        // Remove padding, margin, and gaps that cause extra space
        clonedMapLegend.style.padding = "0";
        clonedMapLegend.style.margin = "0";

        clonedMapLegend.querySelectorAll('*').forEach(el => {
          el.style.marginBottom = "0";
          el.style.paddingBottom = "0";
          el.style.rowGap = "0";
          el.style.columnGap = "0";
        });

        clonedMapLegend.classList.remove('theme--light');
        clonedMapLegend.querySelectorAll('[class*="elevation"]').forEach(el => {
          el.classList.remove(...Array.from(el.classList).filter(cls => cls.startsWith('elevation')));
        });

        // Convert legend images to Base64 before capturing
        await this.convertImagesToBase64(clonedMapLegend);

        // Capture the cloned Legend
        await this.$nextTick();
        await this.wait(100);
        await this.ensureImagesLoaded(clonedMapLegend);

        const mapLegendCanvas = await html2canvas(clonedMapLegend, { backgroundColor: null });

        // Remove the clone after capture
        document.body.removeChild(clonedMapLegend);

      
        this.map.once('render', async () => {
          const mapCanvas = this.map.getCanvas();
          const mapImage = mapCanvas.toDataURL("image/png");
        
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
        
          // Draw the cloned map legend UI in the bottom right corner
          const legendX = finalCanvas.width - mapLegendCanvas.width - 10;
          const legendY = finalCanvas.height - mapLegendCanvas.height - 10;
          ctx.drawImage(mapLegendCanvas, legendX, legendY);
        
          // Format the timestamp safely for filenames
          const now = new Date();
          const pad = n => n.toString().padStart(2, '0');
          const safeTimestamp = `${ now.getFullYear() }-${ pad(now.getMonth() + 1) }-${ pad(now.getDate()) }_${ pad(now.getHours()) }-${ pad(now.getMinutes()) }-${ pad(now.getSeconds()) }`;


          // Convert to an image and trigger download
          finalCanvas.toBlob((blob) => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `map_with_legend_${ safeTimestamp }.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, "image/png");
        });

        // Restore Map Legend state
        if (!wasMapLegendOpen) {
          mapLegendElement.classList.remove("map-legend--open");
        }

        // Restore Legend Panels state
        legendPanels.forEach((panel, index) => {
          if (!openPanels.includes(index)) {
            panel.classList.remove("v-expansion-panel--active");
          }
        });

        // Clean inline styles we added
        document.querySelectorAll(".map-legend .v-expansion-panel-content").forEach(content => {
          content.style.display = "";
          content.style.maxHeight = "";
          content.style.opacity = "";
          content.style.visibility = "";
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
      },

      wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      },

      async ensureImagesLoaded(container) {
        const images = container.querySelectorAll('img');
        const promises = Array.from(images).map(img => {
          if (img.complete) {
            return Promise.resolve();
          }
          return new Promise(resolve => {
            img.onload = img.onerror = resolve;
          });
        });
        await Promise.all(promises);
      }
    }
  };
</script>

import { isNil } from "~/lib/helpers.js";

export default {
  name: "v-mapbox-layer",

  inject: [ "getMap" ],

  render: () => null,

  props: {
    options: {
      type: Object,
      default: () => ({}),
    },

    // Allows to place a layer before another
    before: {
      type: String,
      default: undefined,
    },

    clickable: {
      type: Boolean,
      default: false,
    },

    opacity: {
      type: Number,
      required: false,
      validator: (val) => val >= 0 && val <= 1,
    },
  },

  data: () => ({
    isInitialized: false,
  }),

  methods: {
    deferredMountedTo() {
      if (!this.isInitialized) {
        this.renderLayer();
        this.isInitialized = true;
      }
    },

    renderLayer() {
      this.removeLayer();
      this.addLayer();
    },

    addLayer() {
      const map = this.getMap();
      if (this.before && map.getLayer(this.before)) {
        map.addLayer(this.options.layer, this.before)
      } else if (map.getLayer('gl-draw-polygon-fill-inactive.cold')) {
        map.addLayer(this.options.layer, 'gl-draw-polygon-fill-inactive.cold')
      } else {
        map.addLayer(this.options.layer)
      }

      if (this.clickable) {
        const layerId = this.options.layer.id;
        map.on("click", layerId, this.clickFn);
        map.on("mouseenter", layerId, this.mouseEnterFn);
        map.on("mouseleave", layerId, this.mouseLeaveFn);
      }


      if (!isNil(this.opacity)) {
        this.setOpacity();
      }
    },

    removeSource() {
      const map = this.getMap();
      if (map) {
        const sourceKey = this.options.source.key;
        const source = map.getSource(sourceKey);
        if (source) {
          map.removeSource(sourceKey);
        }
      }
    },

    removeLayer() {
      const map = this.getMap();
      if (map) {
        const layerId = this.options.layer.id;
        const layer = map.getLayer(layerId);
        if (layer) {
          map.removeLayer(layerId);
          if (this.clickable) {
            map.off("click", layerId, this.clickFn);
            map.off("mouseenter", layerId, this.mouseEnterFn);
            map.off("mouseleave", layerId, this.mouseLeaveFn);
          }
        }
      }
    },

    clickFn(e) {
      this.$emit("click", e);
    },

    mouseEnterFn() {
      const map = this.getMap();
      map.getCanvas().style.cursor = "pointer";
    },

    mouseLeaveFn() {
      const map = this.getMap();
      map.getCanvas().style.cursor = "";
    },

    setOpacity() {
      const map = this.getMap();
      const { id, type } = this.options.layer;
      map.setPaintProperty(id, `${ type }-opacity`, this.opacity);
    },
  },

  mounted() {
    const map = this.getMap();
    // We can immediately initialize if we have the map ready

    if (map) {
      map.addSource(this.options.source.key, this.options.source);
      this.renderLayer();
      this.isInitialized = true;
    }
  },

  destroyed() {
    this.removeLayer();
    this.removeSource();
  },

  watch: {
    options: {
      deep: true,
      handler() {
        this.renderLayer();
      },
    },

    opacity() {
      this.setOpacity();
    },
    before(onTopLayer) {
      const map = this.getMap();
      map.moveLayer(this.options.layer.id, onTopLayer);
      if (!onTopLayer) {
        map.moveLayer(this.options.layer.id, "gl-draw-polygon-fill-inactive.cold");
      }
    },
  },
};

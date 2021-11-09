<script>
  import { differenceWith } from 'ramda'
  import MapboxDraw from '@mapbox/mapbox-gl-draw'
  import DrawRectangle from 'mapbox-gl-draw-rectangle-mode'

  const differenceWithId = differenceWith((x, y) => x.id === y.id)

  export default {
    props: {
      drawMode: {
        type: String,
        default: null,
      },
      templateFeatures: {
        type: Array,
        required: true,
      },
    },

    watch: {
      drawMode(mode) {
        if(mode) {
          this.mbDraw.changeMode(`draw_${ mode }`)
        }
        else {
          this.mbDraw.changeMode('simple_select')
        }
      },

      templateFeatures(newFeatures, oldFeatures) {
        const featuresToAdd = differenceWithId(newFeatures, oldFeatures)
        const featuresToRemove = differenceWithId(oldFeatures, newFeatures)
        featuresToAdd.forEach(feature => {
          this.mbDraw.add(feature)
        })
        if(featuresToRemove.length) {
          this.mbDraw.delete(featuresToRemove.map(({ id }) => id))
        }
        this.onCollectionChange()
      },
    },

    methods: {
      onCollectionChange() {
        const drawnFeatures = this.mbDraw.getAll()
        this.$emit('change', drawnFeatures)
      },

      deferredMountedTo(map) {
        const modes = MapboxDraw.modes
        modes.draw_rectangle = DrawRectangle

        const mbDraw = new MapboxDraw({
          displayControlsDefault: false,
          // We add the delete control and then hide it visually
          // so the user can delete with keyboard commands
          controls: {
            trash: true,
          },
          modes,
        })

        this.mbDraw = mbDraw
        map.addControl(mbDraw)

        map
          .on('draw.create', this.onCollectionChange)
          .on('draw.delete', this.onCollectionChange)
          .on('draw.update', this.onCollectionChange)
      },
    },

    render: () => null,
  }
</script>

<style>
.mapbox-gl-draw_ctrl-draw-btn {
  display: none !important;
}
</style>

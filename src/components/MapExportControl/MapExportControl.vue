<script>
  import axios from 'axios'
  import { saveAs } from 'file-saver'
  import { stringify } from 'query-string'
  import b64ToBlob from '~/lib/b64-to-blob'

  const printIconElement = document.createElement('i')
  printIconElement.className = 'mdi mdi-printer'

  const loadingIconElement = document.createElement('i')
  loadingIconElement.className = 'mdi mdi-loading mdi-spin'

  class HelloWorldControl {
    constructor({ onClick }) {
      this._onClick = onClick
    }

    onAdd(map) {
      this._map = map
      const container = document.createElement('div')
      container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'

      const button = document.createElement('button')
      button.className = 'mapboxgl-ctrl-icon'
      button.id = 'print-button'

      button.appendChild(printIconElement)
      container.appendChild(button)

      button.addEventListener('click', () => {
        this._onClick()
      })

      return container
    }
  }
  export default {
    props: {
      viewer: {
        type: String,
        default: null,
      },
      layers: {
        type: Array,
        default: null,
      },
    },

    methods: {
      deferredMountedTo(map) {
        map.addControl(new HelloWorldControl({
          onClick: this.print,
        }), 'top-right')
      },
      async print() {
        const printButtonEl = document.getElementById('print-button')
        printButtonEl.removeChild(printIconElement)
        printButtonEl.appendChild(loadingIconElement)
        printButtonEl.setAttribute('disabled', 'disabled')

        try {
          const query = stringify({
            layers: this.layers.join(','),
            viewer: this.viewer,
            zoom: map.getZoom(),
            center: map.getCenter(),
            lat: map.getCenter().lat,
            lng: map.getCenter().lng,
          })

          const { data } = await axios(`/.netlify/functions/export?${ query }`)
          const blob = b64ToBlob(data.pdf, 'application/pdf')
          saveAs(blob, 'print.pdf')
        } catch (e) {
          console.log(e)
        }

        printButtonEl.removeChild(loadingIconElement)
        printButtonEl.appendChild(printIconElement)
        printButtonEl.removeAttribute('disabled')
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

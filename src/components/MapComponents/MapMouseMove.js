export default {
  name: 'map-mouse-move',

  render: () => null,

  methods: {
    deferredMountedTo(map) {
      map.on('mousemove', event => this.$emit('mousemove', event))
    },
  },
}



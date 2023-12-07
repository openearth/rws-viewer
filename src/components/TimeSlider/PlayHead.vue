<template>
  <button
    v-dragged="onDragged"
    class="playhead"
    :class="{ 'is-dragging': isDragging }"
    @dragstart.prevent
  >
    <div class="drag-area" />
  </button>
</template>

<script>
  import VDragged from 'v-dragged'
  import debounce from 'lodash.debounce'
  import INTERFACE  from './INTERFACE'

  export default {
    directives: {
      dragged: VDragged.directive,
    },

    props: {
      timings: {
        type: Array,
        required: true,
      },
      activeTiming: {
        type: Object,
        required: true,
      },
      snap: {
        type: Boolean,
        default: false,
      },
    },

    data: () => ({
      isDragging: false,
    }),

    watch: {
      timings: {
        handler() {
          this.$nextTick(this.getPositionsFromDOM)
        },
        immediate: true,
      },

      activeTiming: {
        handler(newTiming) {
          // @TOCHECK :: Using T1 as a unique identifier, check if this is scalable
          if (this.internalActiveTiming?.[INTERFACE.T1] === newTiming[INTERFACE.T1]) {
            return
          }
          this.$nextTick(() => {
            const { rect: { x } } = this.timingsWithPosition
              .find(t => t.timing[INTERFACE.T1] === newTiming[INTERFACE.T1])

            this.$el.style.left = (x - this.boundLeft) + 'px'
            this.internalActiveTiming = newTiming
          })
        },
        immediate: true,
      },
    },

    mounted() {
      this.onResizeDebounced = debounce(this.getPositionsFromDOM, 100)
      window.addEventListener('resize', this.onResizeDebounced)
    },

    beforeDestroy() {
      window.removeEventListener('resize', this.onResizeDebounced)
    },

    methods: {
      onDragged(evt) {
        if (evt.first) {
          this.isDragging = true
        }

        const timelineWidth = this.boundRight - this.boundLeft

        let x = evt.clientX
        let xWithinBounds
        let playHeadLeft

        if (this.snap) {
          x = this.binarySearchClosest(x, this.snapPoints)
        }

        if (x < this.boundLeft) {
          xWithinBounds = this.boundLeft
          playHeadLeft = 0
        } else if (x > this.boundRight) {
          xWithinBounds = this.boundRight
          playHeadLeft = timelineWidth
        } else {
          xWithinBounds = x
          playHeadLeft = x - this.boundLeft
        }

        this.$el.style.left = playHeadLeft + 'px'

        if (evt.last) {
          const collidingTiming = this.detectCollision(xWithinBounds)
          const percentage = playHeadLeft / timelineWidth * 100

          this.internalActiveTiming = collidingTiming
          this.$emit('drag-end', { percentage, timing: collidingTiming })
          this.isDragging = false
        }
      },

      binarySearchClosest(num, arr) {
        let mid
        let lo = 0
        let hi = arr.length - 1
        while (hi - lo > 1) {
          mid = Math.floor ((lo + hi) / 2)
          if (arr[mid] < num) {
            lo = mid
          } else {
            hi = mid
          }
        }
        if (num - arr[lo] <= arr[hi] - num) {
          return arr[lo]
        }
        return arr[hi]
      },

      detectCollision(x) {
        // @PERFORMANCE :: Could be optimized with type of binary search if needed
        return this.timingsWithPosition
          .find(({ rect }) => {
            if (x < rect.x) {
              return false
            }
            if (x > (rect.x + rect.width)) {
              return false
            }
            return true
          })
          ?.timing
      
      },

      getPositionsFromDOM() {
        // Get and set timeline lower and upper bounds
        const bounds = this.$el.parentElement.getBoundingClientRect()
        this.boundLeft = bounds.left
        this.boundRight = bounds.right

        // Create new objects that contain both timing and positioning data
        this.timingsWithPosition = this.timings.map((timing, index) => {
          const $el = document.getElementById('t' + index)
          const { x, width } = $el.getBoundingClientRect()
          return {
            timing,
            rect: { x, width },
          }
        })

        // Create and array of snapping points if desired
        if (this.snap) {
          this.snapPoints = this.timingsWithPosition.map(({ rect: { x } }) => x)
        }
      },
    },
  }
</script>

<style lang="scss" scoped>
.playhead {
  position: absolute;
  height: 140%;
  bottom: -20%;
  width: 0;

  cursor: grab;

  &.is-dragging {
    cursor: grabbing;
  }

  z-index: 10;

  &::before {
    position: absolute;
    content: '';
    width: 2px;
    height: 100%;
    top: 0;
    left: -1px;
    background-color: red;
  }

  &::after {
    position: absolute;
    content: '';
    width: 10px;
    height: 10px;
    bottom: -6px;
    left: -5px;
    background-color: red;
    border-radius: 100%;
  }
}

.drag-area {
  position: absolute;
  top: 0;
  left: -6px;
  width: 12px;
  height: 100%;
}
</style>

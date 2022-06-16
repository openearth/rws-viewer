<template>
  <v-card
    v-if="timings.length"
    class="time-slider pa-1"
    elevation="2"
    width="68%"
    rounded
  >
    <div
      v-if="mode === 'simple-select'"
      class="d-flex align-center"
    >
      <v-btn
        icon
        :disabled="!timings.length || internalValue[INTERFACE.T1] === timings[0][INTERFACE.T1]"
        @click="onInput(timings[currentIndex - 1])"
      >
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <div class="flex-grow-1 px-2">
        <v-select
          v-model="internalValue"
          outlined
          dense
          hide-details
          :items="timings"
          :item-text="INTERFACE.LABEL"
          :item-value="INTERFACE.T1"
          return-object
          @input="onInput"
        />
      </div>
      <v-btn
        icon
        :disabled="!timings.length || internalValue[INTERFACE.T1] === timings[ timings.length - 1 ][INTERFACE.T1]"
        @click="onInput(timings[currentIndex + 1])"
      >
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </div>

    <v-slider
      v-if="mode === 'simple-slider'"
      v-model="simpleSliderValue"
      class="slider-format px-2"
      :tick-labels="sliderTicks"
      :max="sliderTicks.length ? sliderTicks.length - 1 : 0"
      :step="1"
      ticks="always"
      tick-size="5"
    />

    <div
      v-if="mode === 'timeline'"
      class="px-2"
    >
      <div class="timeline_bar">
        <div
          v-for="(timing, index) in timings"
          :id="'t' + index"
          :key="index"
          :class="timing[INTERFACE.T2] ? 'timeline_interval' : 'timeline_point'"
          :style="inferTimingStyle(timing)"
          @click="onInput(timing)"
        />
        <play-head
          :timings="timings"
          :active-timing="internalValue"
          :snap="true"
          @drag-end="onPlayHeadDragEnd"
        />
      </div>
    </div>
  </v-card>
</template>

<script>
// @TOCHECK :: We're doing some triple-equals '===' checks on DateTime objects.
// These are passed by reference on timing objects, so the triple-equals check works,
// but it might be a bit shaky - in future iterations it might be better to check for primitives,
// for example by using the `getTime()` method and comparing results

  import INTERFACE from './INTERFACE'
  import PlayHead from './PlayHead'

  export default {

    components: {
      PlayHead,
    },
    props: {
      timings: {
        type: Array,
        default: () => [],
      },
      mode: {
        type: String,
        default: 'simple-select',
      },
      value: {
        type: Object,
        default: undefined,
      },
    },

    data: () => ({
      internalValue: null,
      INTERFACE,
    }),
    computed: {
      currentIndex() {
        return this.timings.findIndex(timing =>
          timing[INTERFACE.T1] === this.internalValue[INTERFACE.T1])
      },

      simpleSliderValue: {
        get() {
          return this.currentIndex
        },
        set(index) {
          this.onInput(this.timings[index])
        },
      },

      sliderTicks() {
        return this.timings.map(timing => timing[INTERFACE.LABEL])
      },

      timelineCompounds() {
        const { timings } = this
        const lastTiming = timings[timings.length - 1]

        const beginDate = timings[0][INTERFACE.T1]
        const endDate = lastTiming[INTERFACE.T2] || lastTiming[INTERFACE.T1]
        const totalDuration = endDate - beginDate
        const beginLabel = timings[0][INTERFACE.LABEL]
        const endLabel = lastTiming[INTERFACE.LABEL]

        return {
          beginDate,
          endDate,
          totalDuration,
          beginLabel,
          endLabel,
        }
      },
    },

    watch: {
      timings: {
        handler() {
          this.resetInternalValue()
        },
        immediate: true,
      },
    },
    methods: {
      onInput(timing) {
        const timingClone = { ...timing }
        this.internalValue = timingClone
        this.$emit('input', timingClone)
      },

      resetInternalValue() {
        if (this.value !== undefined) {
          this.internalValue = { ...this.value }
        } else {
          this.internalValue = { ...this.timings[0] }
        }
      },

      inferTimingStyle(timing) {
        const durationFromStart = timing[INTERFACE.T1] - this.timelineCompounds.beginDate
        const percentage = Math.round(durationFromStart / this.timelineCompounds.totalDuration * 100)
        const returnObj = {
          left: percentage + '%',
        }
        if (timing[INTERFACE.T2]) {
          const intervalDuration = timing[INTERFACE.T2] - timing[INTERFACE.T1]
          const percentage = Math.round(intervalDuration / this.timelineCompounds.totalDuration * 100)
          returnObj.width = percentage + '%'
        }
        return returnObj
      },

      onPlayHeadDragEnd({ percentage, timing }) {
        console.info(`Percentage played: ${ percentage }%`)
        if (timing) {
          this.onInput(timing)
        }
      },
    },
  }
</script>

<style lang="scss" >

.v-slider__tick-label {
  font-size: calc(.33 * (1.4vh + 0.9vw));
}
.time-slider {
  position:absolute;
  z-index: 5;
  max-width: 5000;
  bottom: 1;
  top: 5px;
  left: 470px;
}
.timeline {
  &_bar {
    position: relative;
    border: thin solid #dbdbdb;
    background-color: #f2f2f2;
    height: 20px;
  }

  // @FIX :: Overlapping elements make it that when dropping
  // the playhead on a point that is 'over' the end of an interval,
  // it will still 'emit' the interval value because that is the
  // first it finds in the array.
  // Same for snapping, it will snap to the point but will 'emit'
  // the value of the array.
  &_point,
  &_interval {
    position: absolute;
    height: 100%;
    cursor: pointer;

    &::after {
      position: absolute;
      content: '';
      top: 2px;
      left: 2px;
      right: 2px;
      bottom: 2px;
      transition: 150ms ease-out;
    }

    &:hover::after {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }

  &_point {
    top: -3px;
    width: 10px;
    height: calc(100% + 6px);
    transform: translateX(-5px);
    z-index: 2;

    &::after {
      border: 1px solid blue;
      background-color: rgba(blue, 0.7);
    }

    &:hover::after {
      border-radius: 2px;
      background-color: blue;
    }
  }

  &_interval {
    z-index: 1;

    &::after {
      border: 1px solid blueviolet;
      background-color: rgba(blueviolet, 0.3);
    }
  }
}
</style>

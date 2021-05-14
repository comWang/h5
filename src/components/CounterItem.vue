<template>
  <div class="counter-item-container">
    <div class="counter-card">
      <div class="pane top back">
        <div class="clip">
          <div class="digit">{{ mode === INCREASE ? nextDigit : digit }}</div>
        </div>
      </div>
      <div
        v-show="mode === READY || mode === INCREASE"
        :class="['pane top front', isAnimating && 'active']"
        @transitionend.stop="onTransitionEnd"
      >
        <div class="clip a">
          <div class="digit">
            {{ digit }}
          </div>
        </div>
        <div class="clip b">
          <div class="digit-next">
            {{ nextDigit }}
          </div>
        </div>
      </div>
      <div
        v-show="mode === READY || mode === DECREASE"
        :class="['pane bottom front', isAnimating && 'active']"
        @transitionend.stop="onTransitionEnd"
      >
        <div class="clip a">
          <div class="digit">
            {{ digit }}
          </div>
        </div>
        <div class="clip b">
          <div class="digit-next">
            {{ nextDigit }}
          </div>
        </div>
      </div>
      <div class="pane bottom back">
        <div class="clip">
          <div class="digit">{{ mode === DECREASE ? nextDigit : digit }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const INCREASE = 'INCREASE'
const DECREASE = 'DECREASE'
const READY = 'READY'

export default {
  props: {
    value: {
      type: Number,
      default: 0,
    },
    mode: {
      validator(val) {
        if ([INCREASE, DECREASE, READY].includes(val)) return true
        throw new Error('Only INCREASE,DECREASE and READY allowed,but got ' + val)
      },
      default: DECREASE,
    },
    defaultValue: {
      type: Number,
      default: 0,
    },
    // 数字更新后多久开始翻转动画
    delay: {
      type: Number,
      default: 10,
    },
  },
  data() {
    return {
      INCREASE,
      DECREASE,
      READY,
      digit: this.defaultValue,
      isAnimating: false,
      // 防止定时器频繁，导致动画交叠
      blocked: false,
    }
  },
  watch: {
    value() {
      setTimeout(() => {
        this.prepareAnimation()
      }, this.delay)
    },
  },
  computed: {
    nextDigit() {
      let num
      if (this.mode === INCREASE) {
        num = this.digit + 1
      } else if (this.mode === DECREASE) {
        num = this.digit - 1
      }
      return num < 0 ? num + 10 : num > 9 ? num - 10 : num
    },
  },
  mounted() {
    this.prepareAnimation()
  },
  methods: {
    prepareAnimation() {
      if (!this.blocked && this.digit !== this.value) {
        setTimeout(() => {
          this.isAnimating = true
          this.blocked = true
        }, 100)
      }
    },
    setDigit() {
      let { digit } = this
      if (digit === this.value) return
      if (this.mode === INCREASE) {
        digit++
      } else if (this.mode === DECREASE) {
        digit--
      }
      if (digit < 0) {
        this.digit = 10 + digit
      } else if (digit > 9) {
        this.digit = digit - 10
      } else {
        this.digit = digit
      }
      // 因为数字更新，所以立即启用翻转动画
      this.prepareAnimation()
    },
    // 在下一次翻转前处理数据
    onTransitionEnd() {
      this.blocked = false
      this.isAnimating = false
      this.setDigit()
    },
  },
}
</script>

<style lang="less" scoped>
.counter-card {
  position: relative;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  font-size: 60px;
  perspective: 1000;
  -webkit-perspective: 1000;
  > div {
    width: 100%;
  }
  .pane {
    position: absolute;
    width: 100%;
    height: 50%;
    transform-style: preserve-3d;
    background-color: #fff;
    &.active {
      transition: transform 1s ease-out;
    }
    &.top {
      top: 0;
      bottom: auto;
      .clip .digit-next {
        transform: translateY(-50%);
      }
    }
    &.bottom {
      top: auto;
      bottom: 0;
      .clip .digit {
        transform: translateY(-50%);
      }
    }
    &.front {
      z-index: 2;
    }
    &.front.top {
      transform-origin: 50% 100%;
      &.active {
        transform: rotateX(-180deg);
        background-color: #fafafa;
      }
    }
    &.front.bottom {
      transform-origin: 50% 0;
      &.active {
        transform: rotateX(180deg);
        background-color: #fafafa;
      }
    }

    .clip {
      overflow: hidden;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      &.a {
        z-index: 1;
        backface-visibility: hidden;
      }
      &.b {
        transform: rotateX(180deg);
        backface-visibility: hidden;
      }
    }
    .digit {
      width: 100%;
      height: 200%;
    }
    .digit-next {
      width: 100%;
      height: 200%;
    }
  }
}
</style>

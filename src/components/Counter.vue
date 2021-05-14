<template>
  <div class="app-counter">
    <CounterItem
      v-for="(item, i) in digits"
      :key="i"
      :value="item"
      :mode="mode"
      style="margin-left: 20px"
    />
  </div>
</template>

<script>
import CounterItem from './CounterItem'

export default {
  components: { CounterItem },
  props: {
    value: {
      type: Number,
      default: 0,
    },
    mode: {
      type: String,
      default: 'INCREASE',
    },
  },
  data() {
    return {}
  },
  computed: {
    digits() {
      return `${this.value}`.split('').map(item => parseInt(item, 10))
    },
  },
}
</script>

<style lang="less" scoped>
.app-counter {
  display: flex;
  align-items: center;
}
</style>

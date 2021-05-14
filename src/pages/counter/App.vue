<template>
  <div class="container">
    <Counter :value="value" :mode="mode" />
  </div>
</template>

<script>
import { parseQueryParams } from '@/utils/common'
import Counter from '@/components/Counter'

export default {
  components: {
    Counter,
  },
  data() {
    return {
      value: 0,
      mode: 'INCREASE',
    }
  },
  created() {
    this.value = parseInt(parseQueryParams().value || 0)
    this.mode = (parseQueryParams().mode || '').toUpperCase()
  },
}
</script>

<style lang="less" scoped>
.container {
  box-sizing: border-box;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #555;
}
</style>

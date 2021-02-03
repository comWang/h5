<template>
  <div>
    <div id="meteor-rain"></div>
  </div>
</template>

<script>
import meteor from './meteor-shower'

export default {
  data: () => ({
    meteor: null,
  }),
  mounted() {
    this.meteor = meteor.init(document.getElementById('meteor-rain'))
    this.meteor.paint()
  },
}
</script>

<style lang="less" scoped>
#meteor-rain {
  width: 100%;
  background-color: #fafafa;
}
</style>

import Vue from 'vue'
import App from './App'

Vue.productionTip = false

new Vue({
  el: '#app',
  render: h => h(App),
})

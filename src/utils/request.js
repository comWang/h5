import axios from 'axios'
import { Notify } from 'vant'
import { elegantPromise, throttle } from './common'

const instance = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL,
  timeout: 8000,
})

const errorNotify = throttle(Notify, null, 3 * 1000)

instance.interceptors.request.use(
  function(config) {
    // 在发送请求之前做些什么
    return config
  },
  function(error) {
    // 对请求错误做些什么
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  function(response) {
    // 对响应数据做点什么
    return response.data
  },
  function(error) {
    // 对响应错误做点什么
    if (error.response.status === 401) {
      errorNotify({
        type: 'danger',
        message: '认证失败，请重新登录！',
      })
    } else if (error.response.status >= 500 || error.response.status < 200) {
      errorNotify({
        type: 'warning',
        message: `服务器开小差了。错误码：${error.response.status}`,
      })
    }
    return Promise.reject(error)
  }
)

const request = (url, config) => elegantPromise(instance(url, config))

export default request

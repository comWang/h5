export const throttle = (fn, env = null, delay = 15, isImmediate = false) => {
  let timer = null
  let start = null
  return function(...rest) {
    if (!start) {
      start = new Date()
      if (isImmediate) fn.apply(env, rest)
      else timer = setTimeout(() => fn.apply(env, rest), delay)
    } else {
      clearTimeout(timer)
      const now = new Date()
      if (now - start >= delay) {
        fn.apply(env, rest)
        start = null
      } else {
        timer = setTimeout(() => fn.apply(env, rest), delay)
        start = now
      }
    }
  }
}

export const throttleFrame = (fn, env = null) => {
  let timer = null
  return function(...rest) {
    if (timer) cancelAnimationFrame(timer)
    timer = requestAnimationFrame(() => {
      timer = null
      fn.apply(env, rest)
    })
  }
}

export const elegantPromise = promise => {
  return new Promise(resolve => {
    promise.then(data => resolve([null, data])).catch(err => resolve([err, null]))
  })
}

export const setDocumentTitle = function(title) {
  document.title = title
  const ua = navigator.userAgent
  // eslint-disable-next-line
  const regex = /\bMicroMessenger\/([\d\.]+)/
  if (regex.test(ua) && /ip(hone|od|ad)/i.test(ua)) {
    const i = document.createElement('iframe')
    i.src = '/favicon.ico'
    i.style.display = 'none'
    i.onload = function() {
      setTimeout(function() {
        i.remove()
      }, 9)
    }
    document.body.appendChild(i)
  }
}

export const filterEmptyProps = data => {
  if (typeof data !== 'object') return data
  const keys = Object.keys(data)
  if (keys.length) {
    keys.forEach(key => {
      const value = data[key]
      if (value === undefined || value === null || value === '') delete data[key]
    })
  }

  return data
}

// 解析地址栏的query参数并以object中key-value形式返回
export const parseQueryParams = () => {
  const searchString = location.search
  if (!/^\?.*$/.test(searchString)) return {}
  return searchString
    .slice(1, searchString.length)
    .split('&')
    .reduce((params, item) => {
      const [key, value] = item.split('=')
      params[key] = ['false', 'true'].includes(value)
        ? Boolean(value)
        : value === undefined
        ? true
        : value
      return params
    }, {})
}

/**
 *
 * @param  {...any} args
 * (params: object) 以当前href（不带查询参数的部分）为基础拼接params中参数
 * (url: string, params: object) 以指定url（不能带查询参数）为基础拼接params中参数
 * @returns url
 */
export const stringifyQueryParams = (...args) => {
  let params = null
  let defaultURL = location.origin + location.pathname
  if (!args.length) return defaultURL
  else if (args.length === 1) {
    params = args[0]
  } else {
    defaultURL = args[0]
    params = args[1]
  }
  if (!params || typeof params !== 'object') return defaultURL
  const keys = Object.keys(params)
  const queryString = keys.length
    ? '?' + keys.map(key => (params[key] ? `${key}=${params[key]}` : key)).join('&')
    : ''

  return defaultURL + queryString
}

export const digitString = (num, placeholder = '--') => {
  if (!isNaN(parseFloat(num))) return num
  return placeholder
}
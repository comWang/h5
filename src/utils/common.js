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

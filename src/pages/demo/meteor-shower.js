// 获取宽高。初始宽高都是200，使用函数方便后续以此为基数计算其他宽高
const w = num => window.innerWidth
const h = num => window.innerHeight
const clear = ctx => ctx.clearRect(0, 0, w(200), h(200))
const arrayToRGBA = arr => {
  return (
    'rgba(' +
    arr
      .slice(0, 3)
      .concat(Math.round((arr[3] / 255) * 1 * 100) / 100)
      .join(',') +
    ')'
  )
}

const Curve = {
  /**
   *
   * @param {number} t 运动至当前状态的持续时间(ms)
   * @param {number} b 初始值
   * @param {number} c 变化量
   * @param {number} d 总的运动时间
   */
  Linear(t, b, c, d) {
    return (c * t) / d + b
  },
  Quad: {
    // 二次方缓动效果
    easeIn: function(t, b, c, d) {
      return c * (t /= d) * t + b
    },
    easeOut: function(t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b
    },
    easeInOut: function(t, b, c, d) {
      if ((t /= d / 2) < 1) return (c / 2) * t * t + b
      return (-c / 2) * (--t * (t - 2) - 1) + b
    },
  },
  Linear2(t, b, c, d = 20) {
    const time = t / d
    return b + c * time
  },
}

class Meteor {
  // 初始位置
  constructor(fn) {
    if (fn instanceof Function) this.positionFn = fn
    // 周期运动的次数，传递给相关函数（从1开始）
    this.loopCount = 0
    this.reset()
  }

  reset() {
    const [x, y] = this.positionFn(++this.loopCount)
    this.x = x
    this.y = y
  }

  positionFn() {
    return [Math.round(Math.random() * w(200)), Math.round(Math.random() * h(200))]
  }

  calcShapeCoordinate(r, l = 50, vx = -3, vy = 1) {
    const x0 = this.x
    const y0 = this.y
    const v = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2))
    const cosA = vx / v
    const sinA = vy / v
    const cartX_up = x0 - r * sinA
    const cartY_up = y0 + r * cosA
    const cartX_down = x0 + r * sinA
    const cartY_down = y0 - r * cosA
    const angleX = x0 - l * cosA
    const angleY = y0 - l * sinA
    const toCanvasCoordinate = (x, y) => [x, y]
    return [
      toCanvasCoordinate(cartX_up, cartY_up),
      toCanvasCoordinate(cartX_down, cartY_down),
      toCanvasCoordinate(angleX, angleY),
    ]
  }

  draw(ctx) {
    const r = 1
    const vx = -3
    const vy = 1
    if ((this.x > w(200) || this.x < 0) && (this.y > h(200) || this.y < 0)) {
      this.reset()
    }
    const [up, down, other] = this.calcShapeCoordinate(r)
    ctx.save()
    ctx.shadowColor = '#16c79a'
    ctx.shadowBlur = 3
    // 画尾巴
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.moveTo(...up)
    ctx.lineTo(...down)
    ctx.lineTo(...other)
    ctx.closePath()
    ctx.fill()
    // 画头部
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(this.x, this.y, r, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.restore()

    this.x += vx
    this.y += vy
  }
}

class Star {
  // 初始位置
  constructor(ctx, fn, options) {
    if (fn instanceof Function) this.statusFn = fn
    this.ctx = ctx
    // 周期运动的次数，传递给相关函数（从1开始）
    this.loopCount = 1
    this.options = Object.assign({}, options)
    this.init()
  }

  init() {
    const [x, y, r = 1] = this.statusFn(this.loopCount, this.options)
    this.loopCount++
    this.x = x
    this.y = y
    this.r = r
    // 闪烁间隔时间
    this.shine = Math.round(Math.random() * 1000 + 300)
    this.lastShine = null
    this.fillColor = null
  }

  /**
   * @returns <x0: number, y0: number, r: number>
   */
  statusFn() {
    return [
      Math.round(Math.random() * w(200)),
      Math.round(Math.random() * h(200)),
      Math.round(Math.random() * 10 + 1) / 8,
    ]
  }

  calcFillColor() {
    const now = new Date()
    // 控制闪烁最短间隔时间
    if (this.lastShine && now - this.lastShine < this.shine) {
      return
    }
    const randomNum = Math.random()
    this.fillColor = randomNum < 0.6 ? '#888' : randomNum > 0.8 ? '#fff' : '#555'
    this.lastShine = now
  }

  draw() {
    const { ctx } = this
    ctx.save()
    this.calcFillColor()
    ctx.fillStyle = this.fillColor
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.restore()
  }
}

class StarLight extends Star {
  constructor(...params) {
    super(...params)
    this.loopCount = 1
    this.beforeAnimationTime = new Date()
    this.lastFramePos = null
    this.init()
  }

  init() {
    const [x, y, r = 1] = this.statusFn(this.loopCount, this.options)
    this.loopCount++
    this.x = x
    this.y = y
    this.r = r
    this.currentLoopTime = null
    this.setPhysicParameters()
  }

  setPhysicParameters() {
    this.physicParameters = {
      dx: Math.round(Math.random() * 3 + 1) / 2,
      dy: -Math.round(Math.random() * 3 + 1) / 2,
    }
  }

  calcShapeCoordinate() {
    const { dx, dy } = this.physicParameters
    const continuousTime = 1000
    const timeLine = new Date(this.beforeAnimationTime.getTime() + 10 * 1000)
    const now = new Date()
    if (now > timeLine) {
      const [x0, y0] = this.lastFramePos
      const { x: x1, y: y1 } = this.options
      const x = Curve.Linear(
        now - this.currentLoopTime,
        x0,
        (x1 - x0) / continuousTime,
        continuousTime
      )
      const y = Curve.Linear(
        now - this.currentLoopTime,
        y0,
        (y1 - y0) / continuousTime,
        continuousTime
      )
      return [x, y]
    }
    if (!this.currentLoopTime) {
      this.currentLoopTime = new Date()
      return [this.x, this.y]
    }
    return [
      Curve.Linear2(new Date() - this.currentLoopTime, this.x, dx),
      Curve.Linear2(new Date() - this.currentLoopTime, this.y, dy),
    ]
  }

  draw() {
    const { ctx } = this
    const { rgba } = this.options
    let [x, y] = this.calcShapeCoordinate()
    // if (x > w(200) || x < 0 || y > h(200) || y < 0) {
    //   this.init()
    //   x = this.x
    //   y = this.y
    // }
    this.lastFramePos = [x, y]
    ctx.save()
    ctx.fillStyle = rgba || 'rgba(0,0,0,1)'
    ctx.beginPath()
    ctx.arc(...this.lastFramePos, this.r, 0, Math.PI * 2, false)
    ctx.fill()
    ctx.restore()
  }
}

const paintBackground = ctx => {
  const linearGradient = ctx.createLinearGradient(0, 0, 0, h(150))
  linearGradient.addColorStop(0.6, '#1a1a2e')
  linearGradient.addColorStop(0.8, '#16213e')
  ctx.fillStyle = linearGradient
  ctx.fillRect(0, 0, w(200), h(200))
}

const getPixelPointsFrom = (str = '😃Li') => {
  const imgSize = [220, 100]
  const imgPos = [w(220) / 2, h(200) / 2]
  const canvasDOM = document.createElement('canvas')
  canvasDOM.setAttribute('width', w(200))
  canvasDOM.setAttribute('height', h(200))
  const ctx = canvasDOM.getContext('2d')
  ctx.strokeStyle = 'rgba(100,255,255,1)'
  ctx.fillStyle = 'rgba(100,255,255,1)'
  ctx.font = `800 ${imgSize[1]}px sans-serif`
  ctx.fillText(str, imgPos[0], imgPos[1] + imgSize[1])
  // ctx.fillRect(...imgPos, ...imgSize)
  // ctx.strokeRect(...imgPos, ...imgSize)
  const imgData = ctx.getImageData(...imgPos, ...imgSize)
  const { data, width, height } = imgData
  const pixels = []
  const columns = 50
  const rows = 50
  const unitW = width / columns
  const unitH = height / rows
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < columns; j++) {
      const pixelOrder = Math.round(i * unitW * unitH * columns + j * unitW)
      const redOrder = pixelOrder * 4
      const rgba = arrayToRGBA([
        data[redOrder],
        data[redOrder + 1],
        data[redOrder + 2],
        data[redOrder + 3],
      ])
      pixels.push({
        x: imgPos[0] + j * unitW,
        y: imgPos[1] + i * unitH,
        rgba,
      })
    }
  }
  return pixels
}

const paintStars = (ctx, img) => {
  const fn = () => [
    Math.round(Math.random() * w(200)),
    Math.round(Math.random() * 300),
    Math.round(Math.random() * 15) / 10 + 0.3,
  ]
  const fn2 = () => [
    Math.round(Math.random() * w(200) * 0.6),
    window.innerHeight * 0.4 + Math.round(Math.random() * window.innerHeight * 0.6),
    Math.round(Math.random() * 200 + 50) / 100,
  ]

  const stars = Array.apply(null, { length: 50 }).map(() => new Star(ctx, fn))
  const pixels = getPixelPointsFrom()
  const starLight = pixels.map(pixel => new StarLight(ctx, fn2, pixel))
  const loopDraw = () => {
    requestAnimationFrame(loopDraw)
    clear(ctx)
    paintBackground(ctx)
    stars.forEach(star => star.draw(ctx))
    starLight.forEach(light => light.draw(ctx))
  }
  loopDraw()
}

class MeteorShower {
  constructor(dom) {
    if (!(dom instanceof Node)) throw new TypeError('Expect DOM element but got: ' + dom)
    this.isActive = false

    const canvas = document.createElement('canvas')
    canvas.setAttribute('width', w(200))
    canvas.setAttribute('height', h(200))

    this.backgroudCanvas = canvas
    this.foregroundCanvas = canvas.cloneNode(true)

    dom.style = 'position: relative'
    this.backgroudCanvas.style = 'position: absolute; z-index: 0; width: 100%;'
    this.foregroundCanvas.style = 'position: absolute; z-index: 1; width: 100%'
    this.backgroudContext = this.backgroudCanvas.getContext('2d')
    this.foregroundContext = this.foregroundCanvas.getContext('2d')
    dom.appendChild(this.backgroudCanvas)
    dom.appendChild(this.foregroundCanvas)
  }

  paint() {
    if (this.isActive) return
    if (this.ctx === null) throw new Error('Cannot get paint context')
    this.isActive = true
    paintStars(this.backgroudContext)
    // paintMeteors(this.foregroundContext)
  }
}

const init = (function() {
  let instance = null
  return function(...params) {
    if (!instance) instance = new MeteorShower(...params)
    return instance
  }
})()

export default { init }

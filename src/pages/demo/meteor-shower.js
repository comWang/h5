const config = {
  width: 200,
  height: 200,
}

// 获取宽高。初始宽高都是200，使用函数方便后续以此为基数计算其他宽高
const w = num => window.innerWidth
const h = num => window.innerHeight
const setFillGradient = (ctx, ...colors) => {
  const linearGradient = ctx.createLinearGradient(0, 0, 0, h(150))
  colors.forEach(color => {
    linearGradient.addColorStop(color[0], color[1])
  })
  ctx.fillStyle = linearGradient
}

const clear = ctx => ctx.clearRect(0, 0, w(200), h(200))

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
  constructor(fn, options = {}) {
    if (fn instanceof Function) this.positionFn = fn
    // 周期运动的次数，传递给相关函数（从1开始）
    this.loopCount = 0
    const [offsetX, offsetY] = options.offset || [0, 0]
    const [x, y, r = 1] = this.positionFn(++this.loopCount)
    this.x = x
    this.y = y
    this.r = r
  }

  positionFn() {
    return [
      Math.round(Math.random() * w(200)),
      Math.round(Math.random() * h(200)),
      Math.round(Math.random() * 10 + 1) / 8,
    ]
  }

  draw(ctx) {
    const randomNum = Math.random()
    ctx.fillStyle = randomNum < 0.6 ? '#888' : randomNum > 0.8 ? '#fff' : '#555'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false)
    ctx.fill()
  }
}

class StarLight extends Star {
  constructor(...rest) {
    super(...rest)
    this.resetSpeed()
  }

  resetSpeed() {
    this.vx = Math.round(Math.random() * 500) / 2000
    this.vy = -Math.round(Math.random() * 500) / 2000
  }

  calcShapeCoordinate() {
    const x0 = this.x
    const y0 = this.y
    return [x0 + this.vx, y0 + this.vy]
  }

  draw(ctx) {
    const randomNum = Math.random()
    let [x, y] = this.calcShapeCoordinate()
    if ((x > w(200) || x < 0) && (y > h(200) || y < 0)) {
      this.resetSpeed()
      const [x1, y1] = this.positionFn(++this.loopCount)
      x = x1
      y = y1
    }
    this.x = x
    this.y = y
    ctx.fillStyle = '#16c79a'
    ctx.beginPath()
    ctx.arc(x, y, this.r, 0, Math.PI * 2, false)
    ctx.fill()
  }
}

const paintBackground = ctx => {
  const linearGradient = ctx.createLinearGradient(0, 0, 0, h(150))
  linearGradient.addColorStop(0.6, '#1a1a2e')
  linearGradient.addColorStop(0.8, '#16213e')
  ctx.fillStyle = linearGradient
  ctx.fillRect(0, 0, w(200), h(200))
}

const paintStars = ctx => {
  const fn = loopCount => [
    Math.round(Math.random() * w(200)),
    Math.round(Math.random() * 300),
    Math.round(Math.random() * 15) / 10 + 0.3,
  ]
  const stars = Array.apply(null, { length: 50 }).map(() => new Star(fn))
  const loopDraw = () => {
    clear(ctx)
    paintBackground(ctx)
    stars.forEach(star => star.draw(ctx))
    setTimeout(loopDraw, Math.round(Math.random() * 600 + 400))
  }
  loopDraw()
}

const paintMeteors = ctx => {
  const fn = loopCount => [
    Math.round(Math.random() * w(200)),
    Math.round(Math.random() * 300),
    Math.round(Math.random() * 10) + 1,
  ]
  const fn2 = loopCount => [
    Math.round(Math.random() * window.innerWidth * 0.8),
    window.innerHeight * 0.6 + Math.round(Math.random() * window.innerHeight * 0.4),
    Math.round(Math.random() * 200 + 30) / 50,
  ]
  const meteors = Array.apply(null, { length: 3 }).map(() => new Meteor(fn))
  // const starLight = Array.apply(null, { length: 200 }).map(() => new StarLight(fn2))
  const loopDraw = () =>
    requestAnimationFrame(() => {
      clear(ctx)
      meteors.forEach(meteor => meteor.draw(ctx))
      // starLight.forEach(light => light.draw(ctx))
      loopDraw()
    })
  loopDraw()
}

class MeteorShower {
  constructor(dom, userConfig) {
    if (!(dom instanceof Node)) throw new TypeError('Expect DOM element but got: ' + dom)
    this.config = Object.assign({}, config, userConfig)
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
    paintMeteors(this.foregroundContext)
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

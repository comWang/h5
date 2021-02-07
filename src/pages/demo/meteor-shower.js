import { Easing } from '@tweenjs/tween.js/dist/tween.esm'

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
    // 粒子会被复用。粒子消失在视野一定范围之后会重新出现，每一次出现loopCount加1，currentLoopTime刷新。
    // beforeAnimationTime初始值等于粒子首次创建时间，用于为back动画提供计时
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
    this.setAnimationParameters()
  }

  setAnimationParameters() {
    this.animationParameters = {
      dx: Math.round(Math.random() * 3 + 1) / 2,
      dy: -Math.round(Math.random() * 3 + 1) / 2,
      // back动画执行之前的等候时间，这个阶段可以进行其他动画
      waitingTime: Math.round(Math.random() * 1000 * 8 + 5 * 1000),
      // back动画时长
      duration: Math.round(Math.random() * 2000 + 1000 * 3),
    }
  }

  calcShapeCoordinate() {
    const { dx, dy, waitingTime, duration } = this.animationParameters
    const [x0, y0] = this.lastFramePos || [this.x, this.y]
    const { x: x1, y: y1 } = this.options
    const dt = new Date() - new Date(this.beforeAnimationTime.getTime() + waitingTime)

    if (dt <= 0) {
      // 第一阶段
      return [x0 + dx, y0 + dy]
    } else {
      // 第二阶段，back动画开始
      const t = Math.min(dt / duration, 1)
      return [x0 + (x1 - x0) * Easing.Cubic.InOut(t), y0 + (y1 - y0) * Easing.Cubic.In(t)]
    }
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


const getPixelPointsFrom = (str = '😃Li') => {
  const imgSize = [220, 100]
  const imgPos = [w(220) / 2, h(200) / 2]
  const canvasDOM = document.createElement('canvas')
  canvasDOM.setAttribute('width', w(200))
  canvasDOM.setAttribute('height', h(200))
  const ctx = canvasDOM.getContext('2d')
  ctx.fillStyle = 'rgba(100,255,255,1)'
  ctx.font = `200 ${imgSize[1]}px sans-serif`
  ctx.fillText(str, imgPos[0], imgPos[1] + imgSize[1])
  const { data, width, height } = ctx.getImageData(...imgPos, ...imgSize)
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
      if (Math.random() > 0.2) {
        //为营造随机效果舍弃部分粒子
        pixels.push({
          x: imgPos[0] + j * unitW,
          y: imgPos[1] + i * unitH,
          rgba,
        })
      }
    }
  }
  return pixels
}

const paintBackground = ctx => {
  const linearGradient = ctx.createLinearGradient(0, 0, 0, h(150))
  linearGradient.addColorStop(0.6, '#1a1a2e')
  linearGradient.addColorStop(0.8, '#16213e')
  ctx.fillStyle = linearGradient
  ctx.fillRect(0, 0, w(200), h(200))
}

const paintStars = ctx => {
  const fn = () => [
    Math.round(Math.random() * w(200)),
    Math.round(Math.random() * 300),
    Math.round(Math.random() * 15) / 10 + 0.3,
  ]

  const stars = Array.apply(null, { length: 50 }).map(() => new Star(ctx, fn))
  const loopDraw = () => {
    requestAnimationFrame(loopDraw)
    clear(ctx)
    paintBackground(ctx)
    stars.forEach(star => star.draw())
  }
  loopDraw()
}

const paintStarLight = ctx => {
  const fn = () => [
    Math.round(Math.random() * w(200) * 0.6),
    window.innerHeight * 0.4 + Math.round(Math.random() * window.innerHeight * 0.6),
    Math.round(Math.random() * 100 + 50) / 100,
  ]

  const pixels = getPixelPointsFrom('❤')
  const starLight = pixels.map(pixel => new StarLight(ctx, fn, pixel))
  const loopDraw = () => {
    requestAnimationFrame(loopDraw)
    clear(ctx)
    starLight.forEach(light => light.draw())
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
    this.foregroundCanvas = canvas.cloneNode()

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
    paintStarLight(this.foregroundContext)
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

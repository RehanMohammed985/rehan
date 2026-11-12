// A 2-16-16-1 network that learns to separate two spirals, trained live
// with Adam. Everything runs in the browser; nothing is precomputed.

export type Status = { step: number; loss: number }

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const H = 16
const N = 160

export function mountNet(canvas: HTMLCanvasElement, onStatus: (s: Status) => void, reduce: boolean) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const size = canvas.clientWidth
  canvas.width = size * dpr
  canvas.height = size * dpr
  ctx.scale(dpr, dpr)
  const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#111'

  // data: two interleaved spirals in [-1, 1]^2
  const rand = rng(7)
  const X: number[][] = []
  const Y: number[] = []
  for (let i = 0; i < N; i++) {
    const c = i % 2
    const r = 0.1 + 0.84 * (Math.floor(i / 2) / (N / 2))
    const a = r * 1.55 * 2 * Math.PI + c * Math.PI
    X.push([r * Math.sin(a) + (rand() - 0.5) * 0.08, r * Math.cos(a) + (rand() - 0.5) * 0.08])
    Y.push(c)
  }

  // parameters
  let W1: number[], b1: number[], W2: number[], b2: number[], W3: number[], b3: number
  let m: number[], v: number[], P: number[] // flat params and adam moments
  let step = 0
  const lr = 0.006
  const sizes = [2 * H, H, H * H, H, H, 1]
  const total = sizes.reduce((a, b) => a + b, 0)

  const init = () => {
    const r = rng(Math.floor(Math.random() * 1e9))
    P = new Array(total)
    let k = 0
    const fill = (n: number, scale: number) => {
      for (let i = 0; i < n; i++) P[k++] = (r() * 2 - 1) * scale
    }
    fill(2 * H, 1.2)
    fill(H, 0.1)
    fill(H * H, 0.6)
    fill(H, 0.1)
    fill(H, 0.6)
    fill(1, 0)
    m = new Array(total).fill(0)
    v = new Array(total).fill(0)
    step = 0
    view()
  }
  const view = () => {
    let k = 0
    W1 = P.slice(k, (k += 2 * H))
    b1 = P.slice(k, (k += H))
    W2 = P.slice(k, (k += H * H))
    b2 = P.slice(k, (k += H))
    W3 = P.slice(k, (k += H))
    b3 = P[k]
  }

  const h1 = new Array(H), h2 = new Array(H)
  const forward = (x: number, y: number) => {
    for (let i = 0; i < H; i++) h1[i] = Math.tanh(W1[i * 2] * x + W1[i * 2 + 1] * y + b1[i])
    for (let j = 0; j < H; j++) {
      let s = b2[j]
      for (let i = 0; i < H; i++) s += W2[j * H + i] * h1[i]
      h2[j] = Math.tanh(s)
    }
    let o = b3
    for (let j = 0; j < H; j++) o += W3[j] * h2[j]
    return 1 / (1 + Math.exp(-o))
  }

  const G = new Array(total)
  const d2 = new Array(H), d1 = new Array(H)
  const trainBatch = () => {
    G.fill(0)
    let loss = 0
    const B = 32
    for (let n = 0; n < B; n++) {
      const idx = Math.floor(Math.random() * N)
      const [x, y] = X[idx]
      const t = Y[idx]
      const p = forward(x, y)
      loss += -(t * Math.log(p + 1e-7) + (1 - t) * Math.log(1 - p + 1e-7))
      const dO = p - t
      let k = 2 * H + H + H * H + H
      for (let j = 0; j < H; j++) {
        G[k + j] += dO * h2[j]
        d2[j] = dO * W3[j] * (1 - h2[j] * h2[j])
      }
      G[k + H] += dO
      k = 2 * H + H
      for (let j = 0; j < H; j++) {
        for (let i = 0; i < H; i++) G[k + j * H + i] += d2[j] * h1[i]
        G[k + H * H + j] += d2[j]
      }
      for (let i = 0; i < H; i++) {
        let s = 0
        for (let j = 0; j < H; j++) s += d2[j] * W2[j * H + i]
        d1[i] = s * (1 - h1[i] * h1[i])
        G[i * 2] += d1[i] * x
        G[i * 2 + 1] += d1[i] * y
        G[2 * H + i] += d1[i]
      }
    }
    step++
    const b1c = 1 - Math.pow(0.9, step), b2c = 1 - Math.pow(0.999, step)
    for (let i = 0; i < total; i++) {
      const g = G[i] / B
      m[i] = 0.9 * m[i] + 0.1 * g
      v[i] = 0.999 * v[i] + 0.001 * g * g
      P[i] -= (lr * (m[i] / b1c)) / (Math.sqrt(v[i] / b2c) + 1e-8)
    }
    view()
    return loss / B
  }

  const cells = 48
  const field = document.createElement('canvas')
  field.width = cells
  field.height = cells
  const fctx = field.getContext('2d')!
  const img = fctx.createImageData(cells, cells)
  const draw = () => {
    ctx.clearRect(0, 0, size, size)
    // decision field: soft grey where the net predicts the filled class
    for (let gy = 0; gy < cells; gy++) {
      for (let gx = 0; gx < cells; gx++) {
        const x = ((gx + 0.5) / cells) * 2 - 1
        const y = ((gy + 0.5) / cells) * 2 - 1
        const p = forward(x, y)
        const k = (gy * cells + gx) * 4
        img.data[k] = 17
        img.data[k + 1] = 17
        img.data[k + 2] = 17
        img.data[k + 3] = Math.round(Math.max(0, p - 0.5) * 2 * 30)
      }
    }
    fctx.putImageData(img, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(field, 0, 0, size, size)
    // fade the field out towards the edges so it has no hard square border
    ctx.globalCompositeOperation = 'destination-in'
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.68)
    g.addColorStop(0, 'rgba(0,0,0,1)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    ctx.globalCompositeOperation = 'source-over'
    // points
    for (let i = 0; i < N; i++) {
      const [x, y] = X[i]
      const px = ((x + 1) / 2) * size
      const py = ((y + 1) / 2) * size
      ctx.beginPath()
      ctx.arc(px, py, 2.4, 0, Math.PI * 2)
      if (Y[i]) {
        ctx.fillStyle = fg
        ctx.fill()
      } else {
        ctx.fillStyle = '#fff'
        ctx.fill()
        ctx.lineWidth = 1
        ctx.strokeStyle = fg
        ctx.stroke()
      }
    }
  }

  init()
  if (reduce) {
    for (let i = 0; i < 1500; i++) trainBatch()
    draw()
    onStatus({ step, loss: trainBatch() })
    return () => {}
  }

  let raf = 0
  let ema = 0.7
  let settled = 0
  const tick = () => {
    let loss = 0
    for (let i = 0; i < 3; i++) loss = trainBatch()
    ema = ema * 0.9 + loss * 0.1
    if (ema < 0.05) settled++
    if (settled > 60 * 8) {
      init()
      ema = 0.7
      settled = 0
    }
    draw()
    if (step % 12 === 0) onStatus({ step, loss: ema })
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  return () => cancelAnimationFrame(raf)
}

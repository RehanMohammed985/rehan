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

  // contour lines of the prediction field (marching squares)
  const GR = 56
  const F = new Float32Array((GR + 1) * (GR + 1))
  const toPx = (v: number) => ((v + 1) / 2) * size
  const lerp = (a: number, b: number, L: number) => (L - a) / (b - a || 1e-9)
  const contour = (L: number) => {
    ctx.beginPath()
    for (let j = 0; j < GR; j++) {
      for (let i = 0; i < GR; i++) {
        const a = F[j * (GR + 1) + i], b = F[j * (GR + 1) + i + 1]
        const c = F[(j + 1) * (GR + 1) + i + 1], d = F[(j + 1) * (GR + 1) + i]
        const code = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0)
        if (code === 0 || code === 15) continue
        const x0 = (i / GR) * 2 - 1, x1 = ((i + 1) / GR) * 2 - 1
        const y0 = (j / GR) * 2 - 1, y1 = ((j + 1) / GR) * 2 - 1
        const top = [x0 + (x1 - x0) * lerp(a, b, L), y0]
        const right = [x1, y0 + (y1 - y0) * lerp(b, c, L)]
        const bottom = [x0 + (x1 - x0) * lerp(d, c, L), y1]
        const left = [x0, y0 + (y1 - y0) * lerp(a, d, L)]
        const segs: number[][][] = []
        switch (code) {
          case 1: case 14: segs.push([left, bottom]); break
          case 2: case 13: segs.push([bottom, right]); break
          case 3: case 12: segs.push([left, right]); break
          case 4: case 11: segs.push([top, right]); break
          case 5: segs.push([left, top], [bottom, right]); break
          case 6: case 9: segs.push([top, bottom]); break
          case 7: case 8: segs.push([left, top]); break
          case 10: segs.push([top, right], [left, bottom]); break
        }
        for (const [p, q] of segs) {
          ctx.moveTo(toPx(p[0]), toPx(p[1]))
          ctx.lineTo(toPx(q[0]), toPx(q[1]))
        }
      }
    }
    ctx.stroke()
  }

  const draw = () => {
    ctx.clearRect(0, 0, size, size)
    for (let j = 0; j <= GR; j++)
      for (let i = 0; i <= GR; i++) F[j * (GR + 1) + i] = forward((i / GR) * 2 - 1, (j / GR) * 2 - 1)
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = fg
    // faint bands either side of the boundary, then the boundary itself
    ctx.lineWidth = 1
    ctx.globalAlpha = 0.16
    for (const L of [0.1, 0.25, 0.75, 0.9]) contour(L)
    ctx.globalAlpha = 1
    ctx.lineWidth = 1.4
    contour(0.5)
    // points: filled for one class, hollow for the other; a ring marks a mistake
    for (let i = 0; i < N; i++) {
      const [x, y] = X[i]
      const px = toPx(x), py = toPx(y)
      const wrong = (forward(x, y) > 0.5 ? 1 : 0) !== Y[i]
      ctx.beginPath()
      ctx.arc(px, py, 2.4, 0, Math.PI * 2)
      ctx.fillStyle = Y[i] ? fg : '#fff'
      ctx.fill()
      ctx.lineWidth = 1
      ctx.stroke()
      if (wrong) {
        ctx.beginPath()
        ctx.arc(px, py, 5.5, 0, Math.PI * 2)
        ctx.globalAlpha = 0.5
        ctx.stroke()
        ctx.globalAlpha = 1
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

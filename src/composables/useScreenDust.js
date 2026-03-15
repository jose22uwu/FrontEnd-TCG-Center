/**
 * Screen dust background (CodePen devieffe/gbryYZg).
 * Generates a canvas texture with dots, streaks and thin hairs, applies it to the given element.
 */

function rand (min, max) {
  return Math.random() * (max - min) + min
}

function drawDust (ctx, w, h, intensity) {
  const count = Math.floor(w * h * 0.001 * Math.max(0.01, intensity))
  for (let i = 0; i < count; i++) {
    const x = rand(0, w)
    const y = rand(0, h)
    const isHighlight = Math.random() < 0.025
    let r, g, b, alpha
    if (isHighlight) {
      const bright = 200 + rand(0, 55)
      r = g = b = bright | 0
      alpha = rand(0.85, 1)
    } else {
      const gray = 120 + rand(-40, 40)
      const warm = 180 + rand(-30, 30)
      const cool = 180 + rand(-30, 30)
      const pick = Math.random()
      if (pick < 0.5) {
        r = g = b = gray
      } else if (pick < 0.75) {
        r = warm
        g = warm * 0.9
        b = warm * 0.8
      } else {
        r = cool * 0.8
        g = cool
        b = cool * 1.1
      }
      alpha = rand(0.05, 0.25)
    }
    ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${alpha})`
    const sharpChance = Math.random()
    if (sharpChance < 0.9) {
      if (Math.random() < 0.7) {
        ctx.beginPath()
        ctx.arc(x, y, rand(0.3, 1.2), 0, Math.PI * 2)
        ctx.fill()
      } else {
        const wS = rand(0.5, 2)
        const hS = rand(1, 4)
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rand(-0.6, 0.6))
        ctx.fillRect(-wS / 2, -hS / 2, wS, hS)
        ctx.restore()
      }
    } else {
      ctx.beginPath()
      ctx.ellipse(x, y, rand(0.5, 1.5), rand(1, 2.5), rand(0, Math.PI), 0, Math.PI * 2)
      ctx.fill()
    }
  }
  const hairCount = Math.floor(rand(1, 8))
  for (let i = 0; i < hairCount; i++) {
    const startX = rand(0, w)
    const startY = rand(0, h)
    const length = rand(5, 35)
    const width = rand(0.3, 1)
    const hairColorVal = 100 + rand(-50, 50)
    ctx.strokeStyle = `rgba(${hairColorVal | 0},${hairColorVal | 0},${hairColorVal | 0},${rand(0.2, 0.6)})`
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(startX, startY)
    const segments = Math.floor(rand(1, 3))
    let prevX = startX
    let prevY = startY
    for (let s = 0; s < segments; s++) {
      const nextX = prevX + rand(-length / 2, length / 2) * 0.6
      const nextY = prevY + length / segments + rand((-length / segments) * 0.5, (length / segments) * 0.5)
      const cpX = prevX + (nextX - prevX) / 2 + rand(-2, 2)
      const cpY = prevY + (nextY - prevY) / 2 + rand(-2, 2)
      ctx.quadraticCurveTo(cpX, cpY, nextX, nextY)
      prevX = nextX
      prevY = nextY
    }
    ctx.stroke()
  }
}

function generateDustTexture (w, h, intensity) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(w))
  canvas.height = Math.max(1, Math.round(h))
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawDust(ctx, canvas.width, canvas.height, intensity)
  return canvas.toDataURL('image/png')
}

function applyToElement (el, intensity = 1.5) {
  if (!el) return
  const rect = el.getBoundingClientRect()
  const w = Math.ceil(rect.width) || 300
  const h = Math.ceil(rect.height) || 200
  const dataUrl = generateDustTexture(w, h, intensity)
  el.style.backgroundImage = `url(${dataUrl})`
  el.style.backgroundRepeat = 'repeat'
  el.style.backgroundPosition = '0 0'
}

/**
 * @param {import('vue').Ref<HTMLElement | null>} elRef - Ref to the container element
 * @param {{ intensity?: number }} [options] - intensity for dust density (default 1.5)
 */
export function useScreenDust (elRef, options = {}) {
  const intensity = options.intensity ?? 1.5
  let resizeObserver = null

  function apply () {
    const el = elRef?.value ?? elRef
    if (el) applyToElement(el, intensity)
  }

  function start () {
    apply()
    const el = elRef?.value ?? elRef
    if (!el) return
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => applyToElement(el, intensity))
      resizeObserver.observe(el)
    } else {
      window.addEventListener('resize', apply)
    }
  }

  function stop () {
    if (resizeObserver && elRef?.value) {
      resizeObserver.unobserve(elRef.value)
      resizeObserver = null
    }
    window.removeEventListener('resize', apply)
  }

  return { apply, start, stop }
}

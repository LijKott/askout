// Draws the hug coupon as a standalone keepsake PNG and triggers a download.
// Rendered on canvas (not a DOM screenshot) so it looks good as a shared
// image on its own, independent of whatever device it was saved from.

const COCOA = '#2b160c'
const COCOA_MID = '#6b3a22'
const INK = '#3b1f0f'
const CARAMEL = '#d9a441'
const CREAM = '#fbeeda'
const CARD = '#fff9f0'

function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawCheckerStrip(ctx, x, y, w, h, tile) {
  let colToggle = 0
  for (let cx = x; cx < x + w; cx += tile) {
    ctx.fillStyle = colToggle % 2 === 0 ? COCOA_MID : CARAMEL
    ctx.fillRect(cx, y, Math.min(tile, x + w - cx), h)
    colToggle++
  }
}

async function ensureFontsLoaded() {
  if (!document.fonts) return
  await Promise.all([
    document.fonts.load('800 64px "Baloo 2"'),
    document.fonts.load('700 22px "Baloo 2"'),
    document.fonts.load('600 24px "Archivo"'),
  ]).catch(() => {})
}

export async function downloadHugCoupon() {
  await ensureFontsLoaded()

  const width = 1000
  const height = 600
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Outer chocolate frame.
  roundRectPath(ctx, 0, 0, width, height, 40)
  ctx.fillStyle = COCOA
  ctx.fill()

  const stripH = 16
  ctx.save()
  roundRectPath(ctx, 0, 0, width, height, 40)
  ctx.clip()
  drawCheckerStrip(ctx, 0, 0, width, stripH, 22)
  drawCheckerStrip(ctx, 0, height - stripH, width, stripH, 22)
  ctx.restore()

  // Inset cream card.
  const pad = 44
  const cardX = pad
  const cardY = pad
  const cardW = width - pad * 2
  const cardH = height - pad * 2
  roundRectPath(ctx, cardX, cardY, cardW, cardH, 24)
  ctx.fillStyle = CREAM
  ctx.fill()

  // Dashed coupon panel with cut-out notches, inset again.
  const cx = cardX + 60
  const cy = cardY + 40
  const cw = cardW - 120
  const ch = cardH - 80
  roundRectPath(ctx, cx, cy, cw, ch, 20)
  ctx.fillStyle = CARD
  ctx.fill()
  ctx.setLineDash([10, 8])
  ctx.lineWidth = 3
  ctx.strokeStyle = COCOA_MID
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = CREAM
  ctx.beginPath()
  ctx.arc(cx, cy + ch / 2, 16, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(cx + cw, cy + ch / 2, 16, 0, Math.PI * 2)
  ctx.fill()

  // Content.
  const midX = width / 2
  ctx.textAlign = 'center'

  ctx.font = '54px sans-serif'
  ctx.fillText('🤗', midX, cy + 78)

  ctx.fillStyle = INK
  ctx.font = '800 58px "Baloo 2", sans-serif'
  ctx.fillText('10 FREE HUGS', midX, cy + 150)

  ctx.fillStyle = COCOA_MID
  ctx.font = '600 21px "Archivo", sans-serif'
  ctx.fillText('never expires · redeemable any time', midX, cy + 195)
  ctx.fillText('chocolate sold separately (but coming anyway)', midX, cy + 222)

  ctx.strokeStyle = 'rgba(43, 22, 12, 0.25)'
  ctx.lineWidth = 2
  ctx.setLineDash([6, 6])
  ctx.beginPath()
  ctx.moveTo(cx + 40, cy + ch - 62)
  ctx.lineTo(cx + cw - 40, cy + ch - 62)
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = CARAMEL
  ctx.font = '700 15px "Baloo 2", sans-serif'
  ctx.fillText('HOCO · 2026', midX, cy + ch - 34)
  ctx.fillStyle = COCOA_MID
  ctx.font = '600 17px "Archivo", sans-serif'
  ctx.fillText('for tait-er tot 🍫', midX, cy + ch - 12)

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'tait-er-tot-hug-coupon.png'
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

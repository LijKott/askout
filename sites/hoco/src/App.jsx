import { useRef, useState } from 'react'
import './App.css'
import { downloadHugCoupon } from './couponImage.js'

const NO_LABELS = [
  'no',
  'no?',
  'wait—',
  'nice try',
  "you'll never",
  'still no',
  "can't catch me",
]

const MAX_DODGES = NO_LABELS.length - 1

const CONFETTI_COLORS = ['#6b3a22', '#d9a441', '#f4c464', '#fbeeda', '#8a4a2a']
const CONFETTI_EMOJI = ['🍫', '🤎']

function makeConfetti() {
  return Array.from({ length: 80 }, (_, i) => {
    const isEmoji = Math.random() < 0.18
    return {
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.7,
      duration: 2.6 + Math.random() * 2,
      rotate: Math.round(Math.random() * 720 - 360),
      drift: Math.round((Math.random() - 0.5) * 220),
      size: isEmoji ? 16 + Math.random() * 8 : 6 + Math.random() * 9,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      round: Math.random() > 0.5,
      emoji: isEmoji ? CONFETTI_EMOJI[i % CONFETTI_EMOJI.length] : null,
    }
  })
}

export default function App() {
  const [accepted, setAccepted] = useState(false)
  const [dodges, setDodges] = useState(0)
  const [noPos, setNoPos] = useState(null)
  const [confetti, setConfetti] = useState([])
  const [couponSaved, setCouponSaved] = useState(false)

  const stageRef = useRef(null)
  const noRef = useRef(null)

  function accept() {
    setConfetti(makeConfetti())
    setAccepted(true)
  }

  async function saveCoupon() {
    await downloadHugCoupon()
    setCouponSaved(true)
    setTimeout(() => setCouponSaved(false), 2500)
  }

  function dodge(e) {
    // Fires on tap-down (before the click "lands") so it reads as dodging
    // the touch itself, not just reacting after the fact.
    e.preventDefault()
    if (dodges >= MAX_DODGES) return
    const stage = stageRef.current
    const btn = noRef.current
    if (!stage || !btn) return

    const stageRect = stage.getBoundingClientRect()
    // offsetWidth/Height are the unscaled layout box — getBoundingClientRect
    // would report the shrunken post-`transform: scale()` size instead, which
    // under-bounds where the (unscaled) left/top we're about to set can land.
    const btnWidth = btn.offsetWidth
    const btnHeight = btn.offsetHeight
    // Bound by whatever's actually on screen right now, not the stage's full
    // box — on a short phone the stage can run past the fold, and a button
    // that "dodges" there reads as vanishing instead of dodging.
    const visibleWidth = Math.max(Math.min(stageRect.right, window.innerWidth) - stageRect.left, 0)
    const visibleHeight = Math.max(Math.min(stageRect.bottom, window.innerHeight) - stageRect.top, 0)
    const maxLeft = Math.max(visibleWidth - btnWidth, 0)
    const maxTop = Math.max(visibleHeight - btnHeight, 0)

    // A thumb covers far more area than a cursor, so a "random" spot often
    // lands right back under it. Force real distance from wherever it is now.
    const prev = noPos ?? { left: maxLeft / 2, top: maxTop / 2 }
    const minDistance = Math.min(stageRect.width, stageRect.height) * 0.4
    let next = prev
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = { left: Math.random() * maxLeft, top: Math.random() * maxTop }
      const dist = Math.hypot(candidate.left - prev.left, candidate.top - prev.top)
      if (dist >= minDistance) {
        next = candidate
        break
      }
      next = candidate
    }

    setNoPos(next)
    setDodges((d) => Math.min(d + 1, MAX_DODGES))
  }

  const noLabel = NO_LABELS[dodges]
  const noScale = Math.max(1 - dodges * 0.09, 0.45)
  const noRetired = dodges >= MAX_DODGES

  return (
    <div className="page">
      {accepted && (
        <div className="confetti-layer" aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={c.id}
              className={c.emoji ? 'confetti-piece is-emoji' : 'confetti-piece'}
              style={{
                left: `${c.left}%`,
                width: c.emoji ? 'auto' : c.size,
                height: c.emoji ? 'auto' : c.round ? c.size : c.size * 1.6,
                fontSize: c.emoji ? c.size : undefined,
                background: c.emoji ? 'none' : c.color,
                borderRadius: c.emoji ? 0 : c.round ? '50%' : '2px',
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                '--drift': `${c.drift}px`,
                '--rot': `${c.rotate}deg`,
              }}
            >
              {c.emoji}
            </span>
          ))}
        </div>
      )}

      <div className="lights" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="bulb" style={{ '--i': i }} />
        ))}
      </div>

      <main className="ticket">
        <div className="checker checker-top" aria-hidden="true" />

        {!accepted ? (
          <>
            <p className="eyebrow">HOMECOMING &middot; 2026</p>
            <p className="greeting">hey tait-er tot,</p>
            <h1 className="headline">
              WILL YOU
              <br />
              GO TO <span className="hilite">HOCO</span>
              <br />
              WITH ME?
            </h1>
            <p className="note">
              fair warning: the &ldquo;no&rdquo; button melts under pressure
            </p>

            <div className="stage" ref={stageRef}>
              <button className="btn btn-yes" onClick={accept}>
                YES!!
              </button>

              {!noRetired ? (
                <button
                  ref={noRef}
                  className="btn btn-no"
                  onMouseEnter={dodge}
                  onPointerDown={dodge}
                  style={
                    noPos
                      ? {
                          position: 'absolute',
                          left: noPos.left,
                          top: noPos.top,
                          transform: `scale(${noScale})`,
                        }
                      : { transform: `scale(${noScale})` }
                  }
                >
                  {noLabel}
                </button>
              ) : (
                <p className="no-retired">(the no button melted completely)</p>
              )}
            </div>

            <p className="stub">
              INGREDIENTS: CHOCOLATE + YOU &middot; NET WT: ALL MY HEART &middot; NO
              REFUNDS ON FEELINGS
            </p>
          </>
        ) : (
          <div className="celebrate">
            <p className="eyebrow">IT&rsquo;S OFFICIAL</p>
            <h1 className="headline">
              IT&rsquo;S A<br />
              <span className="hilite">DATE!</span> 🍫
            </h1>
            <p className="note">
              get ready for a serious chocolate delivery, tait-er tot
            </p>

            <button type="button" className="coupon" onClick={saveCoupon}>
              <span className="coupon-icon" aria-hidden="true">
                🤗
              </span>
              <p className="coupon-title">10 Free Hugs</p>
              <p className="coupon-fine">
                never expires &middot; redeemable any time &middot; chocolate sold
                separately (but coming anyway)
              </p>
              <p className="coupon-hint">
                {couponSaved ? 'saved! check your downloads 🎉' : '↓ tap to save this coupon'}
              </p>
            </button>

            <p className="stub">CONTAINS: CHOCOLATE &amp; HUGS</p>
          </div>
        )}

        <div className="checker checker-bottom" aria-hidden="true" />
      </main>
    </div>
  )
}

import { useRef, useState } from 'react'
import './App.css'

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

const CONFETTI_COLORS = ['#f2c14e', '#ffd873', '#f3e8ce', '#8a2332', '#fff6df']

function makeConfetti() {
  return Array.from({ length: 90 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.7,
    duration: 2.6 + Math.random() * 2,
    rotate: Math.round(Math.random() * 720 - 360),
    drift: Math.round((Math.random() - 0.5) * 220),
    size: 6 + Math.random() * 9,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    round: Math.random() > 0.5,
  }))
}

export default function App() {
  const [accepted, setAccepted] = useState(false)
  const [dodges, setDodges] = useState(0)
  const [noPos, setNoPos] = useState(null)
  const [confetti, setConfetti] = useState([])

  const stageRef = useRef(null)
  const noRef = useRef(null)

  function accept() {
    setConfetti(makeConfetti())
    setAccepted(true)
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
              className="confetti-piece"
              style={{
                left: `${c.left}%`,
                width: c.size,
                height: c.round ? c.size : c.size * 1.6,
                background: c.color,
                borderRadius: c.round ? '50%' : '2px',
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                '--drift': `${c.drift}px`,
                '--rot': `${c.rotate}deg`,
              }}
            />
          ))}
        </div>
      )}

      <div className="lights" aria-hidden="true">
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} className="bulb" style={{ '--i': i }} />
        ))}
      </div>

      <main className="ticket">
        <span className="stamp">SAVE&nbsp;THE&nbsp;DATE</span>

        <div className="checker checker-top" aria-hidden="true" />

        {!accepted ? (
          <>
            <p className="eyebrow">HOMECOMING &middot; 2026</p>
            <h1 className="headline">
              WILL YOU
              <br />
              GO TO <span className="hilite">HOCO</span>
              <br />
              WITH ME?
            </h1>
            <p className="note">
              fair warning: the &ldquo;no&rdquo; button doesn&rsquo;t really work
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
                <p className="no-retired">(the no button has left the venue)</p>
              )}
            </div>

            <p className="stub">
              ADMIT ONE &middot; GOOD FOR ONE (1) HOMECOMING &middot; NO REFUNDS ON
              FEELINGS
            </p>
          </>
        ) : (
          <div className="celebrate">
            <p className="eyebrow">IT&rsquo;S OFFICIAL</p>
            <h1 className="headline">
              IT&rsquo;S A<br />
              <span className="hilite">DATE!</span> 🎉
            </h1>
            <p className="note">can&rsquo;t wait to dance with you at hoco</p>
            <p className="stub">SEE YOU THERE &middot; DRESS SHARP &middot; BE PRESENT</p>
          </div>
        )}

        <div className="checker checker-bottom" aria-hidden="true" />
      </main>
    </div>
  )
}

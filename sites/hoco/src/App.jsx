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

  function dodge() {
    if (dodges >= MAX_DODGES) return
    const stage = stageRef.current
    const btn = noRef.current
    if (!stage || !btn) return

    const stageRect = stage.getBoundingClientRect()
    const btnRect = btn.getBoundingClientRect()
    const maxLeft = Math.max(stageRect.width - btnRect.width, 0)
    const maxTop = Math.max(stageRect.height - btnRect.height, 0)

    setNoPos({
      left: Math.random() * maxLeft,
      top: Math.random() * maxTop,
    })
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

      <main className="ticket" ref={stageRef}>
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

            <div className="stage">
              <button className="btn btn-yes" onClick={accept}>
                YES!!
              </button>

              {!noRetired ? (
                <button
                  ref={noRef}
                  className="btn btn-no"
                  onMouseEnter={dodge}
                  onClick={dodge}
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

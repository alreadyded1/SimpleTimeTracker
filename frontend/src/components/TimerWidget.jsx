import { useState, useEffect } from 'react'

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':')
}

export default function TimerWidget({ activeBlock, onStart, onStop }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!activeBlock) {
      setElapsed(0)
      return
    }
    const start = new Date(activeBlock.start_time + 'Z').getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [activeBlock])

  const isRunning = !!activeBlock

  return (
    <div style={{
      background: isRunning ? 'var(--green-dim)' : 'var(--surface)',
      border: `1px solid ${isRunning ? 'var(--green)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '20px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 20,
      flexWrap: 'wrap',
    }}>
      {isRunning ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'var(--green)',
              boxShadow: '0 0 0 3px var(--green-dim)',
              animation: 'pulse 1.5s infinite',
              display: 'inline-block',
            }} />
            <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Running
            </span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 700, letterSpacing: '0.04em', color: 'var(--text)' }}>
            {formatElapsed(elapsed)}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            Started {new Date(activeBlock.start_time + 'Z').toLocaleTimeString()}
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-stop" onClick={onStop} style={{ fontSize: 14, padding: '8px 20px' }}>
              Stop Timer
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            No active session
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-green" onClick={onStart} style={{ fontSize: 14, padding: '8px 20px' }}>
              Start Timer
            </button>
          </div>
        </>
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

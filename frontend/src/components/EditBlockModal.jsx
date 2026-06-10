import { useState } from 'react'

function toLocalDateTimeInput(isoString) {
  if (!isoString) return ''
  const d = new Date(isoString + (isoString.endsWith('Z') ? '' : 'Z'))
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditBlockModal({ block, onSave, onClose }) {
  const [startTime, setStartTime] = useState(toLocalDateTimeInput(block.start_time))
  const [endTime, setEndTime] = useState(toLocalDateTimeInput(block.end_time))
  const [workPerformed, setWorkPerformed] = useState(block.work_performed || '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!confirmed) {
      setConfirmed(true)
      return
    }

    const start = new Date(startTime)
    const end = endTime ? new Date(endTime) : null

    if (isNaN(start)) { setError('Invalid start time'); return }
    if (end && isNaN(end)) { setError('Invalid end time'); return }
    if (end && end <= start) { setError('End time must be after start time'); return }

    setSaving(true)
    try {
      await onSave(block.id, {
        start_time: start.toISOString(),
        end_time: end ? end.toISOString() : undefined,
        work_performed: workPerformed.trim() || null,
      })
    } catch (e) {
      setError(e.message)
      setConfirmed(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 16,
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 24,
        width: '100%', maxWidth: 480,
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Edit Block #{block.id}</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
          {block.end_time ? 'Completed block' : 'Active block — editing start time will not stop the timer'}
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Start Time</label>
            <input type="datetime-local" value={startTime} onChange={e => { setStartTime(e.target.value); setConfirmed(false) }} required style={{ width: '100%' }} />
          </div>
          {block.end_time && (
            <div>
              <label>End Time</label>
              <input type="datetime-local" value={endTime} onChange={e => { setEndTime(e.target.value); setConfirmed(false) }} style={{ width: '100%' }} />
            </div>
          )}
          <div>
            <label>Work Performed (optional)</label>
            <textarea
              value={workPerformed}
              onChange={e => { setWorkPerformed(e.target.value); setConfirmed(false) }}
              placeholder="Describe what you worked on..."
              style={{ width: '100%' }}
            />
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>}
          {confirmed && !error && (
            <div style={{
              background: 'var(--red-dim)',
              border: '1px solid var(--red)',
              borderRadius: 'var(--radius)',
              padding: '8px 12px',
              fontSize: 12,
              color: 'var(--red)',
            }}>
              Click Save again to confirm changes.
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : confirmed ? 'Confirm Save' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

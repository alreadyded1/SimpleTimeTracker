import { useState } from 'react'

function toLocalDateTimeInput(date) {
  const d = new Date(date)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ManualEntryForm({ onSubmit, onCancel }) {
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 3600000)

  const [startTime, setStartTime] = useState(toLocalDateTimeInput(oneHourAgo))
  const [endTime, setEndTime] = useState(toLocalDateTimeInput(now))
  const [workPerformed, setWorkPerformed] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const start = new Date(startTime)
    const end = new Date(endTime)
    if (isNaN(start) || isNaN(end)) { setError('Invalid date'); return }
    if (end <= start) { setError('End time must be after start time'); return }
    setSaving(true)
    try {
      await onSubmit({
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        work_performed: workPerformed.trim() || null,
      })
    } catch (e) {
      setError(e.message)
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
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 20 }}>Add Manual Entry</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label>Start Time</label>
            <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div>
            <label>End Time</label>
            <input type="datetime-local" value={endTime} onChange={e => setEndTime(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div>
            <label>Work Performed (optional)</label>
            <textarea
              value={workPerformed}
              onChange={e => setWorkPerformed(e.target.value)}
              placeholder="Describe what you worked on..."
              style={{ width: '100%' }}
            />
          </div>
          {error && <div style={{ color: 'var(--red)', fontSize: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Add Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useState } from 'react'

function formatDuration(minutes) {
  if (minutes == null) return '—'
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

function formatTime(isoString) {
  if (!isoString) return '—'
  return new Date(isoString + (isoString.endsWith('Z') ? '' : 'Z')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString + (isoString.endsWith('Z') ? '' : 'Z')).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function BlockRow({ block, isActive, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleDelete = () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    onDelete(block.id)
  }

  return (
    <div style={{
      background: isActive ? 'var(--green-dim)' : 'var(--surface)',
      border: `1px solid ${isActive ? 'var(--green)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '12px 16px',
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: '8px 16px',
      alignItems: 'start',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{formatDate(block.start_time)}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
            {formatTime(block.start_time)} – {formatTime(block.end_time)}
          </span>
          {isActive ? (
            <span style={{
              background: 'var(--green)', color: '#000',
              fontSize: 10, fontWeight: 700, padding: '1px 6px',
              borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>Active</span>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
              {formatDuration(block.duration)}
            </span>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>#{block.id}</span>
        </div>
        {block.work_performed && (
          <div style={{
            marginTop: 6, fontSize: 12, color: 'var(--text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {block.work_performed}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          className="btn-ghost"
          style={{ padding: '4px 10px', fontSize: 12 }}
          onClick={() => onEdit(block)}
        >
          Edit
        </button>
        <button
          className="btn-danger"
          style={{ padding: '4px 10px', fontSize: 12 }}
          onClick={handleDelete}
          onBlur={() => setTimeout(() => setConfirmDelete(false), 200)}
        >
          {confirmDelete ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  )
}

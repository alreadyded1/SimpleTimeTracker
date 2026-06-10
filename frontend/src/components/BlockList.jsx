import BlockRow from './BlockRow'

export default function BlockList({
  blocks, loading, activeBlock,
  filterStart, filterEnd, onFilterChange,
  onEdit, onDelete, onAddManual, exportUrl,
}) {
  return (
    <div>
      {/* Toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        flexWrap: 'wrap', marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ margin: 0, textTransform: 'none', letterSpacing: 'normal', fontSize: 12, color: 'var(--text-muted)' }}>From</label>
          <input
            type="date"
            value={filterStart}
            onChange={e => onFilterChange(e.target.value, filterEnd)}
            style={{ padding: '5px 8px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label style={{ margin: 0, textTransform: 'none', letterSpacing: 'normal', fontSize: 12, color: 'var(--text-muted)' }}>To</label>
          <input
            type="date"
            value={filterEnd}
            onChange={e => onFilterChange(filterStart, e.target.value)}
            style={{ padding: '5px 8px' }}
          />
        </div>
        {(filterStart || filterEnd) && (
          <button className="btn-ghost" style={{ padding: '5px 10px', fontSize: 12 }}
            onClick={() => onFilterChange('', '')}>
            Clear
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <a
            href={exportUrl()}
            download
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '5px 12px', fontSize: 12, fontWeight: 500,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', color: 'var(--text-muted)',
              textDecoration: 'none', cursor: 'pointer',
            }}
          >
            Export CSV
          </a>
          <button className="btn-primary" style={{ padding: '5px 12px', fontSize: 12 }} onClick={onAddManual}>
            + Add Entry
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading…</div>
      ) : blocks.length === 0 ? (
        <div style={{
          color: 'var(--text-muted)', textAlign: 'center', padding: 48,
          background: 'var(--surface)', borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          No blocks yet. Start the timer or add a manual entry.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {blocks.map(block => (
            <BlockRow
              key={block.id}
              block={block}
              isActive={activeBlock?.id === block.id}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {blocks.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          {blocks.length} block{blocks.length !== 1 ? 's' : ''}
          {' · '}
          {formatTotalHours(blocks)} total
        </div>
      )}
    </div>
  )
}

function formatTotalHours(blocks) {
  const total = blocks.reduce((sum, b) => sum + (b.duration || 0), 0)
  const h = Math.floor(total / 60)
  const m = Math.round(total % 60)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

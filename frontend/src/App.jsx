import { useState, useEffect, useCallback } from 'react'
import { api } from './api'
import TimerWidget from './components/TimerWidget'
import BlockList from './components/BlockList'
import ManualEntryForm from './components/ManualEntryForm'
import EditBlockModal from './components/EditBlockModal'

const POLL_INTERVAL = 5000

export default function App() {
  const [blocks, setBlocks] = useState([])
  const [activeBlock, setActiveBlock] = useState(null)
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  const [showManualForm, setShowManualForm] = useState(false)
  const [editingBlock, setEditingBlock] = useState(null)
  const [toast, setToast] = useState(null)
  const [loadingBlocks, setLoadingBlocks] = useState(true)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const loadBlocks = useCallback(async () => {
    try {
      const data = await api.listBlocks({ start: filterStart || undefined, end: filterEnd || undefined })
      setBlocks(data)
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setLoadingBlocks(false)
    }
  }, [filterStart, filterEnd, showToast])

  const loadActive = useCallback(async () => {
    try {
      const data = await api.getActive()
      setActiveBlock(data)
    } catch {
      // silently ignore polling errors
    }
  }, [])

  // Initial load
  useEffect(() => {
    loadBlocks()
    loadActive()
  }, [loadBlocks, loadActive])

  // Poll for active block
  useEffect(() => {
    const id = setInterval(loadActive, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [loadActive])

  const handleStart = async () => {
    try {
      const block = await api.startTimer()
      setActiveBlock(block)
      showToast('Timer started')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleStop = async () => {
    if (!activeBlock) return
    try {
      const stopped = await api.stopTimer(activeBlock.id)
      setActiveBlock(null)
      setBlocks(prev => {
        const idx = prev.findIndex(b => b.id === stopped.id)
        return idx >= 0
          ? [stopped, ...prev.filter(b => b.id !== stopped.id)]
          : [stopped, ...prev]
      })
      showToast('Timer stopped')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleManualSubmit = async (data) => {
    try {
      await api.createBlock(data)
      setShowManualForm(false)
      showToast('Block added')
      loadBlocks()
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleEditSave = async (id, data) => {
    try {
      const updated = await api.updateBlock(id, data)
      setBlocks(prev => prev.map(b => (b.id === id ? updated : b)))
      if (activeBlock?.id === id) setActiveBlock(updated)
      setEditingBlock(null)
      showToast('Block updated')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteBlock(id)
      setBlocks(prev => prev.filter(b => b.id !== id))
      if (activeBlock?.id === id) setActiveBlock(null)
      showToast('Block deleted')
    } catch (e) {
      showToast(e.message, 'error')
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
          CabbyTime
        </h1>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          Time Tracker
        </span>
      </header>

      <TimerWidget activeBlock={activeBlock} onStart={handleStart} onStop={handleStop} />

      <div style={{ marginTop: 24 }}>
        <BlockList
          blocks={blocks}
          loading={loadingBlocks}
          activeBlock={activeBlock}
          filterStart={filterStart}
          filterEnd={filterEnd}
          onFilterChange={(s, e) => { setFilterStart(s); setFilterEnd(e) }}
          onEdit={setEditingBlock}
          onDelete={handleDelete}
          onAddManual={() => setShowManualForm(true)}
          exportUrl={() => api.exportUrl({ start: filterStart || undefined, end: filterEnd || undefined })}
        />
      </div>

      {showManualForm && (
        <ManualEntryForm
          onSubmit={handleManualSubmit}
          onCancel={() => setShowManualForm(false)}
        />
      )}

      {editingBlock && (
        <EditBlockModal
          block={editingBlock}
          onSave={handleEditSave}
          onClose={() => setEditingBlock(null)}
        />
      )}

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: toast.type === 'error' ? 'var(--red)' : '#166534',
          color: '#fff',
          padding: '10px 18px',
          borderRadius: 'var(--radius)',
          fontSize: 13,
          fontWeight: 500,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          zIndex: 9999,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

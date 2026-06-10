const BASE = '/api/blocks'

async function req(method, path, body) {
  const opts = { method, headers: {} }
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  }
  const res = await fetch(`${BASE}${path}`, opts)
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({ detail: res.statusText }))
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const api = {
  listBlocks: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.start) qs.set('start', params.start)
    if (params.end) qs.set('end', params.end)
    const q = qs.toString()
    return req('GET', q ? `?${q}` : '')
  },
  getActive: () => req('GET', '/active'),
  startTimer: () => req('POST', '/start'),
  stopTimer: (id) => req('POST', `/${id}/stop`),
  createBlock: (data) => req('POST', '', data),
  updateBlock: (id, data) => req('PUT', `/${id}`, data),
  deleteBlock: (id) => req('DELETE', `/${id}`),
  exportUrl: (params = {}) => {
    const qs = new URLSearchParams()
    if (params.start) qs.set('start', params.start)
    if (params.end) qs.set('end', params.end)
    const q = qs.toString()
    return `${BASE}/export${q ? '?' + q : ''}`
  },
}

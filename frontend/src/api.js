const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, { method = 'GET', token, body, form } = {}) {
  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`
  let payload
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded'
    payload = new URLSearchParams(body).toString()
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload })

  if (res.status === 204) return null

  let data = null
  try { data = await res.json() } catch { /* no body */ }

  if (!res.ok) {
    const message = data?.error?.message || data?.detail || `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.fields = data?.error?.fields
    throw error
  }
  return data
}

export const api = {
  signup: (name, email, password) =>
    request('/auth/signup', { method: 'POST', body: { name, email, password } }),

  login: (email, password) =>
    request('/auth/login', { method: 'POST', form: true, body: { username: email, password } }),

  me: (token) => request('/auth/me', { token }),

  listContacts: (token, { search = '', stage = '' } = {}) => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (stage) params.set('stage', stage)
    const qs = params.toString()
    return request(`/contacts${qs ? `?${qs}` : ''}`, { token })
  },

  createContact: (token, data) => request('/contacts', { method: 'POST', token, body: data }),

  updateContact: (token, id, data) => request(`/contacts/${id}`, { method: 'PUT', token, body: data }),

  updateStage: (token, id, stage) =>
    request(`/contacts/${id}/stage`, { method: 'PATCH', token, body: { stage } }),

  deleteContact: (token, id) => request(`/contacts/${id}`, { method: 'DELETE', token }),

  draftEmail: (token, id) => request(`/contacts/${id}/draft-email`, { method: 'POST', token }),
}

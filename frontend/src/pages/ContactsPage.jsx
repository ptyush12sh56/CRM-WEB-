import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { stageMap } from '../stages'
import ContactModal from '../components/ContactModal'
import AIDraftModal from '../components/AIDraftModal'

export default function ContactsPage() {
  const { token } = useAuth()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')

  const [editing, setEditing] = useState(null)     // contact object, or {} for new
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [draftFor, setDraftFor] = useState(null)   // contact being drafted for
  const [draft, setDraft] = useState(null)
  const [draftLoading, setDraftLoading] = useState(false)
  const [draftError, setDraftError] = useState('')

  const load = useCallback(async (searchTerm = '') => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await api.listContacts(token, { search: searchTerm })
      setContacts(data)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(search), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleSave = async (form) => {
    setSaving(true)
    setFormError('')
    try {
      if (editing?.id) {
        await api.updateContact(token, editing.id, form)
      } else {
        await api.createContact(token, form)
      }
      setEditing(null)
      await load(search)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this contact?')) return
    await api.deleteContact(token, id)
    load(search)
  }

  const handleDraft = async (contact) => {
    setDraftFor(contact)
    setDraft(null)
    setDraftError('')
    setDraftLoading(true)
    try {
      const result = await api.draftEmail(token, contact.id)
      setDraft(result)
    } catch (err) {
      setDraftError(err.message)
    } finally {
      setDraftLoading(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <h2>Contacts</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="search"
            placeholder="Search contacts…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-sm btn-accent" onClick={() => setEditing({})}>+ Add contact</button>
        </div>
      </div>

      {loading && <div className="loading">Loading contacts…</div>}
      {loadError && <div className="form-error">{loadError}</div>}

      {!loading && !loadError && contacts.length === 0 && (
        <div className="empty">
          {search ? `No contacts match "${search}".` : 'No contacts yet — add your first one.'}
        </div>
      )}

      {!loading && !loadError && contacts.length > 0 && (
        <table>
          <thead>
            <tr><th>Name</th><th>Company</th><th>Email</th><th>Stage</th><th>Deal value</th><th></th></tr>
          </thead>
          <tbody>
            {contacts.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.company}</td>
                <td>{c.email}</td>
                <td><span className="tag" style={{ background: stageMap[c.stage].color }}>{stageMap[c.stage].label}</span></td>
                <td>${c.deal_value.toLocaleString()}</td>
                <td className="row-actions">
                  <button onClick={() => setEditing(c)}>Edit</button>
                  <button onClick={() => handleDraft(c)}>AI draft</button>
                  <button onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <ContactModal
          contact={editing.id ? editing : null}
          saving={saving}
          error={formError}
          onSave={handleSave}
          onClose={() => { setEditing(null); setFormError('') }}
        />
      )}

      {draftFor && (
        <AIDraftModal
          contact={draftFor}
          draft={draft}
          loading={draftLoading}
          error={draftError}
          onClose={() => setDraftFor(null)}
        />
      )}
    </>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api'
import { STAGES } from '../stages'
import ContactModal from '../components/ContactModal'
import AIDraftModal from '../components/AIDraftModal'

export default function PipelinePage() {
  const { token } = useAuth()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [dragOverStage, setDragOverStage] = useState(null)

  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [draftFor, setDraftFor] = useState(null)
  const [draft, setDraft] = useState(null)
  const [draftLoading, setDraftLoading] = useState(false)
  const [draftError, setDraftError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      setContacts(await api.listContacts(token))
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { load() }, [load])

  const handleDrop = async (stageId, e) => {
    e.preventDefault()
    setDragOverStage(null)
    const id = Number(e.dataTransfer.getData('text/contact-id'))
    const contact = contacts.find((c) => c.id === id)
    if (!contact || contact.stage === stageId) return

    // optimistic update
    setContacts((cs) => cs.map((c) => (c.id === id ? { ...c, stage: stageId } : c)))
    try {
      await api.updateStage(token, id, stageId)
    } catch (err) {
      setLoadError(err.message)
      load() // revert to server state on failure
    }
  }

  const handleAdd = async (form) => {
    setSaving(true)
    setFormError('')
    try {
      await api.createContact(token, form)
      setAdding(false)
      await load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDraft = async (contact) => {
    setDraftFor(contact)
    setDraft(null)
    setDraftError('')
    setDraftLoading(true)
    try {
      setDraft(await api.draftEmail(token, contact.id))
    } catch (err) {
      setDraftError(err.message)
    } finally {
      setDraftLoading(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <h2>Pipeline</h2>
        <button className="btn-sm btn-accent" onClick={() => setAdding(true)}>+ Add contact</button>
      </div>

      {loading && <div className="loading">Loading pipeline…</div>}
      {loadError && <div className="form-error">{loadError}</div>}

      {!loading && (
        <div className="board">
          {STAGES.map((s) => {
            const stageContacts = contacts.filter((c) => c.stage === s.id)
            return (
              <div
                key={s.id}
                className={`col${dragOverStage === s.id ? ' dragover' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOverStage(s.id) }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDrop(s.id, e)}
              >
                <h3><span className="dot" style={{ background: s.color }} />{s.label} · {stageContacts.length}</h3>
                {stageContacts.map((c) => (
                  <div
                    key={c.id}
                    className="card"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/contact-id', String(c.id))}
                    onClick={() => handleDraft(c)}
                  >
                    <b>{c.name}</b>
                    <span className="val">{c.company} · ${c.deal_value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {adding && (
        <ContactModal
          contact={null}
          saving={saving}
          error={formError}
          onSave={handleAdd}
          onClose={() => { setAdding(false); setFormError('') }}
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

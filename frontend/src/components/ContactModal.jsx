import { useState } from 'react'
import { STAGES } from '../stages'

const empty = { name: '', company: '', email: '', phone: '', notes: '', stage: 'new', deal_value: 0 }

export default function ContactModal({ contact, onSave, onClose, saving, error }) {
  const [form, setForm] = useState(contact ? { ...empty, ...contact } : empty)

  const set = (field) => (e) => {
    const value = field === 'deal_value' ? Number(e.target.value) : e.target.value
    setForm((f) => ({ ...f, [field]: value }))
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3>{contact ? 'Edit contact' : 'Add contact'}</h3>
        {error && <div className="form-error">{error}</div>}

        <div className="field"><label>Name</label>
          <input value={form.name} onChange={set('name')} />
        </div>
        <div className="field"><label>Company</label>
          <input value={form.company} onChange={set('company')} />
        </div>
        <div className="field"><label>Email</label>
          <input type="email" value={form.email} onChange={set('email')} />
        </div>
        <div className="field"><label>Phone</label>
          <input value={form.phone} onChange={set('phone')} />
        </div>
        <div className="field"><label>Deal value ($)</label>
          <input type="number" min="0" value={form.deal_value} onChange={set('deal_value')} />
        </div>
        <div className="field"><label>Stage</label>
          <select value={form.stage} onChange={set('stage')}>
            {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        <div className="field"><label>Notes</label>
          <textarea rows={3} value={form.notes} onChange={set('notes')} />
        </div>

        <div className="modal-actions">
          <button className="btn-sm" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-sm btn-accent" onClick={() => onSave(form)} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

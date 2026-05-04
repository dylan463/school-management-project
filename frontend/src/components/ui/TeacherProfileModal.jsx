import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function TeacherProfileModal({ user, open, onClose, onSave, saving = false }) {
  const [form, setForm] = useState({
    prenom: user?.prenom || user?.first_name || '',
    nom: user?.nom || user?.last_name || '',
    grade: user?.grade || '',
    telephone: user?.telephone || user?.phone || '',
    email: user?.email || '',
    cin: user?.cin || '',
    subjects: user?.subjects || '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        prenom: user?.prenom || user?.first_name || '',
        nom: user?.nom || user?.last_name || '',
        grade: user?.grade || '',
        telephone: user?.telephone || user?.phone || '',
        email: user?.email || '',
        cin: user?.cin || '',
        subjects: user?.subjects || '',
      })
    }
  }, [open, user])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      first_name: form.prenom,
      last_name: form.nom,
      grade: form.grade,
      phone: form.telephone,
      email: form.email,
      cin: form.cin,
      subjects: form.subjects,
    })
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!open) return null

  return createPortal(
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '520px',
          margin: '0 16px',
          padding: '24px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Modifier mon profil</h2>
            <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#94a3b8' }}>Les informations seront enregistrées côté backend.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              fontSize: '20px',
              color: '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}>Prénom</label>
              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Prénom"
              />
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={labelStyle}>Nom</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Grade</label>
            <input
              name="grade"
              value={form.grade}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Ex: Maître de conférence"
            />
          </div>

          <div>
            <label style={labelStyle}>Numéro de téléphone</label>
            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              style={inputStyle}
              placeholder="+261 XX XX XXX XX"
            />
          </div>

          <div>
            <label style={labelStyle}>Numéro CIN</label>
            <input
              name="cin"
              value={form.cin}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Numéro CIN"
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="exemple@mail.com"
            />
          </div>

          <div>
            <label style={labelStyle}>Matière(s) enseignée(s)</label>
            <input
              name="subjects"
              value={form.subjects}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Mathématiques, Physique, Réseaux"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              style={cancelButtonStyle}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={saveButtonStyle}
              disabled={saving}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748b',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  fontSize: '13px',
  color: '#0f172a',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
}

const cancelButtonStyle = {
  padding: '10px 18px',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  background: 'white',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
}

const saveButtonStyle = {
  padding: '10px 18px',
  borderRadius: '10px',
  border: 'none',
  background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
  color: 'white',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
}

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function EditProfileModal({ user, open, onClose, onSave, semestreOptions = [] }) {

  const [form, setForm] = useState({
    prenom: user?.prenom || '',
    nom: user?.nom || '',
    date_naissance: user?.date_naissance || '',
    lieu_naissance: user?.lieu_naissance || '',
    telephone: user?.telephone || '',
    email: user?.email || '',
    cin: user?.cin || '',
    semestre: user?.semestre || '',
    statut: user?.statut || 'passant',
    parcours: user?.parcours || '',
  })

  useEffect(() => {
    if (open) {
      setForm({
        prenom: user?.prenom || '',
        nom: user?.nom || '',
        date_naissance: user?.date_naissance || '',
        lieu_naissance: user?.lieu_naissance || '',
        telephone: user?.telephone || '',
        email: user?.email || '',
        cin: user?.cin || '',
        semestre: user?.semestre || '',
        statut: user?.statut || 'passant',
        parcours: user?.parcours || '',
      })
    }
  }, [user, open])

  // Bloquer le scroll du body quand le modal est ouvert
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    onSave(form)
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!open) return null

  // createPortal monte le modal directement sur <body>,
  // ce qui le sort de tout contexte de stacking (overflow:hidden, z-index, etc.)
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
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '480px',
          margin: '0 16px',
          padding: '24px',
          position: 'relative',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
              Modifier mes informations
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
              Mettez à jour vos informations personnelles
            </p>
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

          {/* Prénom + Nom */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Prénom</label>
              <input
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Votre prénom"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Nom</label>
              <input
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Votre nom"
              />
            </div>
          </div>

          {/* Date + Lieu naissance */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Date de naissance</label>
              <input
                name="date_naissance"
                type="date"
                value={form.date_naissance}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Lieu de naissance</label>
              <input
                name="lieu_naissance"
                value={form.lieu_naissance}
                onChange={handleChange}
                required
                style={inputStyle}
                placeholder="Ville"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <label style={labelStyle}>Numéro de téléphone</label>
            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="+261 XX XX XXX XX"
            />
          </div>

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="exemple@email.com"
            />
          </div>

          {/* CIN */}
          <div>
            <label style={labelStyle}>Numéro d'identité (CIN)</label>
            <input
              name="cin"
              value={form.cin}
              onChange={handleChange}
              required
              style={inputStyle}
              placeholder="Numéro CIN"
            />
          </div>

          {/* Semestre + Statut */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Semestre actuel</label>
              <select
                name="semestre"
                value={form.semestre}
                onChange={handleChange}
                style={inputStyle}
              >
                {semestreOptions.map(opt => (
                  <option key={opt} value={opt}>S{opt}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Statut</label>
              <select
                name="statut"
                value={form.statut}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="passant">Passant</option>
                <option value="redoublant">Redoublant</option>
              </select>
            </div>
          </div>

          {/* Parcours */}
          <div>
            <label style={labelStyle}>Parcours</label>
            <select
              name="parcours"
              value={form.parcours}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">-- Sélectionner un parcours --</option>
              <option value="RS">Réseaux et Systèmes</option>
              <option value="RC">Radiocommunication</option>
              <option value="STI">Systèmes et Traitement de l'Information</option>
              <option value="TRI">Technologies des Réseaux Informatiques</option>
            </select>
          </div>

          {/* Boutons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
              }}
            >
              Enregistrer
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
  marginBottom: '5px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const inputStyle = {
  width: '100%',
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
  fontSize: '13px',
  color: '#1e293b',
  background: '#f8fafc',
  outline: 'none',
  boxSizing: 'border-box',
}
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import StatCard from '../../components/ui/StatCard'
import EditProfileModal from '../../components/ui/EditProfileModal'
import etudiantService from '../../services/etudiantService'

// --- Helpers

function normalizeTimetableData(data) {
  if (!data) return []
  return Array.isArray(data) ? data : []
}

function normalizeResources(data) {
  if (!data) return []
  if (!Array.isArray(data)) return []
  return data.map(r => ({
    title: r.name || 'Resource',
    meta: `${r.teaching_unit_name || 'UE'} • ${r.teacher_name || 'Professeur'}`,
    type: (r.file_type || r.type || 'document').toLowerCase(),
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('fr-FR') : '',
    description: r.description || '',
    url: r.url || r.file_url || null,
  }))
}

function buildStats(notesData, pointagesData) {
  const notes = Array.isArray(notesData) ? notesData : []
  const pointages = Array.isArray(pointagesData) ? pointagesData : []

  const moyenne =
    notes.length > 0
      ? (notes.reduce((sum, n) => sum + (n.valeur ?? n.note ?? 0), 0) / notes.length).toFixed(2)
      : '-'

  const absences = pointages.filter(p => p.statut === 'absent' || p.absent).length

  return [
    { label: 'Moyenne generale', value: moyenne, unit: '/20', color: 'blue' },
    { label: 'Absences', value: absences, unit: 'seance(s)', color: 'amber' },
    { label: 'UEs validees', value: notes.filter(n => (n.valeur ?? n.note ?? 0) >= 10).length, unit: `/ ${notes.length}`, color: 'green' },
  ]
}

// Catégoriser les ressources par type
function categorizeResources(resources) {
  const categories = {
    document: { label: 'Documents', icon: '📄', color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', items: [] },
    video:    { label: 'Vidéos',    icon: '🎬', color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', items: [] },
    image:    { label: 'Images',    icon: '🖼️', color: '#ec4899', bg: '#fdf2f8', border: '#fbcfe8', items: [] },
    lien:     { label: 'Liens',     icon: '🔗', color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', items: [] },
    autre:    { label: 'Autres',    icon: '📎', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', items: [] },
  }

  resources.forEach(r => {
    const t = r.type || ''
    if (['mp4', 'avi', 'mov', 'mkv', 'video', 'webm'].includes(t)) {
      categories.video.items.push(r)
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'image'].includes(t)) {
      categories.image.items.push(r)
    } else if (['http', 'https', 'lien', 'link', 'url'].includes(t) || (r.url && !r.title?.match(/\.(pdf|doc|docx|ppt|pptx|xls|xlsx)$/i))) {
      categories.lien.items.push(r)
    } else if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'document'].includes(t)) {
      categories.document.items.push(r)
    } else {
      categories.autre.items.push(r)
    }
  })

  return categories
}

// --- InfoRow
function InfoRow({ label, value, mono = false, icon, last = false }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
      padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid #f1f5f9',
    }}>
      <span style={{
        fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#94a3b8',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        {icon && <span style={{ fontSize: '11px' }}>{icon}</span>}
        {label}
      </span>
      <span style={{
        fontSize: '13px', fontWeight: 500, color: '#1e293b',
        fontFamily: mono ? 'monospace' : 'inherit',
        letterSpacing: mono ? '0.04em' : 'normal',
      }}>
        {value}
      </span>
    </div>
  )
}

// --- Informations Personnelles Card
function PersonalInfoCard({ user, onEdit }) {
  const initials = [user?.prenom?.[0], user?.nom?.[0]]
    .filter(Boolean).join('').toUpperCase() || 'E'

  const PARCOURS_LABELS = {
    RS:  'Réseaux et Systèmes',
    RC:  'Radiocommunication',
    STI: 'Systèmes et Traitement de l\'Information',
    TRI: 'Technologies des Réseaux Informatiques',
  }

  const fields = [
    { label: 'Nom et prenoms', value: `${user?.prenom || ''} ${user?.nom || ''}`.trim() || 'Non renseigne' },
    { label: 'Date de naissance', value: user?.date_naissance || user?.dateNaissance || 'Non renseignee' },
    { label: 'Numero de telephone', value: user?.telephone || user?.phone || 'Non renseigne', mono: true },
    { label: "Numero de carte d'identite", value: user?.cin || user?.numero_cin || 'Non renseigne', mono: true },
    { label: 'Parcours', value: PARCOURS_LABELS[user?.parcours] || user?.parcours || 'Non renseigne' },
    { label: 'Adresse', value: user?.adresse || user?.address || 'Non renseignee', last: true },
  ]

  return (
    <div style={{
      background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)',
      cursor: 'pointer', position: 'relative',
    }} onClick={onEdit} title="Modifier mes informations">
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        padding: '16px 20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-24px', top: '-24px', width: '110px', height: '110px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
        <div style={{ position: 'absolute', right: '36px', bottom: '-36px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: 700, color: 'white', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(255,255,255,0.2)', letterSpacing: '0.02em',
          }}>
            {initials}
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', margin: 0, lineHeight: 1.3 }}>
              {user?.prenom} {user?.nom}
            </p>
            <p style={{ color: '#93c5fd', fontSize: '11px', margin: '3px 0 0', letterSpacing: '0.05em' }}>
              INFORMATIONS PERSONNELLES
            </p>
          </div>
        </div>
        <span style={{ position: 'absolute', top: 10, right: 18, color: '#fff', fontSize: 18, opacity: 0.7 }}>✎</span>
      </div>

      <div style={{ padding: '12px 20px 16px' }}>
        <div style={{
          marginBottom: '6px', display: 'inline-flex', alignItems: 'center', gap: '5px',
          background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px',
          padding: '4px 12px', fontSize: '12px', fontWeight: 600, color: '#475569',
          fontFamily: 'monospace', boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
        }}>
          <span style={{ color: '#94a3b8' }}>#</span>
          {user?.matricule || 'ETU-2024-001'}
        </div>
        {fields.map((f) => (
          <InfoRow key={f.label} label={f.label} value={f.value} mono={f.mono || false} last={f.last || false} />
        ))}
      </div>
      <span style={{ position: 'absolute', bottom: 10, right: 18, color: '#64748b', fontSize: 12, opacity: 0.7 }}>
        Cliquez pour modifier
      </span>
    </div>
  )
}

// --- Semestre Card
function SemestreCard({ user }) {
  const semestre = user?.semestre || 1
  const progress = Math.min(100, Math.round((semestre / 10) * 100))

  return (
    <div style={{
      background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 60%, #8b5cf6 100%)' }} />
      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
              Semestre actuel
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
              <span style={{ fontSize: '52px', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>S{semestre}</span>
              <span style={{ fontSize: '15px', color: '#cbd5e1', fontWeight: 600 }}>/10</span>
            </div>
          </div>
          <span style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '20px',
            padding: '4px 12px', fontSize: '12px', fontWeight: 600, color: '#16a34a',
            display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Actif
          </span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Progression du cursus</span>
            <span style={{ fontSize: '11px', color: '#3b82f6', fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '99px' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(s => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: s < semestre ? '#3b82f6' : s === semestre ? '#6366f1' : '#e2e8f0',
                  boxShadow: s === semestre ? '0 0 0 3px #e0e7ff' : 'none',
                }} />
                <span style={{ fontSize: '10px', fontWeight: s === semestre ? 700 : 400, color: s <= semestre ? '#3b82f6' : '#cbd5e1' }}>
                  S{s}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div style={{
          background: '#f8fafc', borderRadius: '10px', padding: '10px 14px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto',
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Annee academique</span>
          <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 700 }}>2025 - 2026</span>
        </div>
      </div>
    </div>
  )
}

// --- UE Card
function UnitiesCard() {
  const [openId, setOpenId] = useState(null)
  const [ues, setUes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchUes = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await etudiantService.getUniteEnseignement()
        const transformed = Array.isArray(data) ? data.map(u => ({
          id: u.id,
          nom: u.name,
          code: u.code,
          credits: u.courses ? u.courses.reduce((sum, c) => sum + (c.course_credits || 0), 0) : 0,
          statut: 'Valide',
          ecs: (u.courses || []).map(c => ({ nom: c.name, credits: c.course_credits || 0 }))
        })) : []
        setUes(transformed)
      } catch (err) {
        setError(err.message || "Impossible de charger les unités d'enseignement")
      } finally {
        setLoading(false)
      }
    }
    fetchUes()
  }, [])

  const totalCredits = ues.reduce((s, u) => s + u.credits, 0)
  const validated = ues.filter(u => u.statut === 'Valide').length

  return (
    <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Unites d'Enseignement Inscrites</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Semestre en cours</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{totalCredits}</p>
            <p style={{ margin: '2px 0 0', fontSize: '9px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Credits</p>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '6px 12px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>{validated}/{ues.length}</p>
            <p style={{ margin: '2px 0 0', fontSize: '9px', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Validees</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Chargement...</div>
      ) : error ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444', fontSize: '14px' }}>{error}</div>
      ) : ues.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>Aucune unité disponible</div>
      ) : (
        <div>
          {ues.map((ue, idx) => {
            const isValide = ue.statut === 'Valide'
            const isOpen = openId === ue.id
            const totalEC = ue.ecs.reduce((s, e) => s + e.credits, 0)
            const isLast = idx === ues.length - 1
            return (
              <div key={ue.id} style={{ borderBottom: isLast && !isOpen ? 'none' : '1px solid #f1f5f9' }}>
                <div
                  onClick={() => setOpenId(isOpen ? null : ue.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '13px 20px', cursor: 'pointer', userSelect: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0, background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: '#7c3aed' }}>
                    {ue.credits}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ue.nom}</p>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '6px', padding: '1px 6px', whiteSpace: 'nowrap', flexShrink: 0 }}>{totalEC} cr. EC</span>
                    </div>
                    <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#475569', background: '#f1f5f9', padding: '1px 7px', borderRadius: '4px', fontWeight: 600 }}>{ue.code}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '4px 10px', borderRadius: '20px', background: isValide ? '#f0fdf4' : '#fffbeb', color: isValide ? '#16a34a' : '#d97706', border: `1px solid ${isValide ? '#bbf7d0' : '#fde68a'}` }}>
                      {ue.statut}
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#94a3b8', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}>
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '12px 20px 14px 72px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Elements Constitutifs</span>
                      <div style={{ height: '1px', flex: 1, background: '#e2e8f0' }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: '6px', padding: '1px 7px' }}>Total : {totalEC} cr.</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {ue.ecs.map((ec, ecIdx) => (
                        <div key={ecIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'white', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '9px 14px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0, background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#4338ca' }}>{ec.credits}</div>
                          <p style={{ margin: 0, fontSize: '12.5px', fontWeight: 600, color: '#1e293b', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ec.nom}</p>
                          <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 600, color: '#6366f1', background: '#eef2ff', borderRadius: '6px', padding: '2px 8px' }}>{ec.credits} cr.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// --- Mes Cours Card (comptage par type de ressource)
function MesCoursCard({ resources, loading, error }) {
  const categories = categorizeResources(resources)

  const counts = [
    { key: 'document', ...categories.document },
    { key: 'video',    ...categories.video },
    { key: 'image',    ...categories.image },
    { key: 'lien',     ...categories.lien },
    { key: 'autre',    ...categories.autre },
  ].filter(c => c.items.length > 0) // n'afficher que les types qui ont des ressources

  const total = resources.length

  return (
    <div style={{
      background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
      overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.05)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Mes Cours</h3>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>Ressources disponibles ce semestre</p>
        </div>
        {/* Badge total */}
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: '10px', padding: '6px 14px', textAlign: 'center',
        }}>
          <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>
            {loading ? '…' : total}
          </p>
          <p style={{ margin: '2px 0 0', fontSize: '9px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Total
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Chargement des ressources...
        </div>
      ) : error ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#ef4444', fontSize: '14px' }}>{error}</div>
      ) : total === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
          Aucune ressource disponible pour ce semestre.
        </div>
      ) : (
        <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {counts.map(cat => (
            <div key={cat.key} style={{
              flex: '1 1 120px',
              background: cat.bg,
              border: `1px solid ${cat.border}`,
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              {/* Icône */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', flexShrink: 0,
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                {cat.icon}
              </div>
              {/* Texte */}
              <div>
                <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: cat.color, lineHeight: 1 }}>
                  {cat.items.length}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', fontWeight: 600, color: cat.color, opacity: 0.8 }}>
                  {cat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// --- Page principale
export default function DashboardEtudiant() {
  const { user, setUser } = useAuth()

  const [editOpen, setEditOpen] = useState(false)

  const [timetable, setTimetable] = useState([])
  const [loadingEmploi, setLoadingEmploi] = useState(false)
  const [emploiError, setEmploiError] = useState(null)

  const [stats, setStats] = useState([])
  const [loadingStats, setLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState(null)

  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)
  const [resourcesError, setResourcesError] = useState(null)

  useEffect(() => {
    if (!user) return

    const studentId = user.id || user.matricule
    const semestre = user.semestre || user.niveau || undefined

    const fetchEmploiDuTemps = async () => {
      setLoadingEmploi(true)
      setEmploiError(null)
      try {
        const data = await etudiantService.getEmploiDuTemps(studentId, semestre)
        setTimetable(normalizeTimetableData(data))
      } catch (err) {
        setEmploiError(err.message || "Impossible de charger l'emploi du temps")
      } finally {
        setLoadingEmploi(false)
      }
    }

    const fetchStats = async () => {
      setLoadingStats(true)
      setStatsError(null)
      try {
        const [notes, pointages] = await Promise.all([
          etudiantService.getNotes(studentId, semestre),
          etudiantService.getPointages(studentId, semestre),
        ])
        setStats(buildStats(notes, pointages))
      } catch (err) {
        setStatsError(err.message || 'Impossible de charger les statistiques')
      } finally {
        setLoadingStats(false)
      }
    }

    const fetchResources = async () => {
      setLoadingResources(true)
      setResourcesError(null)
      try {
        const data = await etudiantService.getResources(studentId, semestre)
        setResources(normalizeResources(data))
      } catch (err) {
        setResourcesError(err.message || 'Impossible de charger les ressources')
      } finally {
        setLoadingResources(false)
      }
    }

    fetchEmploiDuTemps()
    fetchStats()
    fetchResources()
  }, [user])

  const semestreOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  const handleSaveProfile = async (form) => {
    try {
      const updated = await etudiantService.updateProfile(form)
      setUser(updated)
      setEditOpen(false)
    } catch (e) {
      alert('Erreur lors de la sauvegarde')
    }
  }

  return (
    <div className="fade-in space-y-6">

      {/* Bienvenue */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          Bonjour, {user?.prenom || 'etudiant'}
        </h2>
        <p className="text-sm text-slate-500">Resume de votre parcours ce semestre</p>
      </div>

      {/* Cartes du haut */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PersonalInfoCard user={user} onEdit={() => setEditOpen(true)} />
        <SemestreCard user={user} />
      </div>

      <EditProfileModal
        user={user}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
        semestreOptions={semestreOptions}
      />

      {/* UEs */}
      <UnitiesCard />

      {/* Statistiques */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {loadingStats ? (
          <div className="col-span-full p-4 text-sm text-slate-500">Chargement des statistiques...</div>
        ) : statsError ? (
          <div className="col-span-full p-4 text-sm text-red-500">Impossible de charger les statistiques.</div>
        ) : (
          stats.map(s => <StatCard key={s.label} {...s} />)
        )}
      </div>

      {/* Mes Cours — comptage par type */}
      <MesCoursCard
        resources={resources}
        loading={loadingResources}
        error={resourcesError}
      />

    </div>
  )
}
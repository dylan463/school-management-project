<<<<<<< HEAD
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import ResourceItem from '../../components/ui/ResourceItem'
import etudiantService from '../../services/etudiantService'

/* ── Stats ── */
const DEFAULT_STATS = [
  { label: 'Moyenne générale', value: '13.4', sub: 'Semestre 6' },
  { label: 'Crédits validés',  value: '24',   sub: 'sur 30' },
  { label: 'Absences',         value: '2',    sub: 'ce semestre', valueColor: 'text-red-600' },
]

const normalizeNotes = (notes) => {
  if (!notes) return []
  if (Array.isArray(notes)) return notes
  return notes.data || notes.items || []
}

const getAverage = (notes) => {
  const normalized = normalizeNotes(notes)
  if (Array.isArray(normalized) && normalized.length > 0) {
    const values = normalized
      .map(n => n.note ?? n.value ?? n.moyenne ?? 0)
      .filter(v => typeof v === 'number')
    if (values.length > 0) {
      return (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1)
    }
  }
  if (typeof notes?.average === 'number') return notes.average.toFixed(1)
  if (typeof notes?.moyenne === 'number') return notes.moyenne.toFixed(1)
  return 'N/A'
}

const getCreditsValides = (notes) => {
  const normalized = normalizeNotes(notes)
  if (Array.isArray(normalized) && normalized.length > 0) {
    const credits = normalized
      .map(n => n.credit ?? n.credits ?? 0)
      .filter(v => typeof v === 'number')
    if (credits.length > 0) {
      return credits.reduce((sum, v) => sum + v, 0)
    }
  }
  if (typeof notes?.creditsValides === 'number') return notes.creditsValides
  if (typeof notes?.credits === 'number') return notes.credits
  return '0'
}

const getAbsences = (pointages) => {
  if (!pointages) return '0'
  if (Array.isArray(pointages)) {
    return pointages.filter(p => p.status === 'absent' || p.statut === 'absent' || p.absent).length
  }
  if (typeof pointages?.absences === 'number') return pointages.absences
  if (typeof pointages?.count === 'number') return pointages.count
  return '0'
}

const buildStats = (notes, pointages, semestre) => {
  const moyenne = getAverage(notes)
  const credits = getCreditsValides(notes)
  const absences = getAbsences(pointages)

  return [
    { label: 'Moyenne générale', value: moyenne, sub: semestre ? `Semestre ${semestre}` : 'Semestre actuel' },
    { label: 'Crédits validés', value: credits, sub: 'sur 30' },
    { label: 'Absences', value: absences, sub: 'ce semestre', valueColor: Number(absences) > 0 ? 'text-red-600' : 'text-emerald-600' },
  ]
}

/* ── Ressources ── */
const DEFAULT_RESOURCES = [
  { title: 'Cours — Communication optique', meta: 'Télécom · Prof. Randriana Erica · PDF · 3.2 Mo', type: 'PDF' },
  { title: 'TP — Routage réseaux', meta: 'Informatique · Prof. Rasolomanana Jean · ZIP · 4.5 Mo', type: 'ZIP' },
  { title: 'Exercices — Traitement d’images', meta: 'Télécom · Mme Ramafiarisona Malalatiana · PDF · 2.1 Mo', type: 'PDF' },
]

const normalizeResources = (data) => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return data.items || data.data || []
}

const DEFAULT_TIMETABLE = {
  Lundi: [
    { time: '07h30 - 09h30', subject: 'Énergie et sécurité des sites', teacher: 'ET & ED : M. Rabearivelo Gericha', room: 'Salle A101', credits: 1 },
    { time: '09h30 - 11h30', subject: 'Énergie et sécurité des sites', teacher: 'ET & ED : M. Rabearivelo Gericha', room: 'Salle A101', credits: 1 },
    { time: '12h30 - 14h30', subject: 'Anglais dans le domaine de la Télécommunication', teacher: 'ET & ED : Mme Raharimbola Lucienne', room: 'Salle B202', credits: 1 },
    { time: '14h30 - 16h30', subject: 'Technique de rédaction française', teacher: 'ET & ED :', room: 'Salle C303', credits: 1 },
  ],
  Mardi: [
    { time: '07h30 - 09h30', subject: 'Évolution de la Radiocommunication mobile', teacher: 'ET & ED : M. Randriana Erica', room: 'Amphi A', credits: 1 },
    { time: '09h30 - 11h30', subject: 'Évolution de la Radiocommunication mobile', teacher: 'ET & ED : M. Randriana Erica', room: 'Amphi A', credits: 1 },
    { time: '12h30 - 14h30', subject: 'Web avancé', teacher: 'ET & ED : M. Andrianarison Mirado', room: 'Salle D404', credits: 1 },
    { time: '14h30 - 16h30', subject: 'Web avancé', teacher: 'ET & ED : M. Andrianarison Mirado', room: 'Salle D404', credits: 1 },
  ],
  Mercredi: [
    { time: '07h30 - 09h30', subject: 'Routage dans les réseaux informatiques', teacher: 'ET & ED : M. Rasolomanana Jean', room: 'Salle E505', credits: 1 },
    { time: '09h30 - 11h30', subject: 'Routage dans les réseaux informatiques', teacher: 'ET & ED : M. Rasolomanana Jean', room: 'Salle E505', credits: 1 },
    { time: '12h30 - 14h30', subject: 'Commutation Electronique', teacher: 'ET & ED : M. Randriamanampy Samuel', room: 'Lab F606', credits: 1 },
    { time: '14h30 - 16h30', subject: 'Processus aléatoire', teacher: 'ET & ED : M. Ratsimbazafy Bakoly', room: 'Salle G707', credits: 1 },
  ],
  Jeudi: [
    { time: '07h30 - 09h30', subject: 'Traitement d’images', teacher: 'ET & ED : Mme Ramafiarisona Malalatiana', room: 'Lab H808', credits: 1 },
    { time: '09h30 - 11h30', subject: 'Traitement d’images', teacher: 'ET & ED : Mme Ramafiarisona Malalatiana', room: 'Lab H808', credits: 1 },
    { time: '12h30 - 14h30', subject: 'Développement d’application d’entreprise', teacher: 'ET & ED : M. Randriariaona Elino', room: 'Salle I909', credits: 1 },
    { time: '14h30 - 16h30', subject: 'Développement d’application d’entreprise', teacher: 'ET & ED : M. Randriariaona Elino', room: 'Salle I909', credits: 1 },
  ],
  Vendredi: [
    { time: '07h30 - 09h30', subject: 'Communication optique', teacher: 'ET & ED : M. Randriana Erica', room: 'Amphi B', credits: 1 },
    { time: '09h30 - 11h30', subject: 'Communication optique', teacher: 'ET & ED : M. Randriana Erica', room: 'Amphi B', credits: 1 },
    { time: '12h30 - 14h30', subject: 'Réseaux sans fil', teacher: 'ET & ED : M. Ratsimbazafy Andriamanga', room: 'Salle J1010', credits: 1 },
    { time: '14h30 - 16h30', subject: 'Réseaux sans fil', teacher: 'ET & ED : M. Ratsimbazafy Andriamanga', room: 'Salle J1010', credits: 1 },
  ],
  Samedi: [
    { time: '07h30 - 09h30', subject: 'Angular', teacher: 'ET & ED : M. Rabearimanana Noël', room: 'Salle K1111', credits: 1 },
    { time: '09h30 - 11h30', subject: 'Angular', teacher: 'ET & ED : M. Rabearimanana Noël', room: 'Salle K1111', credits: 1 },
  ],
}

const normalizeTimetableData = (data) => {
  if (!data) return {}
  if (Array.isArray(data)) {
    return data.reduce((acc, session) => {
      const day = session.day || session.jour || session.dayName || 'Autre'
      if (!acc[day]) acc[day] = []
      acc[day].push(session)
      return acc
    }, {})
  }
  return data
}

function Timetable({ timetable, loading, error }) {
  const [selectedSession, setSelectedSession] = useState(null)

  const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
  const slots = ['07h30 - 09h30', '09h30 - 11h30', '12h30 - 14h30', '14h30 - 16h30']

  const getSession = (day, time) => {
    const sessions = timetable?.[day] || []
    return sessions.find(s => s.time === time)
  }

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Chargement de l'emploi du temps...</div>
  }

  if (error) {
    return <div className="p-6 text-sm text-red-500">Impossible de charger l'emploi du temps.</div>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-full bg-white rounded-lg border border-slate-200 shadow-sm">
          <div className="grid grid-cols-7 gap-0">
            {/* Header */}
            <div className="bg-slate-100 border-b border-r border-slate-200 p-3 font-semibold text-slate-700 text-center">
              Horaire
            </div>
            {days.map(day => (
              <div key={day} className="bg-slate-100 border-b border-r border-slate-200 p-3 font-semibold text-slate-700 text-center">
                {day}
              </div>
            ))}

            {/* Rows */}
            {slots.map(slot => (
              <>
                <div className="border-b border-r border-slate-200 p-3 text-sm text-slate-600 bg-slate-50 text-center font-medium">
                  {slot}
                </div>
                {days.map(day => {
                  const session = getSession(day, slot)
                  return (
                    <div
                      key={`${day}-${slot}`}
                      className={`border-b border-r border-slate-200 p-3 min-h-[80px] bg-white hover:bg-slate-50 transition-colors ${
                        session ? 'cursor-pointer' : ''
                      }`}
                      onClick={() => session && setSelectedSession(session)}
                    >
                      {session ? (
                        <div className="h-full flex flex-col justify-center">
                          <div className="text-sm font-medium text-slate-800 mb-1">{session.subject}</div>
                          <div className="text-xs text-slate-500">{session.teacher || '-'}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic">Libre</div>
                      )}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedSession(null)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Détails du cours</h3>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-slate-700">Matière:</span>
                <p className="text-slate-600">{selectedSession.subject}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Enseignant:</span>
                <p className="text-slate-600">{selectedSession.teacher || 'Non spécifié'}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Salle:</span>
                <p className="text-slate-600">{selectedSession.room}</p>
              </div>
              <div>
                <span className="font-medium text-slate-700">Crédits:</span>
                <p className="text-slate-600">{selectedSession.credits}</p>
              </div>
            </div>
            <button
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              onClick={() => setSelectedSession(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
=======
import { useAuth }      from '../../context/AuthContext'
import StatCard         from '../../components/ui/StatCard'
import Card             from '../../components/ui/Card'
import GradeBar         from '../../components/ui/GradeBar'
import NotifItem        from '../../components/ui/NotifItem'
import ResourceItem     from '../../components/ui/ResourceItem'

/* ── Mock data (remplace par appels API) ── */
const STATS = [
  { label: 'Moyenne générale', value: '13.4', sub: 'Semestre 3' },
  { label: 'Crédits validés',  value: '24',   sub: 'sur 30 ce sem.' },
  { label: 'Cours consultés',  value: '18',   sub: 'cette semaine' },
  { label: 'Absences',         value: '2',    sub: 'ce semestre', valueColor: 'text-red-600' },
]

const NOTES = [
  { label: 'Électronique analogique', value: 14.5 },
  { label: 'Réseaux informatiques',   value: 12.0 },
  { label: 'Traitement du signal',    value: 15.5 },
  { label: 'Mathématiques appliquées',value: 11.0 },
]

const NOTIFS = [
  { message: 'Note de TP Réseaux disponible',    time: 'Il y a 2h',  color: 'blue'  },
  { message: 'Examen Signal reporté au 15/04',   time: 'Hier',       color: 'amber' },
  { message: 'Nouveau cours déposé : Antennes',  time: 'Il y a 2j',  color: 'green' },
]

const RESOURCES = [
  { title: 'Cours 4 — Modulation AM/FM',         meta: 'Électronique · Prof. Razafindrakoto · PDF · 2.3 Mo', type: 'PDF' },
  { title: 'TP 2 — Configuration routeur Cisco', meta: 'Réseaux · Prof. Andriamanjato · ZIP · 5.1 Mo',        type: 'ZIP' },
  { title: 'Exercices — Transformée de Fourier', meta: 'Signal · Prof. Randriamanantena · PDF · 1.1 Mo',       type: 'PDF' },
]

/* ── Timetable ── */
const DAYS  = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
const SLOTS = ['07h30', '10h00', '13h30']
const COLORS = {
  blue:   'bg-blue-50 text-blue-800',
  green:  'bg-green-50 text-green-800',
  amber:  'bg-amber-50 text-amber-800',
  purple: 'bg-purple-50 text-purple-800',
}
const EDT = {
  '07h30-Lun': { label: 'Électronique', room: 'Salle B12', color: 'blue'   },
  '07h30-Mer': { label: 'Réseaux',      room: 'Labo 2',    color: 'green'  },
  '07h30-Ven': { label: 'Signal',       room: 'Salle A4',  color: 'purple' },
  '10h00-Mar': { label: 'Maths App.',   room: 'Amphi C',   color: 'amber'  },
  '10h00-Jeu': { label: 'Électronique', room: 'Labo 1',    color: 'blue'   },
  '13h30-Lun': { label: 'Réseaux',      room: 'Salle B12', color: 'green'  },
  '13h30-Jeu': { label: 'Signal',       room: 'Amphi A',   color: 'purple' },
  '13h30-Ven': { label: 'Maths App.',   room: 'Salle A4',  color: 'amber'  },
}

function Timetable() {
  return (
    <div className="overflow-x-auto">
      <div className="grid gap-1" style={{ gridTemplateColumns: '52px repeat(5, 1fr)', minWidth: 340 }}>
        {/* Header row */}
        <div />
        {DAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-slate-500 py-1">{d}</div>
        ))}

        {/* Slot rows */}
        {SLOTS.map(slot => (
          <>
            <div key={`time-${slot}`} className="text-[10px] text-slate-400 pt-1.5">{slot}</div>
            {DAYS.map(day => {
              const key    = `${slot}-${day}`
              const cell   = EDT[key]
              return cell ? (
                <div key={key} className={`rounded-md p-1.5 text-[10px] leading-tight min-h-[40px] ${COLORS[cell.color]}`}>
                  <p className="font-semibold">{cell.label}</p>
                  <p className="opacity-70">{cell.room}</p>
                </div>
              ) : (
                <div key={key} className="rounded-md bg-slate-50 min-h-[40px]" />
              )
            })}
          </>
        ))}
      </div>
    </div>
>>>>>>> 48f443108b5c8fe935880c201f85ac819895b3a2
  )
}

export default function DashboardEtudiant() {
  const { user } = useAuth()
<<<<<<< HEAD
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [timetable, setTimetable] = useState(DEFAULT_TIMETABLE)
  const [resources, setResources] = useState(DEFAULT_RESOURCES)
  const [loadingEmploi, setLoadingEmploi] = useState(false)
  const [emploiError, setEmploiError] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [statsError, setStatsError] = useState(null)
  const [loadingResources, setLoadingResources] = useState(false)
  const [resourcesError, setResourcesError] = useState(null)

  useEffect(() => {
    if (!user) return

    const fetchEmploiDuTemps = async () => {
      setLoadingEmploi(true)
      setEmploiError(null)
      try {
        const studentId = user.id || user.matricule
        const semestre = user.semestre || user.niveau || undefined
        const data = await etudiantService.getEmploiDuTemps(studentId, semestre)
        setTimetable(normalizeTimetableData(data))
      } catch (err) {
        setEmploiError(err.message || 'Impossible de charger l’emploi du temps')
      } finally {
        setLoadingEmploi(false)
      }
    }

    const fetchStats = async () => {
      setLoadingStats(true)
      setStatsError(null)
      try {
        const studentId = user.id || user.matricule
        const semestre = user.semestre || user.niveau || undefined
        const [notesData, pointagesData] = await Promise.all([
          etudiantService.getNotes(studentId),
          etudiantService.getPointages(studentId),
        ])
        setStats(buildStats(notesData, pointagesData, semestre))
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
        const studentId = user.id || user.matricule
        const data = await etudiantService.getRessources(studentId)
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

  return (
    <div className="fade-in space-y-6">
      {/* Bienvenue */}
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          Bonjour, {user?.prenom || 'étudiant'}
        </h2>
        <p className="text-sm text-slate-500">Résumé de votre parcours ce semestre</p>
      </div>

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

      {/* Emploi du temps en tableau */}
      <Card title={`Emploi du temps${user?.semestre || user?.niveau ? ` — ${user?.semestre || user?.niveau}` : ''}`}>
        <Timetable timetable={timetable} loading={loadingEmploi} error={emploiError} />
      </Card>

      {/* Ressources */}
      <Card title="Ressources récentes">
        {loadingResources ? (
          <div className="p-4 text-sm text-slate-500">Chargement des ressources...</div>
        ) : resourcesError ? (
          <div className="p-4 text-sm text-red-500">Impossible de charger les ressources.</div>
        ) : (
          resources.map((r, i) => <ResourceItem key={i} {...r} />)
        )}
      </Card>
    </div>
  )
}
=======

  return (
    <div className="fade-in space-y-5">
      {/* Welcome */}
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">
          Bonjour, {user?.prenom || 'étudiant'} 👋
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Voici un résumé de votre parcours ce semestre.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Timetable + right column */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Timetable — 3 cols */}
        <div className="xl:col-span-3">
          <Card title="Emploi du temps — semaine en cours">
            <Timetable />
          </Card>
        </div>

        {/* Right column — 2 cols */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <Card title="Notes par UE">
            {NOTES.map((n, i) => (
              <GradeBar key={n.label} label={n.label} value={n.value} colorIndex={i} />
            ))}
          </Card>

          <Card title="Notifications récentes">
            {NOTIFS.map((n, i) => <NotifItem key={i} {...n} />)}
          </Card>
        </div>
      </div>

      {/* Resources */}
      <Card title="Ressources récentes">
        {RESOURCES.map((r, i) => <ResourceItem key={i} {...r} />)}
      </Card>
    </div>
  )
}
>>>>>>> 48f443108b5c8fe935880c201f85ac819895b3a2

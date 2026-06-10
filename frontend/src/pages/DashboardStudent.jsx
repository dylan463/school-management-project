import { useAuth }                  from '../context/AuthContext'
import { useStudentDashboardV2 }    from '../hooks/dashboard/useStudentDashboardV2'
import StudentStatCard              from '../components/dashboard/StudentStatCard'
import StudentCalendar              from '../components/dashboard/StudentCalendar'
import Card from "../components/ui/Card"
import { useUnreadNotificationsCount } from '../hooks/notifications/useUnreadNotificationsCount'
// ── Icônes ──────────────────────────────────────────────────────────────────
const BookIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const ClipboardIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const LayersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
)

// ── Composant principal ──────────────────────────────────────────────────────
export default function DashboardStudent() {
  const { user }  = useAuth()
  const {
    data,
    isLoading,
    isError,
    examDates,
    modules,
    semestres,
  } = useStudentDashboardV2()

  const {data: notif} = useUnreadNotificationsCount()
  const notifCount = notif || 0

  const firstName = user?.first_name ?? 'Étudiant'
  const mention   = user?.mention?.text ?? user?.mention ?? ''

  // ── Chargement ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Erreur ──
  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
        Une erreur est survenue lors du chargement du tableau de bord.
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">

      {/* ── En-tête ──────────────────────────────────────────────────────── */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Bonjour, {firstName}&nbsp;!
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Voici le résumé de votre scolarité
            {mention && <> — <span className="font-medium text-slate-500">{mention}</span></>}
          </p>
        </div>

        {/* Badge rôle */}
        <span className="mt-1 inline-flex items-center px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold tracking-wide border border-red-100">
          Étudiant
        </span>
      </header>

      {/* ── Stat cards (3 colonnes) ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StudentStatCard
          label="EC à valider"
          value={modules['current']}
          total={modules["total"]}
          icon={LayersIcon}
        />
        <StudentStatCard
          label="Semestre validé"
          value={semestres["current"]}
          total={semestres["total"]}
          icon={ClipboardIcon}
        />
        <Card className='p-10'>
          <p>
          Vous avez {notifCount} notification(s) non lue.
          </p>
        </Card>
      </div>

      {/* ── Calendrier + Notifications ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-3">
          <StudentCalendar examDates={examDates} />
        </div>
        {/* <div className="lg:col-span-1">
          <StudentNotifList />
        </div> */}
      </div>

    </div>
  )
}

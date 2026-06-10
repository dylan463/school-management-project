// frontend/src/components/dashboard/StudentNotifList.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Affiche les 5 dernières notifications de l'utilisateur connecté.
// Données issues de GET /notifications/ via useNotifications() (hook existant).
// Champs réels : { id, title, content, is_read, created_at }
// ─────────────────────────────────────────────────────────────────────────────

import { useNotifications } from '../../hooks/notifications/useNotifications'
import { ROUTES } from '../../utils/constants'
import { Link } from 'react-router-dom'

// Couleur de la bordure gauche selon le statut is_read
const BellIcon = () => (
  <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-9.33-4.998M15 17H9m6 0a3 3 0 01-6 0m10.95-7.05A8.965 8.965 0 0112 5a8.965 8.965 0 00-7.95 4.95" />
  </svg>
)

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60)     return 'À l\'instant'
  if (diff < 3600)   return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400)  return `Il y a ${Math.floor(diff / 3600)} h`
  return `Il y a ${Math.floor(diff / 86400)} j`
}

export default function StudentNotifList() {
  const { data, isLoading, isError } = useNotifications()

  // On affiche au max 5 notifications
  const items = Array.isArray(data) ? data.slice(0, 5) : (data?.results ?? []).slice(0, 5)

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <BellIcon />
          <h2 className="text-sm font-semibold text-slate-800">Notifications récentes</h2>
        </div>
        <Link
          to={ROUTES.NOTIFICATIONS}
          className="text-[11px] font-medium text-red-500 hover:text-red-600 transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {/* États */}
      {isLoading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {isError && (
        <p className="text-xs text-slate-400 text-center py-10">
          Impossible de charger les notifications.
        </p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="text-xs text-slate-400 text-center py-10">
          Aucune notification.
        </p>
      )}

      {/* Liste */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="divide-y divide-slate-100">
          {items.map((notif) => (
            <div
              key={notif.id}
              className={`
                flex gap-3 px-5 py-3.5 transition-colors
                border-l-4
                ${notif.is_read
                  ? 'border-l-slate-200 hover:bg-slate-50'
                  : 'border-l-red-500 bg-red-50/40 hover:bg-red-50/70'
                }
              `}
            >
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] leading-snug ${notif.is_read ? 'font-medium text-slate-600' : 'font-bold text-slate-800'}`}>
                  {notif.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
                  {notif.content}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {timeAgo(notif.created_at)}
                </p>
              </div>
              {!notif.is_read && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

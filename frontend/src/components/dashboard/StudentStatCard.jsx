// frontend/src/components/dashboard/StudentStatCard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Carte statistique avec valeur / total + barre de progression rouge.
// Suit les conventions visuelles du projet (bg-white, rounded-xl, shadow léger).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Props :
 *  @param {string}  label      — libellé en majuscules (ex: "EC À VALIDER")
 *  @param {number}  value      — valeur courante
 *  @param {number}  total      — valeur maximale
 *  @param {node}    [icon]     — composant icône SVG optionnel
 */
export default function StudentStatCard({ label, value, total, icon: Icon }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.13)]">

      {/* Icône + label */}
      <div className="flex items-center gap-2">
        {Icon && (
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-red-500" />
          </div>
        )}
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          {label}
        </p>
      </div>

      {/* Chiffre principal */}
      <div className="flex items-end gap-1">
        <span className="text-4xl font-light tracking-tight text-slate-800 leading-none">
          {value}
        </span>
        <span className="text-lg font-normal text-slate-300 leading-none mb-0.5">
          /{total}
        </span>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-red-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-400">{pct}% complété</p>
    </div>
  )
}

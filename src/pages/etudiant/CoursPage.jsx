import { useState } from 'react'
import Card         from '../../components/ui/Card'
import Pill         from '../../components/ui/Pill'

const RESSOURCES = [
  { id: 1, titre: 'Cours 4 — Modulation AM/FM',           ue: 'Électronique', type: 'PDF', taille: '2.3 Mo', prof: 'Prof. Razafindrakoto', date: '09/04/2026', consultations: 47 },
  { id: 2, titre: 'Cours 3 — Amplificateurs opérationnels',ue: 'Électronique', type: 'PDF', taille: '1.8 Mo', prof: 'Prof. Razafindrakoto', date: '02/04/2026', consultations: 62 },
  { id: 3, titre: 'TP 2 — Configuration routeur Cisco',   ue: 'Réseaux',       type: 'ZIP', taille: '5.1 Mo', prof: 'Prof. Andriamanjato',  date: '08/04/2026', consultations: 38 },
  { id: 4, titre: 'Cours 2 — Architecture TCP/IP',        ue: 'Réseaux',       type: 'PDF', taille: '3.0 Mo', prof: 'Prof. Andriamanjato',  date: '01/04/2026', consultations: 55 },
  { id: 5, titre: 'Exercices — Transformée de Fourier',   ue: 'Signal',        type: 'PDF', taille: '1.1 Mo', prof: 'Prof. Randriamanantena',date: '07/04/2026', consultations: 29 },
  { id: 6, titre: 'Cours 3 — Filtres numériques',         ue: 'Signal',        type: 'PDF', taille: '2.6 Mo', prof: 'Prof. Randriamanantena',date: '04/04/2026', consultations: 41 },
]

const UES = ['Tous', ...new Set(RESSOURCES.map(r => r.ue))]

export default function CoursPage() {
  const [filter, setFilter] = useState('Tous')
  const [search, setSearch] = useState('')

  const filtered = RESSOURCES.filter(r =>
    (filter === 'Tous' || r.ue === filter) &&
    r.titre.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in space-y-4">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Cours en ligne</h2>
        <p className="text-xs text-slate-400 mt-0.5">Ressources pédagogiques déposées par vos enseignants.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Rechercher un cours…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-52"
        />
        <div className="flex gap-1.5">
          {UES.map(ue => (
            <button
              key={ue}
              onClick={() => setFilter(ue)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                filter === ue
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {ue}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(r => (
          <Card key={r.id} className="hover:border-blue-200 transition-colors cursor-pointer">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.type === 'PDF' ? 'bg-blue-50' : 'bg-green-50'}`}>
                <svg className={`w-5 h-5 ${r.type === 'PDF' ? 'text-blue-500' : 'text-green-500'}`} fill="none" viewBox="0 0 20 20">
                  <path d="M5 2.5h7l5 5v10a1 1 0 01-1 1H5a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M12 2.5V8h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 mb-1.5">{r.titre}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Pill label={r.ue} color="purple" />
                  <Pill label={r.type} />
                </div>
                <p className="text-[10px] text-slate-400">{r.prof}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[10px] text-slate-400">{r.date} · {r.taille}</p>
                  <p className="text-[10px] text-slate-400">{r.consultations} vues</p>
                </div>
              </div>
            </div>
            <button className="mt-3 w-full text-xs text-blue-600 font-medium py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              Télécharger
            </button>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">Aucune ressource trouvée.</div>
      )}
    </div>
  )
}
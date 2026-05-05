import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import Pill from '../../components/ui/Pill'
import { useAuth } from '../../context/AuthContext'
import etudiantService from '../../services/etudiantService'

export default function MesCours() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('Tous')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = {}
        if (user?.niveau_id) params.level_id = user.niveau_id
        if (user?.semester_id) params.semester_id = user.semester_id
        if (!params.level_id && user?.niveau) params.level = user.niveau
        if (!params.semester_id && user?.semestre) params.semestre = user.semestre

        const data = await etudiantService.getRessources(params)
        setResources(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Impossible de charger les ressources pédagogiques')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchResources()
    }
  }, [user])

  const niveau = user?.niveau || (typeof user?.semestre === 'number' ? `L${Math.ceil(user.semestre / 2)}` : '')
  const teachingUnits = ['Tous', ...new Set(resources.map(r => r.teaching_unit_name || r.teaching_unit || 'Inconnu'))]
  const filtered = resources.filter(r =>
    (filter === 'Tous' || (r.teaching_unit_name || r.teaching_unit) === filter) &&
    (r.name || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="fade-in space-y-4">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Mes Cours</h2>
        <p className="text-xs text-slate-400 mt-0.5">Ressources pédagogiques déposées par vos enseignants{niveau ? ` pour le niveau ${niveau}` : ''}.</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Rechercher une ressource…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-52"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {teachingUnits.map(ue => (
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

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-sm">Chargement des ressources pédagogiques…</div>
      ) : error ? (
        <div className="text-center py-12 text-red-500 text-sm">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map(resource => (
              <Card key={resource.id} className="hover:border-blue-200 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${resource.file_type === 'PDF' ? 'bg-blue-50' : 'bg-green-50'}`}>
                    <svg className={`w-5 h-5 ${resource.file_type === 'PDF' ? 'text-blue-500' : 'text-green-500'}`} fill="none" viewBox="0 0 20 20">
                      <path d="M5 2.5h7l5 5v10a1 1 0 01-1 1H5a1 1 0 01-1-1V3.5a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M12 2.5V8h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 mb-1.5">{resource.name}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <Pill label={resource.teaching_unit_name || 'Inconnu'} color="purple" />
                      <Pill label={resource.file_type || 'Fichier'} />
                    </div>
                    <p className="text-[10px] text-slate-400">{resource.teacher_name || 'Enseignant inconnu'}</p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span>{new Date(resource.created_at).toLocaleDateString('fr-FR')}</span>
                      <span>{resource.file_url ? 'Téléchargeable' : 'Aucun fichier'}</span>
                    </div>
                  </div>
                </div>
                <a
                  href={resource.file_url || '#'}
                  download={resource.file_url ? resource.name : undefined}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center rounded-lg bg-blue-50 text-xs font-medium text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  {resource.file_url ? 'Télécharger' : 'Voir'}
                </a>
              </Card>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">Aucune ressource trouvée pour ce niveau.</div>
          )}
        </>
      )}
    </div>
  )
}

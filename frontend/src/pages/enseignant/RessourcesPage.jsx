import { useState, useRef } from 'react'
import Card   from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Pill   from '../../components/ui/Pill'

const RESSOURCES_INIT = [
  { id: 1, titre: 'Cours 4 — Modulation AM/FM',         ue: 'Électronique', type: 'PDF', taille: '2.3 Mo', date: '09/04/2026', consultations: 47 },
  { id: 2, titre: 'Cours 3 — Amplificateurs',           ue: 'Électronique', type: 'PDF', taille: '1.8 Mo', date: '02/04/2026', consultations: 62 },
  { id: 3, titre: 'TD 3 — Filtres actifs',              ue: 'Électronique', type: 'PDF', taille: '1.2 Mo', date: '28/03/2026', consultations: 38 },
  { id: 4, titre: 'TP 2 — Mesures oscilloscope',        ue: 'Électronique', type: 'ZIP', taille: '4.5 Mo', date: '21/03/2026', consultations: 55 },
  { id: 5, titre: 'Cours 2 — Propagation des ondes',    ue: 'Antennes',     type: 'PDF', taille: '3.1 Mo', date: '07/04/2026', consultations: 29 },
  { id: 6, titre: 'TD 1 — Calcul de gain d\'antenne',  ue: 'Antennes',     type: 'PDF', taille: '0.9 Mo', date: '31/03/2026', consultations: 41 },
]

const UES = ['Toutes', 'Électronique', 'Antennes']

export default function RessourcesPage() {
  const [ressources, setRessources] = useState(RESSOURCES_INIT)
  const [filter,     setFilter]     = useState('Toutes')
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState({ titre: '', ue: 'Électronique', type: 'PDF' })
  const [saved,      setSaved]      = useState(false)
  const fileRef = useRef()

  const filtered = ressources.filter(r => filter === 'Toutes' || r.ue === filter)

  const handleDeposer = () => {
    if (!form.titre.trim()) return
    const newR = {
      id:           ressources.length + 1,
      titre:        form.titre,
      ue:           form.ue,
      type:         form.type,
      taille:       '—',
      date:         new Date().toLocaleDateString('fr-FR'),
      consultations: 0,
    }
    setRessources(prev => [newR, ...prev])
    setForm({ titre: '', ue: 'Électronique', type: 'PDF' })
    setShowForm(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleDelete = (id) => {
    setRessources(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Ressources pédagogiques</h2>
        <p className="text-xs text-slate-400 mt-0.5">Gérez les supports de cours que vous partagez avec vos étudiants.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total ressources</p>
          <p className="text-2xl font-semibold text-slate-800">{ressources.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Total consultations</p>
          <p className="text-2xl font-semibold text-blue-700">
            {ressources.reduce((a, r) => a + r.consultations, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
          <p className="text-xs text-slate-500 mb-1">Ce mois-ci</p>
          <p className="text-2xl font-semibold text-green-700">{ressources.filter(r => r.date.includes('/04/')).length}</p>
        </div>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-4 py-3 rounded-xl">
          Ressource déposée avec succès. Les étudiants peuvent maintenant y accéder.
        </div>
      )}

      <Card
        title="Mes ressources"
        action={
          <Button size="sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Annuler' : '+ Déposer une ressource'}
          </Button>
        }
      >
        {/* Upload form */}
        {showForm && (
          <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs font-semibold text-slate-700">Nouvelle ressource</p>
            <div>
              <label className="text-[11px] font-medium text-slate-500 block mb-1">Titre du document</label>
              <input
                type="text"
                placeholder="ex : Cours 5 — Modulation numérique"
                value={form.titre}
                onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Unité d'enseignement</label>
                <select
                  value={form.ue}
                  onChange={e => setForm(f => ({ ...f, ue: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
                >
                  <option>Électronique</option>
                  <option>Antennes</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Type de fichier</label>
                <select
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
                >
                  <option>PDF</option>
                  <option>ZIP</option>
                  <option>DOCX</option>
                  <option>PPTX</option>
                </select>
              </div>
            </div>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                <path d="M12 15V3M8 7l4-4 4 4M20 21H4a1 1 0 01-1-1v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-xs text-slate-500">Cliquer pour sélectionner un fichier</p>
              <input ref={fileRef} type="file" className="hidden" />
            </div>
            <Button onClick={handleDeposer} fullWidth>
              Déposer la ressource
            </Button>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1.5 mb-4">
          {UES.map(u => (
            <button
              key={u}
              onClick={() => setFilter(u)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                filter === u
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {u}
            </button>
          ))}
        </div>

        {/* Resources list */}
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${r.type === 'PDF' ? 'bg-blue-50' : r.type === 'ZIP' ? 'bg-green-50' : 'bg-amber-50'}`}>
                <svg className={`w-4 h-4 ${r.type === 'PDF' ? 'text-blue-500' : r.type === 'ZIP' ? 'text-green-500' : 'text-amber-500'}`} fill="none" viewBox="0 0 16 16">
                  <path d="M3.5 2h5l4 4v7.5a1 1 0 01-1 1h-8a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{r.titre}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400">{r.ue}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">{r.date}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">{r.taille}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-[10px] text-slate-400">{r.consultations} vues</span>
                </div>
              </div>
              <Pill label={r.type} />
              <button
                onClick={() => handleDelete(r.id)}
                className="text-slate-300 hover:text-red-500 transition-colors ml-1"
                title="Supprimer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 16 16">
                  <path d="M3 5h10M6 5V3h4v2M5 5l.5 8h5l.5-8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">Aucune ressource dans cette catégorie.</p>
        )}
      </Card>
    </div>
  )
}
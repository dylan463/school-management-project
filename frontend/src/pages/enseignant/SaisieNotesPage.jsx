import { useState } from 'react'
import Card   from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Pill   from '../../components/ui/Pill'

const ETUDIANTS_INIT = [
  { matricule: 'ETU-001', nom: 'Rakoto Ny Aina',    tp: '',  exam: '' },
  { matricule: 'ETU-002', nom: 'Rabe Miora',         tp: '',  exam: '' },
  { matricule: 'ETU-003', nom: 'Andry Hasina',       tp: '',  exam: '' },
  { matricule: 'ETU-004', nom: 'Voahangy Solo',      tp: '',  exam: '' },
  { matricule: 'ETU-005', nom: 'Fenitra Alain',      tp: '',  exam: '' },
  { matricule: 'ETU-006', nom: 'Ramana Tsiory',      tp: '',  exam: '' },
]

const EVALUATIONS = [
  { id: 1, ec: 'Électronique — EC1', type: 'Examen', date: '14/04/2026', bareme: 20 },
  { id: 2, ec: 'Électronique — EC2', type: 'TP',     date: '10/04/2026', bareme: 20 },
  { id: 3, ec: 'Antennes — EC1',     type: 'Examen', date: '20/04/2026', bareme: 20 },
]

export default function SaisieNotesPage() {
  const [evalId,    setEvalId]    = useState(1)
  const [etudiants, setEtudiants] = useState(ETUDIANTS_INIT)
  const [saved,     setSaved]     = useState(false)

  const evalSelected = EVALUATIONS.find(e => e.id === evalId)

  const handleNote = (matricule, field, value) => {
    setSaved(false)
    setEtudiants(prev => prev.map(e =>
      e.matricule === matricule ? { ...e, [field]: value } : e
    ))
  }

  const handleSave = () => {
    // TODO: appel API → enseignantService.saisirNote(evalId, etudiants)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const validCount = etudiants.filter(e => e.tp !== '' || e.exam !== '').length

  return (
    <div className="fade-in space-y-5">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Saisie des notes</h2>
        <p className="text-xs text-slate-400 mt-0.5">Remplissez les notes pour chaque étudiant puis sauvegardez.</p>
      </div>

      {/* Evaluation selector */}
      <Card title="Choisir l'évaluation">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {EVALUATIONS.map(ev => (
            <button
              key={ev.id}
              onClick={() => { setEvalId(ev.id); setSaved(false) }}
              className={`text-left p-3 rounded-xl border-2 transition-all ${
                evalId === ev.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-100 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Pill label={ev.type} />
                <span className="text-[10px] text-slate-400">{ev.date}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">{ev.ec}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Barème : {ev.bareme} pts</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Notes table */}
      <Card
        title={`Notes — ${evalSelected?.ec}`}
        action={
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{validCount}/{etudiants.length} saisis</span>
            <Button size="sm" onClick={handleSave}>
              {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
            </Button>
          </div>
        }
      >
        {saved && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2.5 rounded-lg">
            Notes sauvegardées avec succès.
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400">
                <th className="text-left pb-3 font-medium">Matricule</th>
                <th className="text-left pb-3 font-medium">Nom complet</th>
                <th className="text-center pb-3 font-medium">Note TP (/20)</th>
                <th className="text-center pb-3 font-medium">Note Examen (/20)</th>
                <th className="text-center pb-3 font-medium">Moyenne</th>
              </tr>
            </thead>
            <tbody>
              {etudiants.map(e => {
                const tp   = parseFloat(e.tp)
                const exam = parseFloat(e.exam)
                const moy  = !isNaN(tp) && !isNaN(exam)
                  ? (tp * 0.4 + exam * 0.6).toFixed(1)
                  : null
                return (
                  <tr key={e.matricule} className="border-b border-slate-50 last:border-0">
                    <td className="py-2.5 text-slate-400 font-mono">{e.matricule}</td>
                    <td className="py-2.5 font-medium text-slate-800">{e.nom}</td>
                    <td className="py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={e.tp}
                        onChange={ev => handleNote(e.matricule, 'tp', ev.target.value)}
                        placeholder="—"
                        className="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 outline-none focus:border-blue-400 text-xs"
                      />
                    </td>
                    <td className="py-2.5 text-center">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        value={e.exam}
                        onChange={ev => handleNote(e.matricule, 'exam', ev.target.value)}
                        placeholder="—"
                        className="w-16 px-2 py-1 text-center rounded-lg border border-slate-200 outline-none focus:border-blue-400 text-xs"
                      />
                    </td>
                    <td className="py-2.5 text-center">
                      {moy ? (
                        <span className={`font-semibold ${parseFloat(moy) >= 10 ? 'text-green-700' : 'text-red-600'}`}>
                          {moy}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
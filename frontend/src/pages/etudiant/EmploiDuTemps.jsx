import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import Card from '../../components/ui/Card'
import etudiantService from '../../services/etudiantService'

const DAYS  = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const SLOTS = ['07h30', '9h30', '11h30', '12h30', '14h30', '16h30']

const COLORS = {
  blue:   'bg-blue-50 text-blue-800 border-blue-200',
  green:  'bg-green-50 text-green-800 border-green-200',
  amber:  'bg-amber-50 text-amber-800 border-amber-200',
  purple: 'bg-purple-50 text-purple-800 border-purple-200',
}

export default function EmploiDuTemps() {
  const { user } = useAuth()
  const [edtData, setEdtData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const studentId = user?.id || user?.matricule
  const semestre = user?.semestre || user?.niveau

  useEffect(() => {
    const fetchEdt = async () => {
      try {
        const data = await etudiantService.getEmploiDuTemps(studentId, semestre)
        const edtMap = {}
        data.forEach(item => {
          const key = `${item.day}-${item.time}`
          edtMap[key] = item
        })
        setEdtData(edtMap)
      } catch (err) {
        setError('Erreur lors du chargement de l\'emploi du temps')
      } finally {
        setLoading(false)
      }
    }

    if (!studentId || !semestre) {
      setLoading(false)
      return
    }

    fetchEdt()
  }, [studentId, semestre])

  if (loading) return <div className="fade-in">Chargement...</div>
  if (error) return <div className="fade-in text-red-500">{error}</div>
  if (!studentId || !semestre) {
    return (
      <div className="fade-in text-slate-600">
        Semestre non défini pour cet utilisateur. Veuillez vérifier vos informations de profil.
      </div>
    )
  }

  return (
    <div className="fade-in space-y-4">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Emploi du temps — Semestre {semestre}</h2>
        <p className="text-xs text-slate-400 mt-0.5">Semaine du 7 au 11 avril 2026</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <div className="grid gap-1.5 min-w-[600px]" style={{ gridTemplateColumns: '64px repeat(6, 1fr)' }}>
            {/* Header */}
            <div />
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-600 py-2 bg-slate-50 rounded-lg">{d}</div>
            ))}

            {/* Rows */}
            {SLOTS.map(slot => (
              <>
                <div key={`t-${slot}`} className="text-xs text-slate-400 pt-2 flex-shrink-0">{slot}</div>
                {DAYS.map(day => {
                  const key  = `${day}-${slot}`
                  const cell = edtData[key]
                  return cell ? (
                    <div key={key} className={`rounded-xl p-2.5 border text-xs min-h-[56px] ${COLORS[cell.color]}`}>
                      <p className="font-semibold leading-tight">{cell.label}</p>
                      <p className="opacity-70 text-[10px] mt-0.5">{cell.type} · {cell.room}</p>
                      <p className="opacity-60 text-[10px] mt-0.5 truncate">{cell.prof}</p>
                    </div>
                  ) : (
                    <div key={key} className="rounded-xl bg-slate-50 min-h-[56px] border border-slate-100" />
                  )
                })}
              </>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-slate-50">
          {[
            { color: 'blue',   label: 'Cours magistral' },
            { color: 'green',  label: 'Travaux pratiques' },
            { color: 'amber',  label: 'Travaux dirigés' },
            { color: 'purple', label: 'Examen / contrôle' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className={`w-2.5 h-2.5 rounded ${COLORS[color].split(' ')[0]}`} />
              {label}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

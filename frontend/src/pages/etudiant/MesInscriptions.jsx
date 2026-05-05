import { useState, useEffect } from 'react'
import Card from '../../components/ui/Card'
import { useAuth } from '../../context/AuthContext'
import etudiantService from '../../services/etudiantService'

function InfoCard({ label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function getAcademicYear(user) {
  const storedYear = user?.anneeUniversitaire || user?.anneeAcademique || user?.academicYear
  if (storedYear) return storedYear

  const now = new Date()
  const year = now.getFullYear()
  return now.getMonth() >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`
}

export default function MesInscriptions() {
  const { user } = useAuth()
  const [units, setUnits] = useState([])
  const [unitsLoading, setUnitsLoading] = useState(true)
  const [unitsError, setUnitsError] = useState(null)

  const academicYear = getAcademicYear(user)
  const niveau = user?.niveau || (typeof user?.semestre === 'number' ? `L${Math.ceil(user.semestre / 2)}` : 'Non renseigné')
  const semestreActuel = user?.semestre ? `Semestre ${user.semestre}` : 'Non renseigné'
  const parcours = user?.parcours || 'Non renseigné'

  useEffect(() => {
    const fetchUnits = async () => {
      setUnitsLoading(true)
      setUnitsError(null)
      try {
        const data = await etudiantService.getUniteEnseignement()
        const transformed = Array.isArray(data)
          ? data.map(u => ({
              id: u.id,
              nom: u.name,
              code: u.code,
              credits: u.courses ? u.courses.reduce((sum, c) => sum + (c.course_credits || 0), 0) : 0,
              ecs: (u.courses || []).map(c => ({ nom: c.name, credits: c.course_credits || 0 }))
            }))
          : []
        setUnits(transformed)
      } catch (err) {
        setUnitsError(err.message || "Impossible de charger les EC pour le semestre actuel")
      } finally {
        setUnitsLoading(false)
      }
    }

    if (user) {
      fetchUnits()
    }
  }, [user?.id, user?.semestre])

  return (
    <div className="fade-in space-y-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800">Mes Inscriptions</h2>
        <p className="text-sm text-slate-500 mt-1">Consultez vos inscriptions par semestre</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCard label="Année universitaire" value={academicYear} />
        <InfoCard label="Niveau" value={niveau} />
        <InfoCard label="Semestre actuel" value={semestreActuel} />
        <InfoCard label="Parcours" value={parcours} />
      </div>

      <div className="space-y-3">
        <Card className="p-4 hover:shadow-md transition">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-800">EC étudiés ce semestre</h3>
              <p className="text-sm text-slate-500">Liste automatique des éléments constitutifs pour le semestre actif</p>
            </div>
          </div>

          {unitsLoading ? (
            <p className="text-sm text-slate-500">Chargement des EC...</p>
          ) : unitsError ? (
            <p className="text-sm text-red-500">{unitsError}</p>
          ) : units.length === 0 ? (
            <p className="text-sm text-slate-500">Aucun EC trouvé pour le semestre actuel.</p>
          ) : (
            <div className="space-y-3">
              {units.map((unit) => (
                <div key={unit.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800">{unit.nom}</h4>
                      <p className="text-xs text-slate-500">{unit.code}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>{unit.credits} crédits</span>
                      <span>{unit.ecs.length} EC</span>
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {unit.ecs.map((ec, ecIdx) => (
                      <div key={ecIdx} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-sm font-medium text-slate-900 truncate">{ec.nom}</p>
                        <p className="text-xs text-slate-500 mt-1">{ec.credits} crédits</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

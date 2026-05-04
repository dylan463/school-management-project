import { useState, useEffect } from 'react'
import Card  from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import enseignantService from '../../services/enseignantService'

export default function MesEtudiants() {
  const [studentsByLevel, setStudentsByLevel] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLevelId, setSelectedLevelId] = useState(null)

  const downloadCsv = (students, levelCode) => {
    if (!students || students.length === 0) return

    const headers = ['Nom', 'Prénom', 'Matricule', 'Email', 'Absences']
    const rows = students.map(student => {
      const absences = student.absences ?? student.absence_count ?? 0
      return [student.last_name || '', student.first_name || '', student.matricule || '', student.email || '', absences]
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\r\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.setAttribute('download', `etudiants_${levelCode || 'niveau'}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await enseignantService.getStudentsByLevel()
        setStudentsByLevel(data)
        setSelectedLevelId(data[0]?.level?.id ?? null)
      } catch (error) {
        console.error('Error fetching students:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  const filteredLevels = studentsByLevel.map(level => ({
    ...level,
    students: level.students
  })).filter(level => level.students.length > 0)

  const selectedLevel = filteredLevels.find(level => String(level.level.id) === String(selectedLevelId))

  if (loading) {
    return <div className="fade-in space-y-5"><p>Chargement...</p></div>
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Mes étudiants</h2>
        <p className="text-xs text-slate-400 mt-0.5">Étudiants par niveau enseigné</p>
      </div>

      <Card>
        <div className="mb-4">
          <label htmlFor="level-select" className="block text-xs font-semibold text-slate-600 mb-2">
            Choisissez un niveau
          </label>
          <select
            id="level-select"
            value={selectedLevelId ?? ''}
            onChange={e => setSelectedLevelId(e.target.value)}
            className="w-full max-w-sm px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-400"
          >
            <option value="" disabled>Sélectionner un niveau...</option>
            {filteredLevels.map(level => (
              <option key={level.level.id} value={level.level.id}>
                {level.level.code}
              </option>
            ))}
          </select>
        </div>

        {filteredLevels.length === 0 ? (
          <p className="text-center text-slate-400 text-sm py-8">Aucun niveau disponible.</p>
        ) : selectedLevel ? (
          <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{selectedLevel.level.code}</p>
                <p className="text-xs text-slate-500">{selectedLevel.students.length} étudiant{selectedLevel.students.length > 1 ? 's' : ''}</p>
              </div>
              <button
                type="button"
                onClick={() => downloadCsv(selectedLevel.students, selectedLevel.level.code)}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Télécharger la liste
              </button>
            </div>
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400">
                      <th className="text-left pb-3 font-medium">Étudiant</th>
                      <th className="text-left pb-3 font-medium">Matricule</th>
                      <th className="text-left pb-3 font-medium">Email</th>
                      <th className="text-left pb-3 font-medium">Absences</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedLevel.students.map((student, i) => {
                      const absences = student.absences ?? student.absence_count ?? 0
                      return (
                        <tr key={student.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2.5">
                              <Avatar name={`${student.first_name} ${student.last_name}`} size="sm" colorIndex={i % 5} />
                              <span className="font-medium text-slate-800">{student.first_name} {student.last_name}</span>
                            </div>
                          </td>
                          <td className="py-3 text-slate-400 font-mono">{student.matricule}</td>
                          <td className="py-3 text-slate-500">{student.email}</td>
                          <td className="py-3 text-slate-500">{absences}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-slate-400 text-sm py-8">Sélectionnez un niveau pour voir les étudiants.</p>
        )}
      </Card>
    </div>
  )
}

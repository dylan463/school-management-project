import { useState, useEffect } from 'react'
import Card   from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import enseignantService from '../../services/enseignantService'

export default function MesAnnotations() {
  const [levels, setLevels] = useState([])
  const [courses, setCourses] = useState([])
  const [selectedLevelId, setSelectedLevelId] = useState('')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [grades, setGrades] = useState({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [levelsData, coursesData] = await Promise.all([
          enseignantService.getStudentsByLevel(),
          enseignantService.getMyCourses(),
        ])

        setLevels(Array.isArray(levelsData) ? levelsData : [])
        setCourses(Array.isArray(coursesData) ? coursesData : [])
        setSelectedLevelId(levelsData?.[0]?.level?.id ?? '')
      } catch (error) {
        console.error('Erreur chargement des données :', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const selectedLevel = levels.find(level => String(level.level.id) === String(selectedLevelId))
  const levelCode = selectedLevel?.level?.code
  const levelCourses = courses.filter(course => course.level_code === levelCode)
  const selectedCourse = levelCourses.find(course => String(course.id) === String(selectedCourseId)) || levelCourses[0]

  useEffect(() => {
    if (!selectedLevelId) return

    const firstCourseForLevel = levelCourses[0]
    if (!firstCourseForLevel) {
      setSelectedCourseId('')
      return
    }

    if (!selectedCourseId || !levelCourses.some(course => String(course.id) === String(selectedCourseId))) {
      setSelectedCourseId(firstCourseForLevel.id)
    }
  }, [selectedLevelId, levelCourses, selectedCourseId])

  const handleGradeChange = (studentId, value) => {
    setSaved(false)
    setGrades(prev => ({ ...prev, [studentId]: value }))
  }

  const handleSave = async () => {
    if (!selectedCourse) return

    const payload = Object.entries(grades).map(([studentId, note]) => ({
      student: studentId,
      note: note === '' ? null : parseFloat(note),
    }))

    try {
      // TODO: adapter à l'API réelle si nécessaire
      await enseignantService.saisirNote(selectedCourse.id, payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Erreur lors de la sauvegarde :', error)
    }
  }

  const students = selectedLevel?.students ?? []
  const validCount = students.filter(student => grades[student.id] !== undefined && grades[student.id] !== '').length

  if (loading) {
    return (
      <div className="fade-in space-y-5">
        <div className="mb-1">
          <h2 className="text-base font-semibold text-slate-800">Mes Annotations</h2>
          <p className="text-xs text-slate-400 mt-0.5">Notes par niveau et EC</p>
        </div>
        <Card>
          <p className="text-sm text-slate-500">Chargement des niveaux et des EC…</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="fade-in space-y-5">
      <div className="mb-1">
        <h2 className="text-base font-semibold text-slate-800">Mes Annotations</h2>
        <p className="text-xs text-slate-400 mt-0.5">Choisissez un niveau, puis un EC et saisissez les notes.</p>
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="level-select" className="block text-xs font-semibold text-slate-600 mb-2">
              Niveau enseigné
            </label>
            <select
              id="level-select"
              value={selectedLevelId}
              onChange={e => setSelectedLevelId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-400"
            >
              <option value="" disabled>Sélectionner un niveau...</option>
              {levels.map(level => (
                <option key={level.level.id} value={level.level.id}>
                  {level.level.code}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="course-select" className="block text-xs font-semibold text-slate-600 mb-2">
              EC / Cours
            </label>
            <select
              id="course-select"
              value={selectedCourse?.id ?? ''}
              onChange={e => setSelectedCourseId(e.target.value)}
              disabled={!selectedLevel || levelCourses.length === 0}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white outline-none focus:border-blue-400 disabled:cursor-not-allowed disabled:bg-slate-50"
            >
              {!selectedLevel && <option value="">Choisissez d'abord un niveau</option>}
              {selectedLevel && levelCourses.length === 0 && <option value="">Aucun EC disponible</option>}
              {levelCourses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.teaching_unit_name || course.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800">Étudiants — {selectedLevel?.level?.code || 'Aucun niveau'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {selectedCourse ? `${selectedCourse.teaching_unit_name || selectedCourse.name}` : 'Sélectionnez un EC pour afficher la liste'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-slate-400">{validCount}/{students.length} saisis</span>
            <Button size="sm" onClick={handleSave} disabled={!selectedCourse || students.length === 0}>
              {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        {saved && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2.5 rounded-lg">
            Notes sauvegardées avec succès.
          </div>
        )}

        {selectedLevel ? (
          students.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-8">Aucun étudiant disponible pour ce niveau.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400">
                    <th className="text-left pb-3 font-medium">Étudiant</th>
                    <th className="text-left pb-3 font-medium">Matricule</th>
                    <th className="text-center pb-3 font-medium">Note (/20)</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">
                        {`${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Étudiant inconnu'}
                      </td>
                      <td className="py-3 text-slate-400 font-mono">{student.matricule}</td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.5"
                          value={grades[student.id] ?? ''}
                          onChange={e => handleGradeChange(student.id, e.target.value)}
                          placeholder="—"
                          className="w-20 px-2 py-1 text-center rounded-lg border border-slate-200 outline-none focus:border-blue-400 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <p className="text-center text-slate-400 text-sm py-8">Choisissez un niveau pour afficher les étudiants.</p>
        )}
      </Card>
    </div>
  )
}

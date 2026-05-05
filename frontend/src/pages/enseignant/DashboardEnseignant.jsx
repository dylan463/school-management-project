import { useState, useEffect } from 'react'
import { useAuth }    from '../../context/AuthContext'
import authService    from '../../services/authService'
import enseignantService from '../../services/enseignantService'
import { storage }   from '../../utils/storage'
import Card           from '../../components/ui/Card'
import TeacherProfileModal from '../../components/ui/TeacherProfileModal'

export default function DashboardEnseignant() {
  const { user, setUser } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState([])
  const [scheduleLoading, setScheduleLoading] = useState(true)
  const [scheduleError, setScheduleError] = useState(null)
  const [courses, setCourses] = useState([])
  const [resourceTitle, setResourceTitle] = useState('')
  const [resourceCourseId, setResourceCourseId] = useState('')
  const [resourceFile, setResourceFile] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleSaveProfile = async (form) => {
    setSaving(true)
    setSaveError(null)
    try {
      const updated = await authService.updateProfile(form)
      setUser && setUser(updated)
      storage.setUser(updated)
      setEditOpen(false)
    } catch (err) {
      setSaveError(err.response?.data?.detail || err.message || 'Impossible de sauvegarder le profil')
    } finally {
      setSaving(false)
    }
  }

  const formatDay = (day) => {
    const dayMap = {
      MON: 'Lundi',
      TUE: 'Mardi',
      WED: 'Mercredi',
      THU: 'Jeudi',
      FRI: 'Vendredi',
      SAT: 'Samedi',
    }
    return dayMap[day] || day || '—'
  }

  const formatTime = (start, end) => {
    if (!start || !end) return '—'
    return `${start.slice(0, 5)} - ${end.slice(0, 5)}`
  }

  useEffect(() => {
    const loadSchedule = async () => {
      setScheduleLoading(true)
      setScheduleError(null)
      try {
        const data = await enseignantService.getMySchedule()
        setSchedule(data)
      } catch (err) {
        setScheduleError(err.response?.data?.detail || err.message || 'Impossible de charger les cours')
      } finally {
        setScheduleLoading(false)
      }
    }

    const loadCourses = async () => {
      try {
        const data = await enseignantService.getMyCourses()
        setCourses(data)
        if (data.length > 0) {
          setResourceCourseId(data[0]?.id || '')
        }
      } catch (err) {
        console.error('Impossible de charger les matières', err)
      }
    }

    loadSchedule()
    loadCourses()
  }, [])

  const handleResourceUpload = async (event) => {
    event.preventDefault()
    setUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    if (!resourceTitle.trim() || !resourceCourseId || !resourceFile) {
      setUploadError('Veuillez compléter le titre, la matière et le fichier.')
      setUploading(false)
      return
    }

    const formData = new FormData()
    formData.append('title', resourceTitle.trim())
    formData.append('course_component', resourceCourseId)
    formData.append('file', resourceFile)

    try {
      await enseignantService.createResource(formData)
      setUploadSuccess('Ressource téléversée avec succès.')
      setResourceTitle('')
      setResourceFile(null)
      setUploadError(null)
      setResourceCourseId(courses[0]?.id || '')
      document.getElementById('resource-file-input')?.value && (document.getElementById('resource-file-input').value = '')
    } catch (err) {
      setUploadError(err.response?.data?.detail || err.response?.data?.file || err.message || 'Impossible de téléverser la ressource')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fade-in space-y-5">
      {/* Welcome */}
      <div className="mb-1 flex flex-col gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800">
            Bonjour, {user?.prenom || 'Professeur'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Voici un aperçu de vos activités pédagogiques.</p>
        </div>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        >
          Modifier mon profil enseignant
        </button>
      </div>

      {saveError && (
        <div className="text-red-500 text-sm">{saveError}</div>
      )}

      <Card title="Cours enseignés">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="text-left pb-3 font-medium">Jour</th>
                <th className="text-left pb-3 font-medium">Heure</th>
                <th className="text-left pb-3 font-medium">Classe</th>
                <th className="text-left pb-3 font-medium">EC</th>
                <th className="text-center pb-3 font-medium">Crédits</th>
              </tr>
            </thead>
            <tbody>
              {scheduleLoading ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-slate-500">Chargement des cours...</td>
                </tr>
              ) : scheduleError ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-red-500">{scheduleError}</td>
                </tr>
              ) : schedule.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-slate-500">Aucun cours renseigné pour vous.</td>
                </tr>
              ) : schedule.map((slot, index) => (
                <tr key={slot.id ?? index} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 text-slate-700">{formatDay(slot.day)}</td>
                  <td className="py-3 text-slate-700">{formatTime(slot.start_time, slot.end_time)}</td>
                  <td className="py-3 text-slate-700">{slot.semester_name || '—'}</td>
                  <td className="py-3 text-slate-700">{slot.course_name || '—'}</td>
                  <td className="py-3 text-center text-slate-700">{slot.course_credits ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Téléverser une ressource pédagogique">
        <form onSubmit={handleResourceUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600">Titre de la ressource</label>
            <input
              type="text"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none"
              placeholder="Ex: Fiche de révision - Algèbre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">Matière</label>
            <select
              value={resourceCourseId}
              onChange={(e) => setResourceCourseId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-blue-400 focus:outline-none"
            >
              {courses.length === 0 ? (
                <option value="">Aucune matière disponible</option>
              ) : (
                courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name || course.title || course.libelle || course.ec_name || 'Matière'}
                    {course.level_code && course.semester_name ? ` (${course.level_code}-${course.semester_name})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600">Fichier</label>
            <input
              id="resource-file-input"
              type="file"
              accept="application/pdf,image/*,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
              className="mt-2 w-full text-sm text-slate-700"
            />
          </div>

          {uploadError && <div className="text-sm text-red-500">{uploadError}</div>}
          {uploadSuccess && <div className="text-sm text-green-600">{uploadSuccess}</div>}

          <button
            type="submit"
            disabled={uploading || courses.length === 0}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {uploading ? 'Téléversement...' : 'Téléverser la ressource'}
          </button>
        </form>
      </Card>

      <TeacherProfileModal
        user={user}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveProfile}
        saving={saving}
      />
    </div>
  )
}
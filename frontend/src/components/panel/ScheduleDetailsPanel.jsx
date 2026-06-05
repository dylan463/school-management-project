import { useState, useMemo } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { useModal } from '../../context/ModalContext'
import useDRFErrors from "../../hooks/useDRFError"
import { toast } from 'react-toastify'
import { ROLES } from "../../utils/constants"
import { useAuth } from "../../context/AuthContext"

import { useScheduleEntries } from "../../hooks/timetable/useScheduleEntries"
import { useCreateScheduleEntry } from "../../hooks/timetable/useCreateScheduleEntry"
import { useDeleteScheduleEntry } from "../../hooks/timetable/useDeleteScheduleEntry"
import { useTeacherAvailabilities } from "../../hooks/timetable/useTeacherAvailabilities"
import { useCoursemodules } from "../../hooks/coursemodules/useCoursemodules"

const DAYS = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
]

function AssignSlotModal({ schedule, courseModules, onSuccess }) {
  const [form, setForm] = useState({
    course_module: "",
    day: "MONDAY",
    start_time: "",
    end_time: "",
    classroom: ""
  })

  const { handleErrors, getError, clearErrors } = useDRFErrors()
  const create = useCreateScheduleEntry()
  const [loading, setLoading] = useState(false)

  const selectedCourse = useMemo(() => {
    return courseModules.find(c => String(c.id) === String(form.course_module))
  }, [form.course_module, courseModules])

  const teacherId = selectedCourse?.teacher?.id
  const { data: availabilitiesData, isLoading: isLoadingAvail } = useTeacherAvailabilities(
    teacherId ? { teacher: teacherId } : {},
    { enabled: !!teacherId }
  )
  const availabilities = availabilitiesData?.results || availabilitiesData || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)
    try {
      await create.mutateAsync({
        schedule: schedule.id,
        course_module: form.course_module,
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time,
        classroom: form.classroom
      })
      toast.success("Créneau assigné avec succès")
      onSuccess?.()
    } catch (error) {
      handleErrors(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-3 max-w-lg">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Module de cours</label>
        <select
          value={form.course_module}
          onChange={(e) => setForm(prev => ({ ...prev, course_module: e.target.value }))}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          <option value="">-- Sélectionner un cours --</option>
          {courseModules.map(c => (
            <option key={c.id} value={c.id}>
              {c.text || c.code} {c.teacher ? `(${c.teacher.first_name} ${c.teacher.last_name})` : "(Sans enseignant)"}
            </option>
          ))}
        </select>
        {getError("course_module") && <span className="text-xs text-red-500">{getError("course_module")}</span>}
      </div>

      {teacherId && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-md">
          <p className="text-sm font-semibold text-blue-800 mb-2">Disponibilités de l'enseignant</p>
          {isLoadingAvail ? (
            <p className="text-xs text-blue-600">Chargement...</p>
          ) : availabilities.length > 0 ? (
            <ul className="text-xs text-blue-700 space-y-1">
              {availabilities.map(a => (
                <li key={a.id}>
                  {DAYS.find(d => d.value === a.day)?.label} : {a.start_time.substring(0, 5)} - {a.end_time.substring(0, 5)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-blue-600">Aucune disponibilité renseignée par cet enseignant.</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Jour</label>
          <select
            value={form.day}
            onChange={(e) => setForm(prev => ({ ...prev, day: e.target.value }))}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            {DAYS.map(d => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
          {getError("day") && <span className="text-xs text-red-500">{getError("day")}</span>}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Salle (Optionnel)</label>
          <input
            type="text"
            value={form.classroom}
            onChange={(e) => setForm(prev => ({ ...prev, classroom: e.target.value }))}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ex : Salle A1"
          />
          {getError("classroom") && <span className="text-xs text-red-500">{getError("classroom")}</span>}
        </div>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Heure de début</label>
          <input
            type="time"
            value={form.start_time}
            onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
          {getError("start_time") && <span className="text-xs text-red-500">{getError("start_time")}</span>}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Heure de fin</label>
          <input
            type="time"
            value={form.end_time}
            onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
          {getError("end_time") && <span className="text-xs text-red-500">{getError("end_time")}</span>}
        </div>
      </div>

      {getError("non_field_errors") && <div className="text-sm text-red-500">{getError("non_field_errors")}</div>}
      {getError("detail") && <div className="text-sm text-red-500">{getError("detail")}</div>}

      <div className="flex justify-end mt-2">
        <Button type="submit" variant="primary" disabled={loading || !form.course_module || !form.start_time || !form.end_time}>
          {loading ? "Assignation..." : "Assigner"}
        </Button>
      </div>
    </form>
  )
}

function DeleteEntryConfirm({ entry, onSuccess }) {
  const destroy = useDeleteScheduleEntry()
  const [loading, setLoading] = useState(false)
  const { handleErrors, getError } = useDRFErrors()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await destroy.mutateAsync(entry.id)
      toast.success("Créneau supprimé")
    } catch (error) {
      handleErrors(error)
      const msg = getError("detail") || "Erreur de suppression"
      toast.error(msg)
    } finally {
      setLoading(false)
      onSuccess?.()
    }
  }

  return (
    <div className="p-3">
      <p>Voulez-vous supprimer ce créneau pour le cours <strong>{entry.course_module?.text || "Inconnu"}</strong> ?</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleConfirm} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white">
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  )
}


export default function ScheduleDetailsPanel({ schedule, onBack }) {
  const { openModal, closeModal } = useModal()
  const { role } = useAuth()
  const canManage = [ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY].includes(role)

  const { data: entriesData, isLoading: isEntriesLoading } = useScheduleEntries({ schedule: schedule.id, no_pagination: true })
  const entries = entriesData?.results || entriesData || []

  // Fetch course modules for this formation and semester
  const { data: coursesData } = useCoursemodules({
    formation: schedule.formation?.id || schedule.formation,
    semester: schedule.semester?.id || schedule.semester,
    no_pagination: true
  })
  const courses = coursesData?.results || coursesData || []

  const openAssignModal = () => {
    openModal({
      title: "Assigner un cours à un créneau",
      content: <AssignSlotModal schedule={schedule} courseModules={courses} onSuccess={closeModal} />
    })
  }

  const handleDelete = (entry) => {
    openModal({
      title: "Supprimer le créneau",
      content: <DeleteEntryConfirm entry={entry} onSuccess={closeModal} />
    })
  }

  // Grouper les entries par jour
  const groupedEntries = useMemo(() => {
    const grouped = {}
    DAYS.forEach(d => grouped[d.value] = [])
    entries.forEach(e => {
      if (grouped[e.day]) {
        grouped[e.day].push(e)
      }
    })
    // Trier par heure de début
    Object.keys(grouped).forEach(k => {
      grouped[k].sort((a, b) => a.start_time.localeCompare(b.start_time))
    })
    return grouped
  }, [entries])

  return (
    <Card className="mt-4 mb-20">
      <div className="px-4 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-4">
          <Button variant="secondary" onClick={onBack}>&larr; Retour</Button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Détails de l'emploi du temps #{schedule.id}</h2>
            <p className="text-sm text-slate-500">
              {schedule.formation?.text || schedule.formation?.code} - {schedule.semester?.code}
            </p>
          </div>
        </div>
        {canManage && (
          <Button variant="primary" onClick={openAssignModal}>
            + Ajouter un créneau
          </Button>
        )}
      </div>

      <div className="p-4">
        {isEntriesLoading ? (
          <div className="text-center text-slate-500 py-10">Chargement des créneaux...</div>
        ) : (
          <div className="space-y-6">
            {DAYS.map(dayObj => {
              const dayEntries = groupedEntries[dayObj.value]
              if (dayEntries.length === 0) return null

              return (
                <div key={dayObj.value} className="border border-slate-200 rounded-lg overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 font-semibold text-slate-700 border-b border-slate-200 uppercase text-sm">
                    {dayObj.label}
                  </div>
                  <div className="divide-y divide-slate-100">
                    {dayEntries.map(entry => (
                      <div key={entry.id} className="p-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">
                            {entry.start_time.substring(0, 5)} - {entry.end_time.substring(0, 5)}
                          </span>
                          <span className="text-sm text-slate-600 mt-1">
                            {entry.course_module?.text || entry.course_module?.code || "Cours inconnu"}
                          </span>
                          <span className="text-xs text-slate-500 mt-1">
                            {entry.course_module?.teacher 
                              ? `Enseignant: ${entry.course_module.teacher.first_name} ${entry.course_module.teacher.last_name}` 
                              : "Aucun enseignant assigné"}
                            {entry.classroom && ` • Salle: ${entry.classroom}`}
                          </span>
                        </div>
                        {canManage && (
                          <button
                            onClick={() => handleDelete(entry)}
                            className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-3 py-1 rounded"
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {Object.values(groupedEntries).every(arr => arr.length === 0) && (
              <div className="text-center text-slate-500 py-10">
                Aucun créneau configuré pour le moment.
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}

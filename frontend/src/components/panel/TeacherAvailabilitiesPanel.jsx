import { useState } from "react"
import Card from "../ui/Card"
import Button from "../ui/Button"
import { useAuth } from "../../context/AuthContext"
import { toast } from 'react-toastify'
import useDRFErrors from "../../hooks/useDRFError"

import { useTeacherAvailabilities } from "../../hooks/timetable/useTeacherAvailabilities"
import { useCreateTeacherAvailability } from "../../hooks/timetable/useCreateTeacherAvailability"
import { useDeleteTeacherAvailability } from "../../hooks/timetable/useDeleteTeacherAvailability"

const DAYS = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
]

export default function TeacherAvailabilitiesPanel() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    day: "MONDAY",
    start_time: "",
    end_time: ""
  })

  const { handleErrors, getError, clearErrors } = useDRFErrors()
  const create = useCreateTeacherAvailability()
  const destroy = useDeleteTeacherAvailability()

  const { data, isLoading } = useTeacherAvailabilities({ teacher: user?.id, no_pagination: true })
  const availabilities = data?.results || data || []

  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearErrors()
    setLoading(true)
    try {
      await create.mutateAsync({
        teacher: user?.id,
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time
      })
      toast.success("Disponibilité ajoutée")
      setForm({ day: "MONDAY", start_time: "", end_time: "" })
    } catch (error) {
      handleErrors(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await destroy.mutateAsync(id)
      toast.success("Disponibilité retirée")
    } catch (error) {
      const msg = error.response?.data?.detail || "Erreur de suppression"
      toast.error(msg)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Card className="mt-4 border-l-4 border-blue-500">
      <div className="px-4 py-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-800">Mes Créneaux de Liberté</h2>
        <p className="text-sm text-slate-500">
          Déclarez vos disponibilités hebdomadaires. Ces créneaux seront utilisés pour vous affecter des cours.
        </p>
      </div>

      <div className="p-4 grid md:grid-cols-3 gap-6">
        {/* Formulaire d'ajout */}
        <div className="col-span-1 border-r pr-6 border-slate-100">
          <h3 className="text-md font-semibold text-slate-700 mb-4">Ajouter un créneau</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Jour</label>
              <select
                value={form.day}
                onChange={(e) => setForm(prev => ({ ...prev, day: e.target.value }))}
                className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {DAYS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
              {getError("day") && <span className="text-xs text-red-500">{getError("day")}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Heure de début</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm(prev => ({ ...prev, start_time: e.target.value }))}
                className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {getError("start_time") && <span className="text-xs text-red-500">{getError("start_time")}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm text-slate-600">Heure de fin</label>
              <input
                type="time"
                value={form.end_time}
                onChange={(e) => setForm(prev => ({ ...prev, end_time: e.target.value }))}
                className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {getError("end_time") && <span className="text-xs text-red-500">{getError("end_time")}</span>}
            </div>

            {getError("non_field_errors") && <div className="text-sm text-red-500">{getError("non_field_errors")}</div>}
            {getError("detail") && <div className="text-sm text-red-500">{getError("detail")}</div>}

            <Button type="submit" variant="primary" disabled={loading || !form.start_time || !form.end_time} className="mt-2 w-full justify-center">
              {loading ? "Ajout en cours..." : "Ajouter"}
            </Button>
          </form>
        </div>

        {/* Liste des créneaux */}
        <div className="col-span-2">
          <h3 className="text-md font-semibold text-slate-700 mb-4">Créneaux actuels</h3>
          {isLoading ? (
            <p className="text-sm text-slate-500">Chargement...</p>
          ) : availabilities.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {availabilities.map(a => (
                <div key={a.id} className="flex justify-between items-center p-3 border border-slate-200 rounded-md bg-white hover:border-blue-300 transition-colors">
                  <div>
                    <span className="font-bold text-slate-800 mr-2 text-sm">
                      {DAYS.find(d => d.value === a.day)?.label}
                    </span>
                    <span className="text-slate-600 text-sm">
                      {a.start_time.substring(0, 5)} - {a.end_time.substring(0, 5)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="text-xs text-red-500 hover:text-white border border-red-200 hover:bg-red-500 px-2 py-1 rounded transition-colors"
                  >
                    {deletingId === a.id ? "..." : "Retirer"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-md border border-dashed border-slate-300">
              <p className="text-sm text-slate-500">Vous n'avez défini aucun créneau de disponibilité.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

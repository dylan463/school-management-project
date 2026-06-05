import { useState, useMemo } from "react"
import { useAuth } from "../../context/AuthContext"
import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from "../DataTable"
import { toast } from 'react-toastify'
import { useModal } from '../../context/ModalContext'
import useDebounced from '../../hooks/useDebounced'
import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchWithDropdown from "../SearchWithDropdown"
import { ROLES } from "../../utils/constants"
import useDRFErrors from "../../hooks/useDRFError"

import { useSchedules } from "../../hooks/timetable/useSchedules"
import { useCreateSchedule } from "../../hooks/timetable/useCreateSchedule"
import { useDeleteSchedule } from "../../hooks/timetable/useDeleteSchedule"
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useQueryParams } from "../../hooks/useQueryParams"


function AddScheduleForm({ onSuccess }) {
  const [form, setForm] = useState({ formation: "", semester: "" })
  const create = useCreateSchedule()
  const { handleErrors, getError, clearErrors } = useDRFErrors()
  const [loading, setLoading] = useState(false)

  // ── Formation dropdown ──
  const formationDropdown = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: formationsOptions, isFetching: isFormationsFetching } = useFormations(
    formationDropdown.query ? { search: formationDropdown.query } : {},
    formationDropdown.query.length >= 1
  )
  const formationResults = formationsOptions?.results || formationsOptions || []

  // ── Semesters ──
  const { data: semesterData } = useSemesters({ no_pagination: true })
  const semesters = semesterData?.results || semesterData || []

  const [selectedFormation, setSelectedFormation] = useState(null)

  const handleSelectFormation = (f) => {
    setSelectedFormation(f)
    setForm(prev => ({ ...prev, formation: f.id }))
    formationDropdown.close()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.formation || !form.semester) return

    setLoading(true)
    clearErrors()
    try {
      await create.mutateAsync(form)
      toast.success("Emploi du temps créé avec succès")
      onSuccess?.()
    } catch (error) {
      handleErrors(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
      {/* Formation */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Parcours (Formation)</label>
        {!selectedFormation ? (
          <SearchWithDropdown
            value={formationDropdown.value}
            onChange={formationDropdown.onChange}
            isOpen={formationDropdown.isOpen}
            close={formationDropdown.close}
            containerRef={formationDropdown.containerRef}
            options={formationResults}
            loading={isFormationsFetching}
            onSelect={handleSelectFormation}
            renderOption={(option) => (
              <div className="flex gap-x-2 items-center">
                <div>{option.text || option.code}</div>
              </div>
            )}
            placeholder="Rechercher un parcours"
            inputClassName="w-full"
          />
        ) : (
          <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-slate-50">
            <span className="text-sm">{selectedFormation.text || selectedFormation.code}</span>
            <button
              type="button"
              onClick={() => { setSelectedFormation(null); setForm(prev => ({ ...prev, formation: "" })) }}
              className="text-xs text-red-500 hover:underline"
            >
              Changer
            </button>
          </div>
        )}
        {getError("formation") && <span className="text-xs text-red-500">{getError("formation")}</span>}
      </div>

      {/* Semestre */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Semestre</label>
        <select
          name="semester"
          value={form.semester}
          onChange={(e) => setForm(prev => ({ ...prev, semester: e.target.value }))}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          <option value="">-- Choisir un semestre --</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.code || s.order}</option>
          ))}
        </select>
        {getError("semester") && <span className="text-xs text-red-500">{getError("semester")}</span>}
      </div>

      {/* Errors */}
      {getError("non_field_errors") && <div className="text-sm text-red-500">{getError("non_field_errors")}</div>}
      {getError("detail") && <div className="text-sm text-red-500">{getError("detail")}</div>}

      <div className="flex justify-end mt-2">
        <Button type="submit" variant="primary" disabled={loading || !form.formation || !form.semester}>
          {loading ? "Création..." : "Créer"}
        </Button>
      </div>
    </form>
  )
}

function DeleteScheduleConfirm({ schedule, onSuccess }) {
  const destroy = useDeleteSchedule()
  const [loading, setLoading] = useState(false)
  const { handleErrors, getError } = useDRFErrors()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await destroy.mutateAsync(schedule.id)
      toast.success("Emploi du temps supprimé avec succès")
    } catch (error) {
      handleErrors(error)
      const msg = getError("detail") || "Erreur lors de la suppression"
      toast.error(msg)
    } finally {
      setLoading(false)
      onSuccess?.()
    }
  }

  return (
    <div className="p-3">
      <p>Voulez-vous vraiment supprimer cet emploi du temps (ID: #{schedule.id}) pour <strong>{schedule.formation?.text || schedule.formation?.code}</strong> ?</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleConfirm} disabled={loading} className="bg-red-500 hover:bg-red-600 text-white">
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  )
}

export default function SchedulesPanel({ onSelectSchedule }) {
  const { role } = useAuth()
  const { openModal, closeModal } = useModal()

  const {
    formation, setFormation,
    semester, setSemester,
  } = useQueryParams({
    formation: { key: "formation", type: "string", default: "" },
    semester: { key: "semester", type: "string", default: "" },
  })

  const [showFilters, setShowFilters] = useState(false)

  // ── Filters Dropdowns ──
  const formationDropdown = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: formationsOptions, isFetching: isFormationsFetching } = useFormations(
    formationDropdown.query ? { search: formationDropdown.query } : {},
    formationDropdown.query.length >= 1
  )
  const formationOptionResults = formationsOptions?.results || formationsOptions || []
  const { data: selectedFormationData } = useFormation(formation)

  const { data: semesterData } = useSemesters({ no_pagination: true })
  const semesters = semesterData?.results || semesterData || []

  const filters = useMemo(() => ({
    ...(formation && { formation }),
    ...(semester && { semester }),
  }), [formation, semester])

  const { data, isLoading: isDataLoading } = useSchedules(filters)
  const results = data?.results || data || []

  const canCreate = [ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY].includes(role)

  const columns = [
    { header: "ID", key: "id", render: (id) => `#${id}` },
    { header: "Parcours", key: "formation", render: (f) => f?.text || f?.code || "—" },
    { header: "Semestre", key: "semester", render: (s) => s?.code || "—" },
    { header: "Créé le", key: "created_at", render: (date) => new Date(date).toLocaleDateString() },
  ]

  const actions = [
    {
      label: "Gérer les créneaux",
      handler: (row) => onSelectSchedule(row),
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({
        title: "Supprimer l'emploi du temps",
        content: <DeleteScheduleConfirm schedule={row} onSuccess={closeModal} />
      }),
      conditionGlobal: canCreate,
    }
  ]

  return (
    <Card className="mt-4">
      <div className="px-4 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-800">Liste des Emplois du temps</h2>
          <Button variant="primary" onClick={() => setShowFilters(!showFilters)} className="ml-4">
            Filtres
          </Button>
        </div>
        {canCreate && (
          <Button
            variant="primary"
            onClick={() => openModal({
              title: "Créer un nouvel emploi du temps",
              content: <AddScheduleForm onSuccess={closeModal} />
            })}
          >
            + Créer
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4 items-end">
          {/* Filtre Formation */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-600 font-bold text-sm">Parcours</label>
            {!selectedFormationData ? (
              <SearchWithDropdown
                value={formationDropdown.value}
                onChange={formationDropdown.onChange}
                isOpen={formationDropdown.isOpen}
                close={formationDropdown.close}
                containerRef={formationDropdown.containerRef}
                options={formationOptionResults}
                loading={isFormationsFetching}
                onSelect={(f) => { setFormation(f.id); formationDropdown.close() }}
                renderOption={(option) => (
                  <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.code}</div>
                  </div>
                )}
                placeholder="Rechercher un parcours"
                inputClassName="w-[220px]"
              />
            ) : (
              <div className="flex items-center justify-between border h-[38px] w-[220px] rounded-md px-3 py-2 bg-white">
                <span className="text-sm truncate">{selectedFormationData?.text || selectedFormationData?.code}</span>
                <button
                  type="button"
                  onClick={() => setFormation("")}
                  className="text-xs text-red-500 hover:underline ml-2"
                >
                  Changer
                </button>
              </div>
            )}
          </div>

          {/* Filtre Semestre */}
          <div className="flex flex-col gap-1">
            <label className="text-slate-600 font-bold text-sm">Semestre</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="border rounded-md px-3 py-2 h-[38px] outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm w-[180px]"
            >
              <option value="">Tous</option>
              {semesters.map(s => (
                <option key={s.id} value={s.id}>{s.code || s.order}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="p-4">
        {isDataLoading ? (
          <div className="flex justify-center text-slate-500 text-sm items-center h-[200px]">
            Chargement...
          </div>
        ) : results.length !== 0 ? (
          <DataTable
            data={results}
            columns={columns}
            actions={actions}
            selectionMode={false}
          />
        ) : (
          <div className="flex justify-center text-slate-500 text-sm items-center h-[200px]">
            Aucun emploi du temps trouvé.
          </div>
        )}
      </div>
    </Card>
  )
}

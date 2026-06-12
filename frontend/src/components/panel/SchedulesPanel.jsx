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
import SearchableSelect from "../SearchableSelect"
import Badge from "../Badge"
import { ROLES } from "../../utils/constants"
import useDRFErrors from "../../hooks/useDRFError"

import { useSchedules } from "../../hooks/timetable/useSchedules"
import { useCreateSchedule } from "../../hooks/timetable/useCreateSchedule"
import { useDeleteSchedule } from "../../hooks/timetable/useDeleteSchedule"
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSemester } from "../../hooks/semesters/useSemester"
import { useQueryParams } from "../../hooks/useQueryParams"


function AddScheduleForm({ onSuccess }) {
  const [form, setForm] = useState({ formation: "", semester: "" })
  const create = useCreateSchedule()
  const { handleErrors, getError, clearErrors } = useDRFErrors()
  const [loading, setLoading] = useState(false)

  // ── Formation dropdown ──
  const fdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: formationsOptions, isFetching: isFormationsFetching } = useFormations(
    fdd.query ? { search: fdd.query } : {},
    fdd.query.length >= 1
  )
  const formationResults = formationsOptions?.results || formationsOptions || []

  // ── Semesters ──
  const sdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: semesterData, isFetching: isSemestersFetching } = useSemesters(
    sdd.query ? { search: sdd.query } : {},
    { enabled: sdd.enabled }
  )
  const semesters = semesterData?.results || semesterData || []

  const [selectedFormation, setSelectedFormation] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState(null)

  const handleSelectFormation = (f) => {
    setSelectedFormation(f)
    setForm(prev => ({ ...prev, formation: f.id }))
    fdd.close()
  }

  const handleSelectSemester = (s) => {
    setSelectedSemester(s)
    setForm(prev => ({ ...prev, semester: s.id }))
    sdd.close()
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
        <SearchableSelect
          label="Parcours (Formation)"
          selectedValue={selectedFormation}
          onSelect={handleSelectFormation}
          onClear={() => { setSelectedFormation(null); setForm(prev => ({ ...prev, formation: "" })) }}
          options={formationResults}
          renderOption={(option) => option.text || option.code}
          searchDropdownProps={fdd}
          loading={isFormationsFetching}
          placeholder="Rechercher un parcours"
          width="w-full"
        />
        {getError("formation") && <span className="text-xs text-red-500">{getError("formation")}</span>}
      </div>

      {/* Semestre */}
      <div className="flex flex-col gap-1">
        <SearchableSelect
          label="Semestre"
          selectedValue={selectedSemester}
          onSelect={handleSelectSemester}
          onClear={() => { setSelectedSemester(null); setForm(prev => ({ ...prev, semester: "" })) }}
          options={semesters}
          renderOption={(option) => option.code || option.order}
          searchDropdownProps={sdd}
          loading={isSemestersFetching}
          placeholder="Rechercher un semestre"
          width="w-full"
        />
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

export default function SchedulesPanel({ onDetailSchedule , onSelectedSchedule }) {
  const { role } = useAuth()
  const { openModal, closeModal } = useModal()

  const {
    formation_id, setFormation_id,
    semester_id, setSemester_id,
  } = useQueryParams({
    formation_id: { key: "formation_id", type: "number", default: "" },
    semester_id: { key: "semester_id", type: "number", default: "" },
  })

  const [showFilters, setShowFilters] = useState(false)

  // ── Filters Dropdowns ──
  const fdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: fOptions, isFetching: fFetching } = useFormations(
    fdd.query ? { search: fdd.query } : {},
    { enabled: fdd.enabled, staleTime: 0 }
  )
  const fOptionResults = fOptions?.results || fOptions || []
  const { data: formation } = useFormation(formation_id)

  const sdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: sOptions, isFetching: sFetching } = useSemesters(
    sdd.query ? { search: sdd.query } : {}, 
    { enabled: sdd.enabled }
  )
  const sOptionResults = sOptions?.results || sOptions || []
  const { data: semester } = useSemester(semester_id)

  const filters = useMemo(() => ({
    ...(formation_id && { formation: formation_id }),
    ...(semester_id && { semester: semester_id }),
  }), [formation_id, semester_id])

  const { data, isLoading: isDataLoading } = useSchedules(filters)
  const results = data?.results || data || []

  const canCreate = [ROLES.DEPARTMENT_HEAD].includes(role)

  const columns = [
    { header: "ID", key: "id", render: (id) => `#${id}` },
    { header: "Parcours", key: "formation", render: (f) => f?.text || f?.code || "—" },
    { header: "Semestre", key: "semester", render: (s) => s?.code || "—" },
    { header: "Créé le", key: "created_at", render: (date) => new Date(date).toLocaleDateString() },
  ]

  const actions = [
    {
      label: "Voir les créneaux",
      handler: (row) => onDetailSchedule(row),
      conditionGlobal: [ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY, ROLES.TEACHER].includes(role)
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({
        title: "Supprimer l'emploi du temps",
        content: <DeleteScheduleConfirm schedule={row} onSuccess={closeModal} />
      }),
      conditionGlobal: canCreate && [ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY].includes(role)
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
          <SearchableSelect
            label="Parcours"
            selectedValue={formation}
            onSelect={(f) => { setFormation_id(f.id); fdd.close() }}
            onClear={() => setFormation_id("")}
            options={fOptionResults}
            renderOption={(option) => (
              <div className="flex gap-x-2 items-center">
                <div>{option.text || option.code}</div>
                {option.code && <Badge content={option.code} color="blue" />}
              </div>
            )}
            searchDropdownProps={fdd}
            loading={fFetching}
            placeholder="Rechercher un parcours"
            width="w-[220px]"
          />

          <SearchableSelect
            label="Semestre"
            selectedValue={semester}
            onSelect={(s) => { setSemester_id(s.id); sdd.close() }}
            onClear={() => setSemester_id("")}
            options={sOptionResults}
            renderOption={(option) => (
              <div className="flex gap-x-2 items-center">
                <div>{option.code || option.order}</div>
                {option.code && <Badge content={option.code} color="blue" />}
              </div>
            )}
            searchDropdownProps={sdd}
            loading={sFetching}
            placeholder="Rechercher un semestre"
            width="w-[220px]"
          />
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
            selectionMode={"single"}
            onSelectionChange={onSelectedSchedule}
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

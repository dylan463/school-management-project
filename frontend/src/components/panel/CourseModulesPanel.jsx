import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo } from "react"
import useDebounced from '../../hooks/useDebounced'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import { useState, useEffect } from "react"
import useDRFErrors from "../../hooks/useDRFError"
import { toast } from 'react-toastify'
import { useCoursemodules } from "../../hooks/coursemodules/useCoursemodules"
import { useCreateCoursemodule } from "../../hooks/coursemodules/useCreateCoursemodule"
import { useUpdateCoursemodule } from "../../hooks/coursemodules/useUpdateCoursemodule"
import { useDeleteCoursemodule } from "../../hooks/coursemodules/useDeleteCoursemodule"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchWithDropdown from "../SearchWithDropdown"
import Badge from "../Badge"
import Filter from "../Filter"
import { useCourseunits } from "../../hooks/courseunits/useCourseunits"
import { useCourseunit } from "../../hooks/courseunits/useCourseunit"
import { useTeachers } from "../../hooks/teachers/useTeachers"
import { useTeacher } from "../../hooks/teachers/useTeacher"
import { useSemesters } from "../../hooks/semesters/useSemesters"

// ─── Add / Edit Form ────────────────────────────────────────────────────────

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id)

  const [form, setForm] = useState({
    code: initialData.code || "",
    text: initialData.text || "",
    credits: initialData.credits ?? "",
    min_val_score: initialData.min_val_score ?? "",
    volume_hours: initialData.volume_hours || "",
    semester: initialData.semester?.id || initialData.semester || "",
    teacher: initialData.teacher?.id || initialData.teacher || "",
    course_unit: initialData.course_unit?.id || initialData.course_unit || "",
  })

  const [selectedCourseUnit, setSelectedCourseUnit] = useState(
    initialData.course_unit && typeof initialData.course_unit === "object"
      ? initialData.course_unit
      : null
  )
  const [selectedTeacher, setSelectedTeacher] = useState(
    initialData.teacher && typeof initialData.teacher === "object"
      ? initialData.teacher
      : null
  )

  const create = useCreateCoursemodule()
  const update = useUpdateCoursemodule()
  const { handleErrors, getError, clearErrors } = useDRFErrors()
  const [loading, setLoading] = useState(false)

  // ── Course Unit search dropdown ──
  const cuDropdown = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: cuOptions, isFetching: isCuFetching } = useCourseunits(
    cuDropdown.query ? { search: cuDropdown.query } : null,
    !!cuDropdown.query,
    0
  )
  const cuResults = cuOptions?.results || []

  // ── Teacher search dropdown ──
  const teacherDropdown = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: teacherOptions, isFetching: isTeacherFetching } = useTeachers(
    teacherDropdown.query ? { search: teacherDropdown.query } : null
  )
  const teacherResults = teacherOptions?.results || []

  // ── Semesters (small list – load all) ──
  const { data: semesterData } = useSemesters({ no_pagination: true })
  const semesters = semesterData || []

  const handleChange = (e) => {
    clearErrors()
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSelectCourseUnit = (cu) => {
    setSelectedCourseUnit(cu)
    setForm(prev => ({ ...prev, course_unit: cu.id }))
    cuDropdown.close()
  }

  const handleSelectTeacher = (teacher) => {
    setSelectedTeacher(teacher)
    setForm(prev => ({ ...prev, teacher: teacher.id }))
    teacherDropdown.close()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.code || !form.text || !form.credits || !form.min_val_score || !form.course_unit || !form.semester) return
    setLoading(true)
    try {
      const data = {
        code: form.code,
        text: form.text,
        credits: Number(form.credits),
        min_val_score: Number(form.min_val_score),
        course_unit: form.course_unit,
        semester: form.semester,
        ...(form.teacher && { teacher: form.teacher }),
        ...(form.volume_hours && { volume_hours: Number(form.volume_hours) }),
      }

      if (isEdit) {
        await update.mutateAsync(
          { id: initialData.id, data },
          { onSuccess: () => onSuccess?.() }
        )
      } else {
        await create.mutateAsync(data, {
          onSuccess: () => {
            setForm({ code: "", text: "", credits: "", min_val_score: "", volume_hours: "", semester: "", teacher: "", course_unit: "" })
            setSelectedCourseUnit(null)
            setSelectedTeacher(null)
            onSuccess?.()
          },
        })
      }
    } catch (error) {
      handleErrors(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">

      {/* NOM */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Nom</label>
        <input
          name="text"
          type="text"
          value={form.text}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex : Algorithmique"
        />
        {getError("text") && <span className="text-xs text-red-500">{getError("text")}</span>}
      </div>

      {/* CODE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Code</label>
        <input
          name="code"
          type="text"
          value={form.code}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex : ALGO101"
        />
        {getError("code") && <span className="text-xs text-red-500">{getError("code")}</span>}
      </div>

      {/* CRÉDITS & NOTE MIN – côte à côte */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Crédits</label>
          <input
            name="credits"
            type="number"
            min="0"
            value={form.credits}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ex : 3"
          />
          {getError("credits") && <span className="text-xs text-red-500">{getError("credits")}</span>}
        </div>
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Note min. de validation</label>
          <input
            name="min_val_score"
            type="number"
            min="1"
            max="19"
            value={form.min_val_score}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ex : 10"
          />
          {getError("min_val_score") && <span className="text-xs text-red-500">{getError("min_val_score")}</span>}
        </div>
      </div>

      {/* SEMESTRE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Semestre</label>
        <select
          name="semester"
          value={form.semester}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500 bg-white"
        >
          <option value="">-- Choisir un semestre --</option>
          {semesters.map(s => (
            <option key={s.id} value={s.id}>{s.code}</option>
          ))}
        </select>
        {getError("semester") && <span className="text-xs text-red-500">{getError("semester")}</span>}
      </div>

      {/* UNITÉ D'ENSEIGNEMENT */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Unité d'enseignement</label>
        {!selectedCourseUnit ? (
          <SearchWithDropdown
            value={cuDropdown.value}
            onChange={cuDropdown.onChange}
            isOpen={cuDropdown.isOpen}
            close={cuDropdown.close}
            containerRef={cuDropdown.containerRef}
            options={cuResults}
            loading={isCuFetching}
            onSelect={handleSelectCourseUnit}
            renderOption={(option) => (
              <div className="flex gap-x-2 items-center">
                <div>{option.text}</div>
                <Badge content={option.code} color="blue" />
              </div>
            )}
            placeholder="Rechercher une UE"
            inputClassName="w-full"
          />
        ) : (
          <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-slate-50">
            <span className="text-sm">{selectedCourseUnit.text}</span>
            <button
              type="button"
              onClick={() => { setSelectedCourseUnit(null); setForm(prev => ({ ...prev, course_unit: "" })) }}
              className="text-xs text-red-500 hover:underline"
            >
              Changer
            </button>
          </div>
        )}
        {getError("course_unit") && <span className="text-xs text-red-500">{getError("course_unit")}</span>}
      </div>

      {/* ENSEIGNANT (optionnel) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">
          Enseignant <span className="text-slate-400 text-xs">(optionnel)</span>
        </label>
        {!selectedTeacher ? (
          <SearchWithDropdown
            value={teacherDropdown.value}
            onChange={teacherDropdown.onChange}
            isOpen={teacherDropdown.isOpen}
            close={teacherDropdown.close}
            containerRef={teacherDropdown.containerRef}
            options={teacherResults}
            loading={isTeacherFetching}
            onSelect={handleSelectTeacher}
            renderOption={(option) => (
              <div className="flex gap-x-2 items-center">
                <div>{option.user?.full_name || option.full_name || `${option.first_name} ${option.last_name}`}</div>
              </div>
            )}
            placeholder="Rechercher un enseignant"
            inputClassName="w-full"
          />
        ) : (
          <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-slate-50">
            <span className="text-sm">
              {selectedTeacher.user?.full_name || selectedTeacher.full_name || `${selectedTeacher.first_name} ${selectedTeacher.last_name}`}
            </span>
            <button
              type="button"
              onClick={() => { setSelectedTeacher(null); setForm(prev => ({ ...prev, teacher: "" })) }}
              className="text-xs text-red-500 hover:underline"
            >
              Changer
            </button>
          </div>
        )}
        {getError("teacher") && <span className="text-xs text-red-500">{getError("teacher")}</span>}
      </div>

      {/* VOLUME HORAIRE (optionnel) */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">
          Volume horaire <span className="text-slate-400 text-xs">(optionnel)</span>
        </label>
        <input
          name="volume_hours"
          type="number"
          min="0"
          value={form.volume_hours}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex : 45"
        />
        {getError("volume_hours") && <span className="text-xs text-red-500">{getError("volume_hours")}</span>}
      </div>

      {/* ERREURS GLOBALES */}
      {getError("non_field_errors") && (
        <div className="text-sm text-red-500">{getError("non_field_errors")}</div>
      )}
      {getError("detail") && (
        <div className="text-sm text-red-500">{getError("detail")}</div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
        </Button>
      </div>
    </form>
  )
}

// ─── Delete Confirm ──────────────────────────────────────────────────────────

function DeleteConfirm({ Data, onSuccess }) {
  const destroy = useDeleteCoursemodule()
  const [loading, setLoading] = useState(false)
  const { handleErrors, getError } = useDRFErrors()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await destroy.mutateAsync(Data.id)
    } catch (error) {
      handleErrors(error)
      const msg = getError("detail") || "Une erreur est survenue"
      toast.error(msg)
    } finally {
      setLoading(false)
      onSuccess?.()
    }
  }

  return (
    <div className="p-3">
      <p>Voulez-vous supprimer le module <strong>{Data.text}</strong> ({Data.code}) ?</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleConfirm} disabled={loading}>
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  )
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export default function CourseModulesPanel() {
  const { openModal, closeModal } = useModal()

  const {
    search, setSearch,
    page, setPage,
    courseunit, setCourseunit,
    semester, setSemester,
    status, setStatus,
  } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    courseunit: { key: "courseunit", type: "string", default: "" },
    semester: { key: "semester", type: "string", default: "" },
    status: { key: "status", type: "string", default: "" },
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get("page")) setPage(1)
  }, [])

  const [showFilters, setShowFilters] = useState(false)
  const debouncedSearch = useDebounced(search)

  // ── Filtre : UE search dropdown ──
  const cuDropdown = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: cuOptions, isFetching: isCuFetching } = useCourseunits(
    cuDropdown.query ? { search: cuDropdown.query } : null,
    cuDropdown.query.length >= 1,
    0
  )
  const cuOptionResults = cuOptions?.results || []
  const { data: selectedCuData } = useCourseunit(courseunit)

  // ── Semestres (pour filtre) ──
  const { data: semesterData } = useSemesters()
  const semesters = semesterData?.results || []

  const filters = useMemo(() => ({
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(courseunit && { course_unit: courseunit }),
    ...(semester && { semester }),
    ...(page && { page }),
    ...(status && { is_active: status }),
  }), [debouncedSearch, page, courseunit, semester, status])

  const { data, isLoading: isDataLoading } = useCoursemodules(filters)
  const results = data?.results || []
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / PAGINATION_SIZE))

  const columns = [
    { header: "UE", key: "course_unit", render: (v) => v.text || "" },
    { header: "Code", key: "code" },
    { header: "Nom", key: "text" },
    { header: "Semestre", key: "semester", render: (v) => v.code || "" },
    { header: "Crédits", key: "credits" },
    { header: "Note min.", key: "min_val_score" },
    { header: "Vol. h.", key: "volume_hours", render: (v) => v ?? "—" },
    { header: "Enseignant", key: "teacher", render: (v) => v ? (v.username || `${v.first_name} ${v.last_name}`) : "—" },
    {
      header: "Statut", key: "is_active",
      render: (v) => v
        ? <Badge content="Actif" color="green" />
        : <Badge content="Inactif" color="red" />
    },
  ]

  const actions = [
    {
      label: "Modifier",
      handler: (row) => openModal({
        title: "Modifier le module",
        content: <AddOrEditForm initialData={row} onSuccess={closeModal} />,
      }),
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({
        title: `Supprimer ${row.text}`,
        content: <DeleteConfirm Data={row} onSuccess={closeModal} />,
      }),
    },
  ]

  return (
    <Card>
      {/* ── Barre supérieure ── */}
      <div className="px-2 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>
            Filtres
          </Button>
        </div>
        <SearchInput
          placeholder="Rechercher un module"
          className="w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="primary"
          onClick={() => openModal({
            title: "Ajouter un module",
            content: <AddOrEditForm onSuccess={closeModal} />,
          })}
        >
          + Ajouter
        </Button>
      </div>

      {/* ── Filtres ── */}
      {showFilters && (
        <div className="ml-2 mb-2">
          <div className="flex flex-wrap gap-3 border-b pb-2 mb-2 border-slate-200 items-end">

            {/* Filtre UE */}
            <div>
              <label className="text-slate-600 font-bold block text-sm mb-1">Unité d'enseignement</label>
              {!selectedCuData ? (
                <SearchWithDropdown
                  value={cuDropdown.value}
                  onChange={cuDropdown.onChange}
                  isOpen={cuDropdown.isOpen}
                  close={cuDropdown.close}
                  containerRef={cuDropdown.containerRef}
                  options={cuOptionResults}
                  loading={isCuFetching}
                  onSelect={(cu) => { setCourseunit(cu.id); cuDropdown.close() }}
                  renderOption={(option) => (
                    <div className="flex gap-x-2 items-center">
                      <div>{option.text}</div>
                      <Badge content={option.code} color="blue" />
                    </div>
                  )}
                  placeholder="Rechercher une UE"
                  inputClassName="w-[200px]"
                />
              ) : (
                <div className="flex items-center justify-between border h-[35px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm">{selectedCuData?.text}</span>
                  <button
                    type="button"
                    onClick={() => setCourseunit(null)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Changer
                  </button>
                </div>
              )}
            </div>

            {/* Filtre Semestre */}
            <div>
              <label className="text-slate-600 font-bold block text-sm mb-1">Semestre</label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="border rounded-md px-3 py-2 h-[35px] outline-none focus:ring-2 focus:ring-red-500 bg-white text-sm w-[160px]"
              >
                <option value="">Tous</option>
                {semesters.map(s => (
                  <option key={s.id} value={s.id}>{s.code}</option>
                ))}
              </select>
            </div>

            {/* Filtre Statut */}
            <Filter
              value={status}
              label="Statut"
              onChange={(e) => setStatus(e.target.value)}
              otherOptions={[
                { key: "Tous", value: "" },
                { key: "Actif", value: "true" },
                { key: "Inactif", value: "false" },
              ]}
              className="w-[160px]"
            />
          </div>
        </div>
      )}

      {/* ── Tableau ── */}
      {isDataLoading ? (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
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
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Aucun résultat
        </div>
      )}

      <Paginator totalPages={totalPages} page={page} setPage={setPage} />
    </Card>
  )
}

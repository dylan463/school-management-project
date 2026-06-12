import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo, useState, useEffect } from "react"
import useDebounced from '../../hooks/useDebounced'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import Badge from "../Badge"
import Filter from "../Filter"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useResults } from "../../hooks/results/useResults"
import { useSearchDropdown } from "../../hooks/useSearchDropdown"

// Formations
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"

// SchoolYears
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useSchoolyear } from "../../hooks/schoolyears/useSchoolyear"

// Semesters
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSemester } from "../../hooks/semesters/useSemester"

// CourseModules
import { useCoursemodules } from "../../hooks/coursemodules/useCoursemodules"
import { useCoursemodule } from "../../hooks/coursemodules/useCoursemodule"

import SearchableSelect from "../SearchableSelect"

export default function ResultsPanel() {
  const {
    search, page, setSearch, setPage,
    formation_id, setFormation_id,
    status, setStatus,
    school_year_id, setSchool_year_id,
    semester_id, setSemester_id,
    course_module_id, setCourse_module_id
  } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    formation_id: { key: "formation_id", type: "number", default: "" },
    status: { key: "status", type: "string", default: "" },
    school_year_id: { key: "school_year_id", type: "number", default: "" },
    semester_id: { key: "semester_id", type: "number", default: "" },
    course_module_id: { key: "course_module", type: "string", default: "" },
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get("page")) {
      setPage(1)
    }
  }, [])

  const [showFilters, setShowFilters] = useState(false)
  const debouncedSearch = useDebounced(search)

  // SearchDropdown hooks
  const fdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const sydd = useSearchDropdown({ delay: 300, minChars: 1 })
  const sdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const cmdd = useSearchDropdown({ delay: 300, minChars: 1 })

  // Data hooks
  const { data: fOptions, isFetching: fFetching } = useFormations(fdd.query ? { search: fdd.query } : {}, { enabled: fdd.enabled })
  const fOptionResults = fOptions?.results || []
  const { data: formation } = useFormation(formation_id)

  const { data: syOptions, isFetching: syFetching } = useSchoolyears(sydd.query ? { search: sydd.query } : {}, { enabled: sydd.enabled })
  const syOptionResults = syOptions?.results || []
  const { data: school_year } = useSchoolyear(school_year_id)

  const { data: sOptions, isFetching: sFetching } = useSemesters(sdd.query ? { search: sdd.query } : {}, { enabled: sdd.enabled })
  const sOptionResults = sOptions?.results || []
  const { data: semester } = useSemester(semester_id)

  const { data: cmOptions, isFetching: cmFetching } = useCoursemodules(cmdd.query ? { search: cmdd.query } : {}, { enabled: cmdd.enabled })
  const cmOptionResults = cmOptions?.results || []
  const { data: course_module } = useCoursemodule(course_module_id)

  // Select Handlers
  const handleSelectFormation = (f) => {
    setFormation_id(f.id)
    fdd.close()
  }

  const handleSelectSchoolYear = (sy) => {
    setSchool_year_id(sy.id)
    sydd.close()
  }

  const handleSelectSemester = (s) => {
    setSemester_id(s.id)
    sdd.close()
  }

  const handleSelectCourse = (c) => {
    setCourse_module_id(c.id)
    cmdd.close()
  }

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation_id && { formation: formation_id }),
      ...(school_year_id && { school_year: school_year_id }),
      ...(semester_id && { semester: semester_id }),
      ...(course_module_id && { course_module: course_module_id }),
      ...(page && { page }),
      ...(status && { status: status })
    }
  }, [debouncedSearch, page, formation_id, school_year_id, semester_id, course_module_id, status])

  const { data, isLoading: isDataLoading } = useResults(filters)
  const results = data?.results || []
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  )

  const columns = [
    { header: "Etudiant", key: "full_name" },
    { header: "Parcours", key: "formation" },
    { header: "Semestre", key: "semester" },
    { header: "Unité", key: "course_unit" },
    { header: "Module", key: "course_module" },
    { header: "Crédits", key: "course_credit" },
    { header: "Note Finale", key: "final_score" },
    {
      header: "Statut", key: "status", render: (value) => {
        if (value === "VALIDATED") return <Badge content="Validé" color="green" />
        if (value === "VALIDATEDA_AFTER_RETAKE" || value === "VALIDATED_AFTER_RETAKE") return <Badge content="Rattrapage" color="yellow" />
        if (value === "NOT_VALIDATED") return <Badge content="Non validé" color="red" />
        return <Badge content={value || "Inconnu"} color="gray" />
      }
    }
  ]

  return (
    <Card>
      <div className="px-2 py-2 flex justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => { setShowFilters(!showFilters) }}
          >
            Filtres
          </Button>
        </div>
        <SearchInput
          placeholder="Rechercher..."
          className="w-[200px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
        ></SearchInput>
        <div></div> {/* Dummy div to keep alignment if Add button is omitted */}
      </div>

      {showFilters && (
        <div className="ml-2 mb-2">
          <div className="flex flex-wrap gap-4 border-b pb-4 mb-2 border-slate-200">
            <SearchableSelect
              label="Parcours"
              selectedValue={formation}
              onSelect={handleSelectFormation}
              onClear={() => setFormation_id("")}
              options={fOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.name}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={fdd}
              loading={fFetching}
              placeholder="Rechercher un parcours"
              width="w-[200px]"
            />

            <SearchableSelect
              label="Année scolaire"
              selectedValue={school_year}
              onSelect={handleSelectSchoolYear}
              onClear={() => setSchool_year_id("")}
              options={syOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.label || option.name}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={sydd}
              loading={syFetching}
              placeholder="Rechercher une année"
              width="w-[200px]"
            />

            <SearchableSelect
              label="Semestre"
              selectedValue={semester}
              onSelect={handleSelectSemester}
              onClear={() => setSemester_id("")}
              options={sOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.code}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={sdd}
              loading={sFetching}
              placeholder="Rechercher un semestre"
              width="w-[200px]"
            />

            <SearchableSelect
              label="Cours"
              selectedValue={course_module}
              onSelect={handleSelectCourse}
              onClear={() => setCourse_module_id("")}
              options={cmOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.name}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              renderSelected={(selected) => selected?.text || selected?.name}
              searchDropdownProps={cmdd}
              loading={cmFetching}
              placeholder="Rechercher..."
              width="w-[200px]"
            />

            {/* Status */}
            <div>
              <label className="text-slate-600 text-sm font-bold block mb-1">Statut</label>
              <Filter
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                otherOptions={[
                  { key: "Tous", value: "" },
                  { key: "Validé", value: "VALIDATED" },
                  { key: "Non Validé", value: "NOT_VALIDATED" },
                  { key: "Rattrapage", value: "VALIDATED_AFTER_RETAKE" }
                ]}
                className="w-[200px] h-[38px]"
              />
            </div>
          </div>
        </div>
      )}

      {isDataLoading ? (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Chargement...
        </div>
      ) : results.length !== 0 ? (
        <DataTable
          data={results}
          columns={columns}
          selectionMode={false}
        />
      ) : (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Aucun résultat
        </div>
      )}

      <Paginator
        totalPages={totalPages}
        page={page}
        setPage={setPage}
      />
    </Card>
  )
}

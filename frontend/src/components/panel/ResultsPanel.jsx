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

import SearchWithDropdown from "../SearchWithDropdown"

export default function ResultsPanel() {
  const {
    search, page, setSearch, setPage,
    formation, setFormation,
    status, setStatus,
    school_year, setSchool_year: setSchoolYear,
    semester, setSemester,
    course, setCourse
  } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    formation: { key: "formation", type: "string", default: "" },
    status: { key: "status", type: "string", default: "" },
    school_year: { key: "school_year", type: "string", default: "" },
    semester: { key: "semester", type: "string", default: "" },
    course: { key: "course_module", type: "string", default: "" },
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
  const { value: formationValue, query: formationQuery, onChange: formationOnChange, isOpen: formationIsOpen, close: formationClose, containerRef: formationContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 })
  const { value: syValue, query: syQuery, onChange: syOnChange, isOpen: syIsOpen, close: syClose, containerRef: syContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 })
  const { value: semValue, query: semQuery, onChange: semOnChange, isOpen: semIsOpen, close: semClose, containerRef: semContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 })
  const { value: courseValue, query: courseQuery, onChange: courseOnChange, isOpen: courseIsOpen, close: courseClose, containerRef: courseContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 })

  // Data hooks
  const { data: formationOptions, isFetching: isFormationFetching } = useFormations(formationQuery ? { search: formationQuery } : null, formationQuery.length >= 1, 0)
  const formationOptionResults = formationOptions?.results || []
  const { data: formationData } = useFormation(formation)

  const { data: syOptions, isFetching: isSyFetching } = useSchoolyears(syQuery ? { search: syQuery } : null, syQuery.length >= 1, 0)
  const syOptionResults = syOptions?.results || []
  const { data: syData } = useSchoolyear(school_year)

  const { data: semOptions, isFetching: isSemFetching } = useSemesters(semQuery ? { search: semQuery } : null, semQuery.length >= 1, 0)
  const semOptionResults = semOptions?.results || []
  const { data: semData } = useSemester(semester)

  const { data: courseOptions, isFetching: isCourseFetching } = useCoursemodules(courseQuery ? { search: courseQuery } : null, courseQuery.length >= 1, 0)
  const courseOptionResults = courseOptions?.results || []
  const { data: courseData } = useCoursemodule(course)

  // Select Handlers
  const handleSelectFormation = (selectedFormation) => {
    setFormation(selectedFormation.id)
    formationClose()
  }

  const handleSelectSchoolYear = (selectedSy) => {
    setSchoolYear(selectedSy.id)
    syClose()
  }

  const handleSelectSemester = (selectedSem) => {
    setSemester(selectedSem.id)
    semClose()
  }

  const handleSelectCourse = (selectedCourse) => {
    setCourse(selectedCourse.id)
    courseClose()
  }

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation && { formation: formation }),
      ...(school_year && { school_year: school_year }),
      ...(semester && { semester: semester }),
      ...(course && { course_module: course }),
      ...(page && { page }),
      ...(status && { status: status })
    }
  }, [debouncedSearch, page, formation, school_year, semester, course, status])

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
      header: "Status", key: "status", render: (value) => {
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
            {/* Formation */}
            {!formationData ? (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Parcours</label>
                <SearchWithDropdown
                  value={formationValue}
                  onChange={formationOnChange}
                  isOpen={formationIsOpen}
                  close={formationClose}
                  containerRef={formationContainerRef}
                  options={formationOptionResults}
                  loading={isFormationFetching}
                  onSelect={handleSelectFormation}
                  renderOption={(option) => <div className="flex gap-x-2 items-center">
                    <div>{option.text}</div>
                    <Badge content={option.code} color="blue" />
                  </div>}
                  placeholder="Rechercher..."
                  inputClassName="w-[200px]"
                />
              </div>
            ) : (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Parcours</label>
                <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm truncate">{formationData?.text}</span>
                  <button
                    type="button"
                    onClick={() => setFormation(null)}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}

            {/* SchoolYear */}
            {!syData ? (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Année Scolaire</label>
                <SearchWithDropdown
                  value={syValue}
                  onChange={syOnChange}
                  isOpen={syIsOpen}
                  close={syClose}
                  containerRef={syContainerRef}
                  options={syOptionResults}
                  loading={isSyFetching}
                  onSelect={handleSelectSchoolYear}
                  renderOption={(option) => <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.label || option.name}</div>
                  </div>}
                  placeholder="Rechercher..."
                  inputClassName="w-[200px]"
                />
              </div>
            ) : (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Année Scolaire</label>
                <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm truncate">{syData?.text || syData?.label || syData?.name}</span>
                  <button
                    type="button"
                    onClick={() => setSchoolYear(null)}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}

            {/* Semester */}
            {!semData ? (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Semestre</label>
                <SearchWithDropdown
                  value={semValue}
                  onChange={semOnChange}
                  isOpen={semIsOpen}
                  close={semClose}
                  containerRef={semContainerRef}
                  options={semOptionResults}
                  loading={isSemFetching}
                  onSelect={handleSelectSemester}
                  renderOption={(option) => <div className="flex gap-x-2 items-center">
                    <div>{option.code || option.text}</div>
                  </div>}
                  placeholder="Rechercher..."
                  inputClassName="w-[200px]"
                />
              </div>
            ) : (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Semestre</label>
                <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm truncate">{semData?.code || semData?.text}</span>
                  <button
                    type="button"
                    onClick={() => setSemester(null)}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}

            {/* Course Module */}
            {!courseData ? (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Cours</label>
                <SearchWithDropdown
                  value={courseValue}
                  onChange={courseOnChange}
                  isOpen={courseIsOpen}
                  close={courseClose}
                  containerRef={courseContainerRef}
                  options={courseOptionResults}
                  loading={isCourseFetching}
                  onSelect={handleSelectCourse}
                  renderOption={(option) => <div className="flex gap-x-2 items-center">
                    <div>{option.text || option.name}</div>
                    {option.code && <Badge content={option.code} color="blue" />}
                  </div>}
                  placeholder="Rechercher..."
                  inputClassName="w-[200px]"
                />
              </div>
            ) : (
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Cours</label>
                <div className="flex items-center justify-between border h-[38px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm truncate">{courseData?.text || courseData?.name}</span>
                  <button
                    type="button"
                    onClick={() => setCourse(null)}
                    className="text-xs text-red-500 hover:underline ml-2"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}

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

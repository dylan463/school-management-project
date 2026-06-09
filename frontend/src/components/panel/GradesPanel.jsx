import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Card from "../ui/Card"
import Button from "../ui/Button"
import SearchInput from "../SearchInput"
import DataTable from '../DataTable'
import useDebounced from '../../hooks/useDebounced'
import Badge from "../Badge"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useAssessmentAttendants } from "../../hooks/assessments/useAssessmentAttendants"
import { useCreateGrade } from "../../hooks/grades/useCreateGrade"
import { useUpdateGrade } from "../../hooks/grades/useUpdateGrade"
import { useGrades } from "../../hooks/grades/useGrades"
import { toast } from 'react-toastify'
import useDRFErrors from "../../hooks/useDRFError"
import { useAuth } from "../../context/AuthContext"
import { ROLES } from "../../utils/constants"

export default function GradesPanel({ assessmentId }) {
  const navigate = useNavigate()
  const { role } = useAuth()
  const { search, setSearch } = useQueryParams({
    search: { key: "student", type: "string", default: "" },
  })

  const debouncedSearch = useDebounced(search)
  const { data, isLoading } = useGrades({search: debouncedSearch,no_pagination:true, assessment: assessmentId})
  const results = data || []

  const columns = [
    { header: "Étudiant", key: "student" },
    {
      header: "Note", key: "score",
      render: (val) => val ? <Badge content={val} color="blue" /> : <Badge content="Aucune" color="slate" />
    },
    {
      header: "Année", key: "school_year",
      render: (val) => <Badge content={val} color="blue" />
    }
  ]

  return (
    <Card>
      <div className="px-2 py-4 flex items-center justify-between border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-slate-700 self-center pl-2">Notes</h3>
        </div>
        <SearchInput
          placeholder="Rechercher un étudiant..."
          className="w-[250px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Chargement...
        </div>
      ) : results.length > 0 ? (
        <DataTable
          data={results}
          columns={columns}
          selectionMode={false}
        />
      ) : (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Aucun étudiant trouvé pour cet examen.
        </div>
      )}
    </Card>
  )
}

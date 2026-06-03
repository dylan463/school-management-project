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
import { toast } from 'react-toastify'
import useDRFErrors from "../../hooks/useDRFError"

function GradeInput({ row, assessmentId }) {
  const [score, setScore] = useState(row.grade ? row.grade.score : "")
  const [isFocused, setIsFocused] = useState(false)
  
  const create = useCreateGrade()
  const update = useUpdateGrade()
  const { handleErrors } = useDRFErrors()

  useEffect(() => {
    if (!isFocused) {
      setScore(row.grade ? row.grade.score : "")
    }
  }, [row.grade, isFocused])

  const handleBlur = async () => {
    setIsFocused(false)
    const newScore = parseFloat(score)
    const oldScore = row.grade ? row.grade.score : null

    if (isNaN(newScore)) {
      setScore(oldScore || "")
      return
    }

    if (newScore === oldScore) {
      return
    }

    if (newScore < 0 || newScore > 20) {
      toast.error("La note doit être comprise entre 0 et 20")
      setScore(oldScore || "")
      return
    }

    try {
      if (row.grade && row.grade.id) {
        await update.mutateAsync({ id: row.grade.id, data: { score: newScore } })
      } else {
        await create.mutateAsync({ assessment: assessmentId, enrollment: row.id, score: newScore })
      }
      toast.success("Note enregistrée")
    } catch (e) {
      handleErrors(e)
      toast.error("Erreur lors de l'enregistrement de la note")
      setScore(oldScore || "")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.target.blur()
    }
  }

  return (
    <input
      type="number"
      step="0.01"
      min="0"
      max="20"
      value={score}
      onFocus={() => setIsFocused(true)}
      onChange={(e) => setScore(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`border rounded-md px-2 py-1 w-24 text-center outline-none focus:ring-2 ${
        create.isPending || update.isPending ? "opacity-50" : "focus:ring-blue-500"
      }`}
      disabled={create.isPending || update.isPending}
    />
  )
}

export default function GradesPanel({ assessmentId }) {
  const navigate = useNavigate()
  const { search, setSearch } = useQueryParams({
    search: { key: "student", type: "string", default: "" },
  })

  const debouncedSearch = useDebounced(search)
  const { data, isLoading } = useAssessmentAttendants({ id: assessmentId, search: debouncedSearch })
  const results = data || []

  const columns = [
    { header: "Étudiant", key: "student_name" },
    {
      header: "Note", key: "grade",
      render: (val, row) => <GradeInput row={row} assessmentId={assessmentId} />
    },
    {
      header: "Dette", key: "debt",
      render: (val) => val && val.text ? <Badge content={`Dette (${val.text})`} color="red" /> : <Badge content="Aucune" color="green" />
    }
  ]

  return (
    <Card>
      <div className="px-2 py-4 flex items-center justify-between border-b border-slate-100 gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/examens")}>Retour</Button>
          <h3 className="font-semibold text-slate-700 self-center pl-2">Saisie des notes</h3>
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

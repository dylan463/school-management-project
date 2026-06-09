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
import { useUpdateGrade } from "../../hooks/grades/useUpdateGrade"
import { useGrades } from "../../hooks/grades/useGrades"
import { toast } from 'react-toastify'
import useDRFErrors from "../../hooks/useDRFError"
import { useAuth } from "../../context/AuthContext"
import { ROLES } from "../../utils/constants"
import { useModal } from "../../context/ModalContext"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    score: "",
  });

  const update = useUpdateGrade();

  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        score: initialData.score || "",
      });
    }
  }, [initialData?.id,initialData?.score]);

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      score: form.score,
    }
    if (form.score === "") {data.score = null}

    setLoading(true);
    try {
      if (isEdit) {
        await update.mutateAsync(
          { id: initialData.id, data },
          { onSuccess: () => onSuccess?.() }
        );
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">
      <p className="text-xs text-slate-500">Veillez donner une note a cette éléve.</p>

      {/* score */}
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-sm text-slate-600">Note</label>
        <input
          type="number"
          name="score"
          value={form.score}
          onChange={handleChange}
          placeholder="Ex : 1"
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
        />
        {getError("score") && (
          <span className="text-xs text-red-500">{getError("score")}</span>
        )}
      </div>

      {/* GLOBAL ERROR */}
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
  );
}

export default function GradesPanel({ assessmentId }) {
  const { role } = useAuth()
  const {openModal, closeModal} = useModal()
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

  const handleGiveScore = (grade) => {
    openModal({title:`Donner une note à ${grade.student}`,content:<AddOrEditForm initialData={grade} onSuccess={closeModal}/>})
  }
  
  const canGive = [ROLES.DEPARTMENT_HEAD,ROLES.DEPARTMENT_SECRETARY,ROLES.TEACHER].includes(role)
  const actions = [
    {
      label: "Donner un note",
      handler: handleGiveScore,
      conditionGlobal: canGive
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
          actions={actions}
        />
      ) : (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Aucun étudiant trouvé pour cet examen.
        </div>
      )}
    </Card>
  )
}

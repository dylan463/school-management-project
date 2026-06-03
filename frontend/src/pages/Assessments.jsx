import { useSearchParams, useNavigate } from "react-router-dom"
import AssessmentsPanel from "../components/panel/AssessmentsPanel"
import GradesPanel from "../components/panel/GradesPanel"
import Button from "../components/ui/Button"

const Assessments = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const assessmentId = searchParams.get("assessment")

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">
              {assessmentId ? "Notes de l'examen" : "Examens"}
            </h2>
            {assessmentId && (
              <Button variant="outline" onClick={() => navigate("/examens")}>
                Retour aux examens
              </Button>
            )}
          </div>
          <p className="text-sm text-slate-500">
            {assessmentId 
              ? "Saisissez et modifiez les notes pour cet examen." 
              : "Gérez les examens, évaluations et rattrapages."}
          </p>
        </div>
        {assessmentId ? <GradesPanel assessmentId={assessmentId} /> : <AssessmentsPanel />}
      </section>
    </div>
  )
}

export default Assessments

import { useSearchParams, useNavigate } from "react-router-dom"
import AssessmentsPanel from "../components/panel/AssessmentsPanel"
import GradesPanel from "../components/panel/GradesPanel"
import Button from "../components/ui/Button"
import { useSchoolyears } from "../hooks/schoolyears/useSchoolyears"
import Card from "../components/ui/Card"

const Assessments = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const assessmentId = searchParams.get("assessment")

  const { data: activeSys } = useSchoolyears({status: "ACTIVE"})
  const activeSy = activeSys?.results?.[0] || null
  console.log(activeSy)

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <Card className="flex justify-center items-center h-[40px]">
        {activeSy === null ? "Aucune année scolaire active. Veuillez en créer une pour gérer les examens." : `Année scolaire active : ${activeSy.text}`}
      </Card>
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

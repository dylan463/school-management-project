import HistoryPanel from "../components/panel/HistoryPanel"
import HistoryResultPanel from "../components/panel/HistoryResultPanel"
import { useQueryParams } from "../hooks/useQueryParams"
import HistoryGradeGridPanel from "../components/panel/HistoryGradeGridPanel"
import { useAuth } from "../context/AuthContext"
import { ROLES, ROUTES } from "../utils/constants"


const History = () => {
  const {enrollment, setEnrollment } = useQueryParams({
    enrollment: { key: "enrollment", type: "string", default: "" },
  });
  const {role} =  useAuth()
  const canSeeGrid = [ROLES.DEPARTMENT_HEAD,ROLES.DEPARTMENT_SECRETARY,ROLES.REGISTRAR_OFFICER].includes(role)
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Historiques
          </h2>
          <p className="text-sm text-slate-500">
            Voir l'historique des inscriptions au sein de la mention.
          </p>
        </div>
        <HistoryPanel enrollment={enrollment} setEnrollment={setEnrollment}/>
        {canSeeGrid && <HistoryGradeGridPanel/>}
      </section>
      <HistoryResultPanel enrollment={enrollment} setEnrollment={setEnrollment}/>
    </div>
  )
}

export default History

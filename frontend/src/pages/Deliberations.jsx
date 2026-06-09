import DeliberationResultPanel from "../components/panel/DeliberationResultPanel"
import DeliberationPanel from "../components/panel/DeliberationPanel"
import { useQueryParams } from "../hooks/useQueryParams"

const Deliberations = () => {
  const { enrollment, setEnrollment } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    enrollment: {key:"enrollment", type:"number", default: ""}
  });



  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Délibérations
          </h2>
          <p className="text-sm text-slate-500">
            Gérer les délibérations des étudiants.
          </p>
        </div>
        <DeliberationPanel enrollment={enrollment} setEnrollment={setEnrollment}/>
      </section>
      <DeliberationResultPanel enrollment={enrollment} setEnrollment={setEnrollment}/>
    </div>
  )
}

export default Deliberations

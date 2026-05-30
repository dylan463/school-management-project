import SemesterPanel from "../components/panel/SemesterPanel"

const Semesters = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Semestres
          </h2>
          <p className="text-sm text-slate-500">
            Créez, modifiez et consultez les semestres au sein de votre mention.
          </p>
        </div>
        <SemesterPanel />
      </section>
    </div>
  )
}

export default Semesters

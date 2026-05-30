import FormationPanel from "../components/panel/FormationPanel"


const Formations = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Parcours
          </h2>
          <p className="text-sm text-slate-500">
            Créez, modifiez et consultez les parcours existantes.
          </p>
        </div>
        <FormationPanel />
      </section>
    </div>
  )
}

export default Formations

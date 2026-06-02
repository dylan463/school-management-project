import OfficiersPanel from "../components/panel/OfficersPanel";


const Officers = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Gestion des Officier de Scolarité
          </h2>
          <p className="text-sm text-slate-500">
           Consultez, ajoutez, modifiez ou supprimez des comptes des officiers de scolarité.
          </p>
        </div>
        <OfficiersPanel />
      </section>
    </div>
  )
}

export default Officers

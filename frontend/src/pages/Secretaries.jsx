import SecretariesPanel from "../components/panel/SecretariesPanel"

const Secretaries = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Gestion des secrétaires
          </h2>
          <p className="text-sm text-slate-500">
           Consultez, ajoutez, modifiez ou supprimez des comptes des secrétaires.
          </p>
        </div>
        <SecretariesPanel />
      </section>
    </div>
  )
}

export default Secretaries

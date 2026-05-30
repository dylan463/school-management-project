import MentionPanel from "../components/panel/MentionPanel"
import HeadsPanel from "../components/panel/HeadsPanel"

const MentionsAndHeads = () => {
  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">
          Gestion des mentions
        </h1>
        <p className="mt-2 text-slate-500">
          Gérez les mentions et attribuez les chefs de département.
        </p>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Mentions
          </h2>
          <p className="text-sm text-slate-500">
            Créez, modifiez et consultez les mentions existantes.
          </p>
        </div>

        <MentionPanel />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Chefs de département
          </h2>
          <p className="text-sm text-slate-500">
            Associez un responsable à chaque mention.
          </p>
        </div>

        <HeadsPanel />
      </section>
    </div>
  );
};

export default MentionsAndHeads

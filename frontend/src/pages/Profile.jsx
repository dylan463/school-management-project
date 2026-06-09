import { useState } from "react";
import { useMe } from '../hooks/auth/useMe'
import { useUpdateMe } from '../hooks/auth/useUpdateMe'
import { useChangePassword } from "../hooks/auth/useChangePassword";
import { toast } from "react-toastify";
import useDRFErrors from "../hooks/useDRFError";
import { useModal } from "../context/ModalContext";
import Button from "../components/ui/Button";

const IconUser = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const IconShield = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconCamera = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconRefreshKey = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

function ChangePasswordForm({onSuccess}) {
  const [form, setForm] = useState({
    old_password: "",
    new_password1: "",
    new_password2: "",
  });
  const [seePass,setSeePass] = useState(false)

  const change = useChangePassword();

  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try{
      await change.mutateAsync(form)
      onSuccess?.()
      toast.success("mot de passe modifié")
    } catch (error){
      handleErrors(error)
    } finally{
      setLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Ancien mot de passe</label>
        <div className="space-x-2 flex">
          <input
            name="old_password"
            type={seePass?"text":"password"}
            value={form.old_password}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 w-full h-[35px] outline-none focus:ring-2 focus:ring-red-500"
          />
          <Button variant={seePass ? "secondary" : "primary"} onClick={()=> setSeePass((value) => !value)}>
            Voir
          </Button>
        </div>
        {getError("old_password") && (
          <span className="text-xs text-red-500">{getError("old_password")}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Nouveau mot de passe</label>
        <input
          name="new_password1"
          type="password"
          value={form.new_password1}
          onChange={handleChange}
          className="border rounded-md px-3 h-[35px] py-2 outline-none focus:ring-2 focus:ring-red-500"
        />
        {getError("new_password1") && (
          <span className="text-xs text-red-500">{getError("new_password1")}</span>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Confirmer le mot de passe</label>
        <input
          name="new_password2"
          type="password"
          value={form.new_password2}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 h-[35px] outline-none focus:ring-2 focus:ring-red-500"
        />
        {getError("new_password2") && (
          <span className="text-xs text-red-500">{getError("new_password2")}</span>
        )}
      </div>

      {/* GLOBAL ERROR */}
      {getError("non_field_errors") && (
        <div className="text-sm text-red-500">{getError("non_field_errors")}</div>
      )}

      {/* GLOBAL ERROR */}
      {getError("detail") && (
        <div className="text-sm text-red-500">{getError("detail")}</div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end gap-2 mt-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Enregistrement..." :  "Modifier" }
        </Button>
      </div>
    </form>
  )
}


export default function InfoPerso() {
  const { data: user,isLoading } = useMe();
  const role = user?.role ?? null;
  const mention = user?.mention ?? null;
  const [nom,setNom] = useState(user?.last_name || "")
  const matricule = user?.username || "Inconnue"
  const [prenoms,setPrenoms] = useState(user?.first_name || "")
  const [email,setEmail] = useState(user?.email || "")
  const [editMode, setEditMode] = useState(false);

  const update = useUpdateMe()
  const { openModal ,closeModal } = useModal()

  if (isLoading) {
    return (
        <div className="flex items-center justify-center p-8 w-full h-full" >
            ...chargement
        </div>
    )
  }

  const handleSubmit = async () => {
    const payload = {
        first_name:prenoms,
        last_name:nom,
        email:email
    }
    try {
        await update.mutateAsync(payload)
        toast.success("informations enregistré")
    } catch (error) {
        msg = error.response.data ? Object.values(error.response.data)[0] : "une érreur est survenue"
        toast.error(msg)        
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mon Profil</h1>
        <p className="text-gray-500 mt-1 text-sm">Gérez vos informations personnelles et vos paramètres de sécurité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
        {/* Card: Avatar + Identité */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-white shadow-md">
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl font-bold text-gray-500 select-none">
                {prenoms.charAt(0)}{nom.charAt(0)}
              </div>
            </div>
            {/* <button className="absolute bottom-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-colors">
              <IconCamera />
            </button> */}
          </div>

          <h2 className="text-xl font-bold text-gray-900">{prenoms} {nom}</h2>
          <p className="text-gray-500 text-sm mt-0.5">{role}</p>

          <div className="w-full border-t border-gray-100 my-4"/>
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-2">Matricule</p>
            <div className="bg-gray-50 border border-gray-200 mb-3 rounded-lg px-5 py-2 text-sm font-mono font-semibold text-gray-700 tracking-wider">
                {matricule}
            </div>
            {mention && <>
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-2">Mention</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-2 text-sm font-mono font-semibold text-gray-700 tracking-wider">
                {mention.text}
            </div>
            </>
            }

        </div>

        {/* Card: Informations Personnelles */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          <div>
            <div className="flex items-center gap-2 mb-5">
                <span className="text-red-600"><IconUser /></span>
                <h3 className="text-lg font-bold text-gray-900">Informations Personnelles</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom</label>
                <input
                    type="text"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    readOnly={!editMode}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all ${
                    editMode
                        ? "border-red-400 ring-2 ring-red-100 bg-white"
                        : "border-gray-200 bg-white focus:border-gray-300"
                    }`}
                />
                </div>
                <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Prénoms</label>
                <input
                    type="text"
                    value={prenoms}
                    onChange={e => setPrenoms(e.target.value)}
                    readOnly={!editMode}
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all ${
                    editMode
                        ? "border-red-400 ring-2 ring-red-100 bg-white"
                        : "border-gray-200 bg-white focus:border-gray-300"
                    }`}
                />
                </div>
            </div>

            <div className="mb-5">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
                <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                readOnly={!editMode}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none transition-all ${
                    editMode
                    ? "border-red-400 ring-2 ring-red-100 bg-white"
                    : "border-gray-200 bg-white focus:border-gray-300"
                }`}
                />
            </div>
          </div>

          <button
            onClick={() => {
                if (editMode){
                    handleSubmit()
                }
                setEditMode(!editMode)
            }}
            className="flex w-full items-center gap-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <IconEdit />
            {editMode ? "Enregistrer les modifications" : "Modifier mes informations"}
          </button>
        </div>

        {/* Card: Statut du compte */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">Statut du Compte</p>
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <span className="text-green-600"><IconCheckCircle /></span>
            <span className="text-green-700 font-semibold text-sm">Compte Vérifié</span>
          </div>
        </div>

        {/* Card: Sécurité */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-red-600"><IconShield /></span>
            <h3 className="text-lg font-bold text-gray-900">Sécurité</h3>
          </div>

          <button 
          onClick={()=> {
            openModal({title:"Modifier le mot de passe",content:<ChangePasswordForm onSuccess={closeModal}/>})
          }}
          className="w-full flex items-center justify-center gap-2.5 border-2 border-red-200 hover:border-red-400 hover:bg-red-50 text-red-600 font-semibold text-sm px-5 py-3 rounded-xl transition-all"
          >
            <IconRefreshKey />
            Changer mon mot de passe
          </button>
        </div>
      </div>
    </div>
  );
}
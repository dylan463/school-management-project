import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo } from "react"
import useDebounced from '../../hooks/useDebounced'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import { useState, useEffect } from "react";
import { useFormations } from "../../hooks/formations/useFormations";
import { useCreateFormation } from "../../hooks/formations/useCreateFormation";
import { useToggleFormationActivation } from "../../hooks/formations/useToggleFormationActivation";
import { useUpdateFormation } from "../../hooks/formations/useUpdateFormation";
import { useDeleteFormation } from "../../hooks/formations/useDeleteFormation";
import useDRFErrors from "../../hooks/useDRFError";
import { toast } from 'react-toastify'
import { useQueryParams } from "../../hooks/useQueryParams"
import ActiveBadge from "../ActiveBadge"
import Switch from "../Switch"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    text: "",
    code: "",
    description: "",
  });

  const create = useCreateFormation();
  const update = useUpdateFormation();

  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        text: initialData.text || "",
        code: initialData.code || "",
        description: initialData.description || "",
      });
    }
  }, [initialData?.id, initialData?.text, initialData?.code, initialData?.description]);

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.text || !form.code) return;
    const data = {
      text: form.text,
      code: form.code,
      ...(form.description && { description: form.description }),
    }

    setLoading(true);
    try {
      if (isEdit) {
        await update.mutateAsync(
          { id: initialData.id, data },
          { onSuccess: () => onSuccess?.() }
        );
      } else {
        await create.mutateAsync(data, {
          onSuccess: () => {
            setForm({ text: "", code: "", description: "" });
            onSuccess?.();
          },
        });
      }
    } catch (error) {
      handleErrors(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-3">

      {/* TEXT */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Nom</label>
        <input
          name="text"
          value={form.text}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: Réseaux et systèmes"
        />
        {getError("text") && (
          <span className="text-xs text-red-500">{getError("text")}</span>
        )}
      </div>

      {/* code */}
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-sm text-slate-600">Code</label>
        <input
          type="text"
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="Ex : RS"
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
        />
        {getError("code") && (
          <span className="text-xs text-red-500">{getError("code")}</span>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-sm text-slate-600">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ex : Un parcours qui se centralise plutot dans le réseaux IP"
          className="border rounded-md h-[200px] resize-none px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
        />
        {getError("description") && (
          <span className="text-xs text-red-500">{getError("description")}</span>
        )}
      </div>

      {/* GLOBAL ERROR */}
      {getError("non_field_errors") && (
        <div className="text-sm text-red-500">{getError("non_field_errors")}</div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer"}
        </Button>
      </div>

    </form>
  );
}

function DeleteConfirm({ Data, onSuccess }) {
  const destroy = useDeleteFormation()
  const [loading, setLoading] = useState(false)
  const { handleErrors, getError, clearErrors } = useDRFErrors()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await destroy.mutateAsync(Data.id)
    } catch (error) {
      handleErrors(error)
      const msg = error.response.data.detail || "Une erreur est survenue"
      toast.error(msg)
    } finally {
      setLoading(false)
      onSuccess?.()
    }
  }

  return (<div>
    <p> vouler vous supprimer la formation {Data.text} ?</p>
    <div className="mt-4 flex justify-end">
      <Button
        onClick={() => handleConfirm()}
        disabled={loading}
      >
        {loading ? "Suppression..." : "Supprimer"}
      </Button>
    </div>
  </div>)
}

export default function FormationPanel() {
  const { search, page, setSearch, setPage, is_active, setIs_active } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    is_active: { key: "is_active", type: "boolean", default: "" }
  })

  const tabs = [
    { key: "Tous", value: "" },
    { key: "Actif", value: true },
    { key: "Inactif", value: false },
  ]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get("page")) {
      setPage(1)
    }
  }, [])

  const toggleActivation = useToggleFormationActivation()
  const debouncedSearch = useDebounced(search)
  const { openModal, closeModal } = useModal()

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(page && { page }),
      ...(is_active !== '' && { is_active })
    }
  }, [debouncedSearch, page, is_active])

  const { data, isLoading } = useFormations(filters);
  const results = data?.results || [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  );
  const columns = [
    { header: "ID", key: "id" },
    { header: "Nom", key: "text" },
    { header: "Code", key: "code" },
    { header: "Description", key: "description" },
    { header: "Statut", key: "is_active", render: (value) => <ActiveBadge isActive={value} /> }
  ]

  const actions = [
    {
      label: "Modifier",
      handler: (row) => openModal({ title: "Modifier la formation", content: <AddOrEditForm initialData={row} onSuccess={closeModal} /> })
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({ title: `Supprimer ${row.text}`, content: <DeleteConfirm Data={row} onSuccess={closeModal} /> })
    },
    {
      label: "Désactiver",
      handler: (row) => { toggleActivation.mutate(row.id) },
      conditionRow: (row) => row.is_active
    },
    {
      label: "Activer",
      handler: (row) => { toggleActivation.mutate(row.id) },
      conditionRow: (row) => !row.is_active
    }
  ]

  return (
    <Card>
      <div className="px-2 py-2 flex justify-between">
        <Switch tabs={tabs} active={is_active} onChange={(value) => { setIs_active(value) }} />
        <SearchInput
          placeholder="rechercher un parcours"
          className="w-[200px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
        ></SearchInput>
        <Button
          variant="primary"
          onClick={() => {
            openModal({ title: "ajouter une formation", content: <AddOrEditForm onSuccess={closeModal} /> })
          }}
        >
          + ajouter
        </Button>
      </div>
      {isLoading ? (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Chargement...
        </div>
      )
        : results.length !== 0 ? (
          <DataTable
            data={results}
            columns={columns}
            actions={actions}
            selectionMode={false}
          />
        ) : results.length === 0 && (
          <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
            Aucun résultat
          </div>
        )}
      <Paginator
        totalPages={totalPages}
        page={page}
        setPage={setPage}
      />
    </Card>
  )
}
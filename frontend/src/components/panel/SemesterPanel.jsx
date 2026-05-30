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
import { useSemesters } from "../../hooks/semesters/useSemesters";
import { useCreateSemester } from "../../hooks/semesters/useCreateSemester";
import { useToggleSemesterActivation } from "../../hooks/semesters/useToggleSemesterActivation";
import { useUpdateSemester } from "../../hooks/semesters/useUpdateSemester";
import { useDeleteSemester } from "../../hooks/semesters/useDeleteSemester";
import useDRFErrors from "../../hooks/useDRFError";
import { toast } from 'react-toastify'
import { useQueryParams } from "../../hooks/useQueryParams"
import ActiveBadge from "../ActiveBadge"
import Switch from "../Switch"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    code: "",
    order: "",
  });

  const create = useCreateSemester();
  const update = useUpdateSemester();

  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        order: initialData.order || "",
        code: initialData.code || "",
      });
    }
  }, [initialData?.id, initialData?.code, initialData?.order]);

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.order || !form.code) return;
    const data = {
      order: form.order,
      code: form.code,
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
            setForm({ order: "", code: "" });
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
      <p className="text-xs text-slate-500">Vous devriez crée vos semestres dans un ordre croissant et succéssif.</p>

      {/* code */}
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-sm text-slate-600">Code</label>
        <input
          type="text"
          name="code"
          value={form.code}
          onChange={handleChange}
          placeholder="Ex : S1 ou Semestre 1"
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
        />
        {getError("code") && (
          <span className="text-xs text-red-500">{getError("code")}</span>
        )}
      </div>

      {/* order */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Numero</label>
        <input
          name="order"
          type="number"
          value={form.order}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: 1"
        />
        {getError("order") && (
          <span className="text-xs text-red-500">{getError("order")}</span>
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
  const destroy = useDeleteSemester()
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
    <p> vouler vous supprimer le semestre {Data.code} ?</p>
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

export default function SemesterPanel() {
  const { search, page, setSearch, setPage, is_active, setIs_active } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    is_active: { key: "is_active", type: "boolean", default: null }
  })

  const tabs = [
    { key: "Tous", value: null },
    { key: "Active", value: true },
    { key: "Inactive", value: false },
  ]
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get("page")) {
      setPage(1)
    }
    if (!params.get("is_active")) {
      setIs_active(null)
    }
  }, [])

  const toggleActivation = useToggleSemesterActivation()
  const debouncedSearch = useDebounced(search)
  const { openModal, closeModal } = useModal()

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(page && { page }),
      ...(is_active !== '' && { is_active })
    }
  }, [debouncedSearch, page, is_active])

  const { data, isLoading } = useSemesters(filters);
  const results = data?.results || [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  );
  const columns = [
    { header: "Id", key: "id" },
    { header: "Ordre", key: "order" },
    { header: "Code", key: "code" },
    { header: "Statut", key: "is_active", render: (value) => <ActiveBadge isActive={value} /> }
  ]

  const actions = [
    {
      label: "Modifier",
      handler: (row) => openModal({ title: "Modifier le semestre", content: <AddOrEditForm initialData={row} onSuccess={closeModal} /> })
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({ title: `Supprimer le semestre ${row.code}`, content: <DeleteConfirm Data={row} onSuccess={closeModal} /> })
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
          placeholder="rechercher un semestre"
          className="w-[200px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
        ></SearchInput>
        <Button
          variant="primary"
          onClick={() => {
            openModal({ title: "ajouter un semestre", content: <AddOrEditForm onSuccess={closeModal} /> })
          }}
        >
          + ajouter
        </Button>
      </div>
      {results.length != 0 ? <DataTable
        data={results}
        columns={columns}
        actions={actions}
        selectionMode={false}
      /> : <div className="flex justify-center text-slate-500 text-[13px] items-center h-[100px]">Aucun resultats</div>
      }
      <Paginator
        totalPages={totalPages}
        page={page}
        setPage={setPage}
      />
    </Card>
  )
}
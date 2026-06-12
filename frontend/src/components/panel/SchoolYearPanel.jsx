import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo } from "react"
import useDebounced from '../../hooks/useDebounced'
import { useQueryState } from 'nuqs'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import { useState, useEffect } from "react";
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears";
import { useCreateSchoolyear } from "../../hooks/schoolyears/useCreateSchoolyear";
import { useToggleSchoolyearLock } from "../../hooks/schoolyears/useToggleSchoolyearLock";
import { useUpdateSchoolyear } from "../../hooks/schoolyears/useUpdateSchoolyear";
import { useDeleteSchoolyear } from "../../hooks/schoolyears/useDeleteSchoolyear";
import { useChangeStatusSchoolyear } from "../../hooks/schoolyears/useChangeStatusSchoolyear"
import useDRFErrors from "../../hooks/useDRFError";
import { toast } from 'react-toastify'
import { useQueryParams } from "../../hooks/useQueryParams"
import LockButton from "../LockButton"
import Switch from "../Switch"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    text: "",
    start_date: "",
    end_date: "",
  });

  const create = useCreateSchoolyear();
  const update = useUpdateSchoolyear();

  const { handleErrors, getError, clearErrors } = useDRFErrors();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        text: initialData.text || "",
        start_date: initialData.start_date || "",
        end_date: initialData.end_date || "",
      });
    }
  }, [initialData?.id, initialData?.text, initialData?.start_date, initialData?.end_date]);

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.text) return;
    const data = {
      text: form.text,
      ...(form.start_date && { start_date: form.start_date }),
      ...(form.end_date && { end_date: form.end_date }),
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
            setForm({ text: "", start_date: "", end_date: "" });
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
          placeholder="Ex: 2024-2025"
        />
        {getError("text") && (
          <span className="text-xs text-red-500">{getError("text")}</span>
        )}
      </div>

      {/* DATES — côte à côte */}
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Date de début</label>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
          {getError("start_date") && (
            <span className="text-xs text-red-500">{getError("start_date")}</span>
          )}
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-sm text-slate-600">Date de fin</label>
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          />
          {getError("end_date") && (
            <span className="text-xs text-red-500">{getError("end_date")}</span>
          )}
        </div>
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
  const destroy = useDeleteSchoolyear()
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
    <p> vouler vous supprimer l'année scolaire {Data.text} ?</p>
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

export default function SchoolYearPanel() {
  const { search, page, setSearch, setPage, status, setStatus } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    status: { key: "status", type: "string", default: "" }
  })

  const tabs = [
    { key: "Tous", value: "" },
    { key: "Active", value: "ACTIVE" },
    { key: "Clôturée", value: "CLOSED" },
    { key: "En Attente", value: "UPCOMING" },
  ]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get("page")) {
      setPage(1)
    }
    if (!params.get("status")) {
      setStatus("")
    }
  }, [])

  const toggleLock = useToggleSchoolyearLock()
  const changeStatus = useChangeStatusSchoolyear()
  const debouncedSearch = useDebounced(search)
  const { openModal, closeModal } = useModal()

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(page && { page }),
      ...(status && { status })
    }
  }, [debouncedSearch, page, status])

  const { data, isLoading } = useSchoolyears(filters);
  const results = data?.results || [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  );
  const columns = [
    { header: "ID", key: "id" },
    { header: "Nom", key: "text" },
    { header: "Date debut", key: "start_date" },
    { header: "Date fin", key: "end_date" },
    { header: "Statut", key: "status" ,render: (val) => val == "ACTIVE" ? "Active" : val == "UPCOMING" ? "En Attente" : "Clôturée"},
    { header: "Bloquer", key: "is_locked", render: (value) => <LockButton locked={!!value} /> }
  ]

  const actions = [
    {
      label: "Modifier",
      handler: (row) => openModal({ title: "Modifier l'année scolaire", content: <AddOrEditForm initialData={row} onSuccess={closeModal} /> })
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({ title: `Supprimer ${row.text}`, content: <DeleteConfirm Data={row} onSuccess={closeModal} /> })
    },
    {
      label: "Bloquer",
      handler: (row) => { toggleLock.mutate(row.id,{
        onError:(error) => {
          const msg = error.response.data.detail
          toast.error(msg)
        }
      })},
      conditionRow: (row) => !row.is_locked
    },
    {
      label: "Debloquer",
      handler: (row) => { toggleLock.mutate(row.id,{
        onError:(error) => {
          const msg = error.response.data.detail
          toast.error(msg)
        }
      })},
      conditionRow: (row) => row.is_locked
    },
    {
      label: "Activer",
      handler: (row) => { changeStatus.mutate({ id: row.id, status: "ACTIVE" },{
        onError:(error) => {
          const msg = error.response.data.detail
          toast.error(msg)
        }
      })},
      conditionRow: (row) => row.status == "UPCOMING"
    },
    {
      label: "Cloturer",
      handler: (row) => { changeStatus.mutate({ id: row.id, status: "CLOSED" },{
        onError:(error) => {
          const msg = error.response.data.detail
          toast.error(msg)
        }
      }) },
      conditionRow: (row) => row.status == "ACTIVE"
    },
  ]

  return (
    <Card>
      <div className="px-2 py-2 flex justify-between">
        <Switch tabs={tabs} active={status} onChange={(value) => { setStatus(value) }} />
        <SearchInput
          placeholder="rechercher une année scolaire"
          className="w-[200px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
        ></SearchInput>
        <Button
          variant="primary"
          onClick={() => {
            openModal({ title: "ajouter une année scolaire", content: <AddOrEditForm onSuccess={closeModal} /> })
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
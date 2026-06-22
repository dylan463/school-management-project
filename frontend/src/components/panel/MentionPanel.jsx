import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMentions } from '../../hooks/mentions/useMentions'
import { useMemo } from "react"
import useDebounced from '../../hooks/useDebounced'
import { useQueryState } from 'nuqs'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import { useState, useEffect } from "react";
import { useCreateMention } from "../../hooks/mentions/useCreateMention";
import { useUpdateMention } from "../../hooks/mentions/useUpdateMention";
import { useDeleteMention } from "../../hooks/mentions/useDeleteMention";
import useDRFErrors from "../../hooks/useDRFError";
import { toast } from 'react-toastify'
import { useQueryParams } from "../../hooks/useQueryParams"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    text: "",
    code: "",
  });

  const create = useCreateMention();
  const update = useUpdateMention();

  const { handleErrors, getError, clearErrors } = useDRFErrors();

  const [loading, setLoading] = useState(false);

  // remplir form si edit
  useEffect(() => {
    if (initialData) {
      setForm({
        text: initialData.text || "",
        code: initialData.code || "",
      });
    }
  }, [initialData?.id, initialData?.text, initialData?.code]); // ✅ primitives, stable

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.text || !form.code) return;

    setLoading(true);

    try {
      if (isEdit) {
        await update.mutateAsync(
          { id: initialData.id, data: form },
          {
            onSuccess: () => {
              onSuccess?.();
            },
          }
        );
      } else {

        await create.mutateAsync(form, {
          onSuccess: () => {
            setForm({ text: "", code: "" });
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
          placeholder="Ex: Informatique"
        />
        {getError("text") && (
          <span className="text-xs text-red-500">
            {getError("text")}
          </span>
        )}
      </div>

      {/* CODE */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Code</label>
        <input
          name="code"
          value={form.code}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: INF"
        />
        {getError("code") && (
          <span className="text-xs text-red-500">
            {getError("code")}
          </span>
        )}
      </div>

      {/* GLOBAL ERROR */}
      {getError("non_field_errors") && (
        <div className="text-sm text-red-500">
          {getError("non_field_errors")}
        </div>
      )}

      {/* SUBMIT */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading
            ? "Enregistrement..."
            : isEdit
              ? "Modifier"
              : "Créer"}
        </Button>
      </div>

    </form>
  );
}

function DeleteConfirm({ Data, onSuccess }) {
  const destroy = useDeleteMention()
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
    <p> vouler vous supprimer la mention {Data.text} ?</p>
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

export default function MentionPanel() {
  const { search, page, setSearch, setPage } = useQueryParams({
    search: { key: "mention_search", type: "string", default: "" },
    page: { key: "mention_page", type: "number", default: 1 }
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get("mention_page")) {
      setPage(1)
    }
  }, [])

  const debouncedSearch = useDebounced(search)
  const { openModal, closeModal } = useModal()

  
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(page && { page })
    }
  }, [debouncedSearch, page])

  const { data, isLoading } = useMentions(filters);
  const results = data?.results || [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  );
  const columns = [
    { header: "ID", key: "id" },
    { header: "Nom", key: "text" },
    { header: "Code", key: "code" }
  ]

  const actions = [
    {
      label: "Modifier",
      handler: (row) => openModal({ title: "Modifier la mention", content: <AddOrEditForm initialData={row} onSuccess={closeModal} /> })
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({ title: `Supprimer ${row.text}`, content: <DeleteConfirm Data={row} onSuccess={closeModal} /> })
    }
  ]

  return (
    <Card>
      <div className="px-2 py-2 flex justify-between">
        <SearchInput
          placeholder="Rechercher une mention"
          className="w-[200px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
        ></SearchInput>
        <Button
          variant="primary"
          onClick={() => {
            openModal({ title: "ajouter une mention", content: <AddOrEditForm onSuccess={closeModal} /> })
          }}
        >
          + Ajouter
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
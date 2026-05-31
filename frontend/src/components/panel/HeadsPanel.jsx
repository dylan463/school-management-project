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
import useDRFErrors from "../../hooks/useDRFError";
import { toast } from 'react-toastify'
import { useHeads } from "../../hooks/heads/useHeads";
import { useMentions } from "../../hooks/mentions/useMentions";
import { useQueryParams } from "../../hooks/useQueryParams";
import { useCreateHead } from "../../hooks/heads/useCreateHead";
import { useUpdateHead } from "../../hooks/heads/useUpdateHead";
import { useDeleteHead } from "../../hooks/heads/useDeleteHead";
import { useMention } from "../../hooks/mentions/useMention";
import { useSearchDropdown } from "../../hooks/useSearchDropdown";
import SearchWithDropdown from "../SearchWithDropdown";

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    mention_id: "",
  });

  const [selectedMention, setSelectedMention] = useState(null);

  const create = useCreateHead();
  const update = useUpdateHead();

  const { handleErrors, getError, clearErrors } = useDRFErrors();

  const [loading, setLoading] = useState(false);

  const { value, query, onChange, isOpen, close, containerRef } = useSearchDropdown({
    delay: 300,
    minChars: 2,
  });
  const { data: optionsData, isFetching } = useMentions(query ? { search: query } : null, query.length >= 2, 0);

  const handleSelectMention = (mention) => {
    setSelectedMention(mention);
    setForm(prev => ({ ...prev, mention_id: mention.id }));
    close();
  };



  // remplir form si edit
  useEffect(() => {
    if (initialData?.id) {
      setForm({
        email: initialData.email || "",
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        mention_id: initialData.mention?.id || "",
      });
      if (initialData.mention) {
        setSelectedMention(initialData.mention);
      }
    }
  }, [initialData?.id, initialData?.email, initialData?.first_name, initialData?.last_name, initialData?.mention?.id]); // ✅ primitives, stable

  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.first_name || !form.last_name || !form.mention_id) return;

    setLoading(true);

    try {
      let data = form;
      if (form.mention_id) {
        data = { ...form, mention: form.mention_id };
        delete data.mention_id;
      }
      if (isEdit) {
        await update.mutateAsync(
          { id: initialData.id, data },
          {
            onSuccess: () => {
              onSuccess?.();
            },
          }
        );
      } else {

        await create.mutateAsync(data, {
          onSuccess: () => {
            setForm({ email: "", first_name: "", last_name: "", mention_id: "" });
            setSelectedMention(null);
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

      {/* EMAIL */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: jean.dupont@ecole.com"
        />
        {getError("email") && (
          <span className="text-xs text-red-500">
            {getError("email")}
          </span>
        )}
      </div>

      {/* FIRST NAME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Prénom</label>
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: Jean"
        />
        {getError("first_name") && (
          <span className="text-xs text-red-500">
            {getError("first_name")}
          </span>
        )}
      </div>

      {/* LAST NAME */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Nom</label>
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex: Dupont"
        />
        {getError("last_name") && (
          <span className="text-xs text-red-500">
            {getError("last_name")}
          </span>
        )}
      </div>

      {/* MENTION */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Mention</label>
        {!selectedMention ? (
          <SearchWithDropdown
            value={value}
            onChange={onChange}
            isOpen={isOpen}
            close={close}
            containerRef={containerRef}
            options={optionsData?.results || []}
            loading={isFetching}
            onSelect={handleSelectMention}
            renderOption={(option) => option.text}
            placeholder="Rechercher une mention"
            inputClassName="w-full"
          />
        ) : (
          <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-slate-50">
            <span className="text-sm">{selectedMention.text}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedMention(null);
                setForm(prev => ({ ...prev, mention_id: "" }));
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Changer
            </button>
          </div>
        )}
        {getError("mention_id") && (
          <span className="text-xs text-red-500">
            {getError("mention_id")}
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
  const destroy = useDeleteHead()
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
    <p> vouler vous supprimer le responsable {Data.first_name} {Data.last_name} ?</p>
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

export default function HeadsPanel() {
  const { search, page, setSearch, setPage, mentionId, setMentionId } = useQueryParams({
    search: { key: "head_search", type: "string", default: "" },
    page: { key: "head_page", type: "number", default: 1 },
    mentionId: { key: "mention_id", type: "string", default: "" },
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get("head_page")) {
      setPage(1)
    }
    if (!params.get("mention_id")) {
      setMentionId("")
    }
  }, [])

  const [showFilters, setShowFilters] = useState(false)
  const debouncedSearch = useDebounced(search)

  const { data: mention } = useMention(mentionId)

  const { value, query, onChange, isOpen, close, containerRef } = useSearchDropdown({
    delay: 300,
    minChars: 2,
  })
  const { data: options, isFetching } = useMentions(query ? { search: query } : null, query.length >= 2, 0)
  const handleSelectMention = (mention) => {
    setMentionId(mention.id)
    close()
  }

  const { openModal, closeModal } = useModal()

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(mentionId && { mention: mentionId }),
      ...(page && { page })
    }
  }, [debouncedSearch, page, mentionId])

  const { data } = useHeads(filters);
  const results = data?.results || [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  );
  const columns = [
    { header: "Id", key: "id" },
    { header: "Email", key: "email" },
    { header: "Prénom", key: "first_name" },
    { header: "Nom", key: "last_name" },
    { header: "Mention", key: "mention", render: (value) => value.code || "" }
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
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={() => { setShowFilters(!showFilters) }}
          >
            Filtres
          </Button>
        </div>
        <SearchInput
          placeholder="rechercher un responsable"
          className="w-[200px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value) }}
        ></SearchInput>
        <Button
          variant="primary"
          onClick={() => {
            openModal({ title: "ajouter un responsable", content: <AddOrEditForm onSuccess={closeModal} /> })
          }}
        >
          + ajouter
        </Button>
      </div>
      {
        showFilters && (
          <div className="ml-2 mb-2">
            <div className="flex gap-2">
              <SearchWithDropdown
                value={value}
                onChange={onChange}
                isOpen={isOpen}
                close={close}
                containerRef={containerRef}
                options={options?.results || []}
                loading={isFetching}
                onSelect={handleSelectMention}
                renderOption={(option) => option.text}
                placeholder="rechercher une mention"
                className="w-[200px]"
                inputClassName="w-[200px]"
              />
              {
                mentionId && (
                  <>
                    <Button
                      onClick={() => {
                        setMentionId(null)
                        close()
                      }}
                    >
                      Clear
                    </Button>
                    <p className="flex h-[35px] items-center">Mention : {mention?.text || "Chargement..."}</p>
                  </>
                )
              }
            </div>
          </div>
        )
      }
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
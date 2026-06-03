import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import { useNavigate } from 'react-router-dom'
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
import { useCourseunits } from "../../hooks/courseunits/useCourseunits";
import { useFormations } from "../../hooks/formations/useFormations";
import { useQueryParams } from "../../hooks/useQueryParams";
import { useCreateCourseunit } from "../../hooks/courseunits/useCreateCourseunit";
import { useUpdateCourseunit } from "../../hooks/courseunits/useUpdateCourseunit";
import { useDeleteCourseunit } from "../../hooks/courseunits/useDeleteCourseunit";
import { useFormation } from "../../hooks/formations/useFormation";
import { useSearchDropdown } from "../../hooks/useSearchDropdown";
import SearchWithDropdown from "../SearchWithDropdown";
import Badge from "../Badge"
import Filter from "../Filter"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    formation: initialData.formation?.id || "",
    code: initialData.code || "",
    text: initialData.text || "",
  });

  const [selectedFormation, setSelectedFormation] = useState(initialData.formation || null);

  const create = useCreateCourseunit();
  const update = useUpdateCourseunit();

  const { handleErrors, getError, clearErrors } = useDRFErrors();

  const [loading, setLoading] = useState(false);

  const { value, query, onChange, isOpen, close, containerRef } = useSearchDropdown({
    delay: 300,
    minChars: 1,
  });
  const { data: optionsData, isFetching } = useFormations(query ? { search: query } : null, !!query, 0);
  const optionResults = optionsData?.results || [];

  const handleSelectFormation = (formation) => {
    setSelectedFormation(formation);
    setForm(prev => ({ ...prev, formation: formation.id }));
    close();
  };


  const handleChange = (e) => {
    clearErrors();
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code || !form.text || !form.formation) return;

    setLoading(true);

    try {
      let data = form;
      if (form.formation) {
        data = { ...form, formation: form.formation };
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
            setForm({ code: "", text: "", formation: "" });
            setSelectedFormation(null);
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
          type="text"
          value={form.text}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Ex : Mathematique"
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
          placeholder="Ex: MATH101"
        />
        {getError("code") && (
          <span className="text-xs text-red-500">
            {getError("code")}
          </span>
        )}
      </div>

      {/* FORMATION */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">Parcours</label>
        {!selectedFormation ? (
          <SearchWithDropdown
            value={value}
            onChange={onChange}
            isOpen={isOpen}
            close={close}
            containerRef={containerRef}
            options={optionResults}
            loading={isFetching}
            onSelect={handleSelectFormation}
            renderOption={(option) => <div className="flex gap-x-2 items-center">
              <div>
                {option.text}
              </div>
              <Badge content={option.code} color="blue" />
            </div>}
            inputClassName="w-full"
          />
        ) : (
          <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-slate-50">
            <span className="text-sm">{selectedFormation.text}</span>
            <button
              type="button"
              onClick={() => {
                setSelectedFormation(null);
                setForm(prev => ({ ...prev, formation: "" }));
              }}
              className="text-xs text-red-500 hover:underline"
            >
              Changer
            </button>
          </div>
        )}
        {getError("formation") && (
          <span className="text-xs text-red-500">
            {getError("formation")}
          </span>
        )}
      </div>

      {/* GLOBAL ERROR */}
      {getError("non_field_errors") && (
        <div className="text-sm text-red-500">
          {getError("non_field_errors")}
        </div>
      )}

      {/* GLOBAL ERROR */}
      {getError("detail") && (
        <div className="text-sm text-red-500">
          {getError("detail")}
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
  const destroy = useDeleteCourseunit()
  const [loading, setLoading] = useState(false)
  const { handleErrors, getError, clearErrors } = useDRFErrors()

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await destroy.mutateAsync(Data.id)
    } catch (error) {
      handleErrors(error)
      const msg = getError("detail") || "Une erreur est survenue"
      toast.error(msg)
    } finally {
      setLoading(false)
      onSuccess?.()
    }
  }

  return (<div>
    <p> vouler vous supprimer l' UE {Data.text} {Data.code} ?</p>
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

export default function CourseUnitsPanel() {
  const { openModal, closeModal } = useModal()
  const navigate = useNavigate()

  const { search, page, setSearch, setPage, formation, setFormation, status, setStatus } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    formation: { key: "formation", type: "string", default: "" },
    status: { key: "status", type: "string", default: "" },
  })
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.get("page")) {
      setPage(1)
    }
  }, [])

  const [showFilters, setShowFilters] = useState(false)
  const debouncedSearch = useDebounced(search)
  const { value, query, onChange, isOpen, close, containerRef } = useSearchDropdown({
    delay: 300,
    minChars: 1,
  })
  const { data: formationOptions, isLoading: isFormationsLoading, isFetching: isFormationFetching } = useFormations(query ? { search: query } : null, query.length >= 1, 0)

  const formationOptionResults = formationOptions?.results || []
  const { data: formationData, isLoading: isFormationLoading } = useFormation(formation)
  const isFilterLoading = isFormationLoading || isFormationsLoading

  const handleSelectFormation = (formation) => {
    setFormation(formation.id)
    close()
  }
  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation && { formation: formation }),
      ...(page && { page }),
      ...(status && { is_active: status })
    }
  }, [debouncedSearch, page, formation, status])

  // actual fetching of the data with the filters
  const { data, isLoading: isDataLoading } = useCourseunits(filters);
  const results = data?.results || [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  );

  const columns = [
    { header: "Parcours", key: "formation", render: (value) => value?.text || "" },
    { header: "Code UE", key: "code" },
    { header: "Nom UE", key: "text" },
    {
      header: "Status", key: "is_active", render: (value) => {
        return value ? <Badge content="Active" color="green" /> : <Badge content="Inactive" color="red" />
      }
    }
  ]

  const actions = [
    {
      label: "Modifier",
      handler: (row) => openModal({ title: "Modifier l'UE", content: <AddOrEditForm initialData={row} onSuccess={closeModal} /> })
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({ title: `Supprimer ${row.text}`, content: <DeleteConfirm Data={row} onSuccess={closeModal} /> })
    },
    {
      label: "Voir cours",
      handler: (row) => {
        navigate(`/course-modules?courseunit=${row.id}`)
      }
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
      {showFilters && (
        <div className="ml-2 mb-2">
          <div className="flex gap-2 border-b pb-2 mb-2 border-slate-200">
            {!formationData ? (
              <div>
                <label className="text-slate-600 font-bold block">Parcours</label>
                <SearchWithDropdown
                  value={value}
                  onChange={onChange}
                  isOpen={isOpen}
                  close={close}
                  containerRef={containerRef}
                  options={formationOptionResults}
                  loading={isFormationFetching}
                  onSelect={handleSelectFormation}
                  renderOption={(option) => <div className="flex gap-x-2 items-center">
                    <div>
                      {option.text}
                    </div>
                    <Badge content={option.code} color="blue" />
                  </div>}
                  placeholder="Rechercher une formation"
                  inputClassName="w-[200px]"
                />
              </div>
            ) : (
              <div>
                <label className="text-slate-600 font-bold block">Parcours</label>
                <div className="flex items-center justify-between border h-[35px] w-[200px] rounded-md px-3 py-2 bg-slate-50">
                  <span className="text-sm">{formationData?.text}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormation(null);
                    }}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Changer
                  </button>
                </div>
              </div>
            )}
            <Filter
              value={status}
              label="status"
              onChange={(e) => setStatus(e.target.value)}
              otherOptions={[
                { key: "Tous", value: "" },
                { key: "Active", value: "true" },
                { key: "Inactive", value: "false" }
              ]}
              className="w-[200px]"
            />
          </div>
        </div>
      )}
      {isDataLoading ? (
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
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
import SearchableSelect from "../SearchableSelect";
import { ROLES } from "../../utils/constants"
import { useAuth } from "../../context/AuthContext"
import Badge from "../Badge"
import Filter from "../Filter"

function AddOrEditForm({ initialData = {}, onSuccess }) {
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    formation: initialData.formation?.id || "",
    code: initialData.code || "",
    text: initialData.text || "",
    min_val_score: initialData.min_val_score || 1,
  });

  const [selectedFormation, setSelectedFormation] = useState(initialData.formation || null);

  const create = useCreateCourseunit();
  const update = useUpdateCourseunit();

  const { handleErrors, getError, clearErrors } = useDRFErrors();

  const [loading, setLoading] = useState(false);

  const fdd = useSearchDropdown({
    delay: 300,
    minChars: 1,
  });
  const { data: optionsData, isFetching } = useFormations(fdd.query ? { search: fdd.query } : {}, { enabled: !!fdd.query, staleTime: 5 * 60 * 1000 });
  const optionResults = optionsData?.results || [];

  const handleSelectFormation = (formation) => {
    setSelectedFormation(formation);
    setForm(prev => ({ ...prev, formation: formation.id }));
    fdd.close();
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

    if (!form.code || !form.text || !form.formation || !form.min_val_score) return;

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
            setForm({ code: "", text: "", formation: "" ,min_val_score:""});
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

      {/* FORMATION */}
      <div className="flex flex-col gap-1">
        <SearchableSelect
          label="Parcours"
          selectedValue={selectedFormation}
          onSelect={handleSelectFormation}
          onClear={() => {
            setSelectedFormation(null);
            setForm(prev => ({ ...prev, formation: "" }));
          }}
          options={optionResults}
          renderOption={(option) => option.text}
          searchDropdownProps={fdd}
          loading={isFetching}
          placeholder="Rechercher un parcours"
          width="w-full"
        />
        {getError("formation") && (
          <span className="text-xs text-red-500">
            {getError("formation")}
          </span>
        )}
      </div>

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

      <div className="flex flex-col gap-1">
        <label className="text-sm text-slate-600">note de validation UE (1-19)</label>
        <input
          name="min_val_score"
          type="number"
          min="1"
          max="19"
          value={form.min_val_score}
          onChange={handleChange}
          className="border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
        />
        {getError("min_val_score") && <span className="text-xs text-red-500">{getError("min_val_score")}</span>}
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
  const { role } = useAuth()
  const navigate = useNavigate()

  const { search, page, setSearch, setPage, formation_id, setFormation_id, status, setStatus } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    formation_id: { key: "formation_id", type: "number", default: "" },
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
  const fdd = useSearchDropdown({
    delay: 300,
    minChars: 1,
  })
  const { data: fOptions, isFetching: fFetching } = useFormations(fdd.query ? { search: fdd.query } : {}, { enabled: fdd.enabled, staleTime: 0 })

  const fOptionResults = fOptions?.results || []
  const { data: formation } = useFormation(formation_id)

  const handleSelectFormation = (f) => {
    setFormation_id(f.id)
    setPage(1)
    fdd.close()
  }
  
  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation_id && { formation: formation_id }),
      ...(page && { page }),
      ...(status && { is_active: status })
    }
  }, [debouncedSearch, page, formation_id, status])

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
    { header: "note de validation", key: "min_val_score" },
    {
      header: "Statut", key: "is_active", render: (value) => {
        return value ? <Badge content="Active" color="green" /> : <Badge content="Inactive" color="red" />
      }
    }
  ]

  const canCreate = [ROLES.DEPARTMENT_HEAD, ROLES.DEPARTMENT_SECRETARY].includes(role)

  const actions = [
    {
      label: "Modifier",
      handler: (row) => openModal({ title: "Modifier l'UE", content: <AddOrEditForm initialData={row} onSuccess={closeModal} /> }),
      conditionGlobal: canCreate
    },
    {
      label: "Supprimer",
      handler: (row) => openModal({ title: `Supprimer ${row.text}`, content: <DeleteConfirm Data={row} onSuccess={closeModal} /> }),
      conditionGlobal: canCreate
    },
    {
      label: "Voir les EC",
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
          placeholder="Rechercher une UE"
          className="w-[200px]"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        ></SearchInput>
        {canCreate && <Button
          variant="primary"
          onClick={() => {
            openModal({ title: "ajouter une UE", content: <AddOrEditForm onSuccess={closeModal} /> })
          }}
        >
          + ajouter
        </Button>}
      </div>
      {showFilters && (
        <div className="ml-2 mb-2">
          <div className="flex gap-2 border-b pb-2 mb-2 border-slate-200">
            <SearchableSelect
              label="Parcours"
              selectedValue={formation}
              onSelect={handleSelectFormation}
              onClear={() => { setFormation_id(""); setPage(1); }}
              options={fOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.code}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={fdd}
              loading={fFetching}
              placeholder="Rechercher un parcours"
              width="w-[200px]"
            />
            <Filter
              value={status}
              label="Statut"
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
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
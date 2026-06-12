import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo, useState, useEffect } from "react"
import useDebounced from '../../hooks/useDebounced'
import Paginator from '../Paginator'
import { PAGINATION_SIZE, ROLES } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import useDRFErrors from "../../hooks/useDRFError"
import { toast } from 'react-toastify'
import Badge from "../Badge"
import Filter from "../Filter"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useNavigate } from 'react-router-dom'

import { useEnrollments } from "../../hooks/enrollments/useEnrollments"
import { useDeleteEnrollment} from '../../hooks/enrollments/useDeleteEnrollment'

import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchableSelect from "../SearchableSelect"

import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"
import { useSchoolyear } from "../../hooks/schoolyears/useSchoolyear"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSemester } from "../../hooks/semesters/useSemester"
import { useSelected } from "../../context/SelectedContext"
import { useAuth } from "../../context/AuthContext"


function DeleteConfirm({ Data, onSuccess }) {
  const destroy = useDeleteEnrollment();
  const { handleErrors, getError ,errors,clearErrors} = useDRFErrors();

  const handleConfirm = async () => {
    try {
      await destroy.mutateAsync(Data.id);
    } catch (error) {
      const msg = error.response.data.detail || "Une erreur est survenue";
      toast.error(msg);
    } finally {
      onSuccess?.();
    }
  };

  return (
    <div>
      <p>Voulez-vous supprimer l'inscription  de <strong>{Data.student.first_name} {Data.student.last_name} en {Data.formation.text} {Data.semester.code} de l'année {Data.school_year.text}</strong> ?</p>
      <div className="mt-4 flex justify-end">
        <Button onClick={handleConfirm} disabled={destroy.isPending} className="bg-red-500 text-white hover:bg-red-600">
          {destroy.isPending ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

export default function HistoryPanel({enrollment, setEnrollment}) {
  const { role} = useAuth()
  const { openModal, closeModal } = useModal();
  const navigate = useNavigate();

  const { search, page, setSearch, setPage, school_year_id, setSchool_year_id, formation_id, setFormation_id, semester_id, setSemester_id, status, setStatus } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    school_year_id: { key: "school_year_id", type: "number", default: "" },
    formation_id: { key: "formation_id", type: "number", default: "" },
    semester_id: { key: "semester_id", type: "number", default: "" },
    status: { key: "status", type: "string", default: "" },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("page")) setPage(1);
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounced(search);

  // Filters hooks
  const fdd = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: fOptions, isFetching: fFetching } = useFormations(fdd.query ? { search: fdd.query } : {}, { enabled: fdd.enabled, staleTime: 0 });
  const fOptionResults = fOptions?.results || [];
  const { data: formation } = useFormation(formation_id);

  const sydd = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: syOptions, isFetching: syFetching } = useSchoolyears(sydd.query ? { search: sydd.query } : {}, { enabled: sydd.enabled, staleTime: 0 });
  const syOptionResults = syOptions?.results || [];
  const { data: school_year } = useSchoolyear(school_year_id);

  const sdd = useSearchDropdown({ delay: 300, minChars: 1 })
  const { data: semester } = useSemester(semester_id)
  const { data: sOptions, isFetching: sFetching } = useSemesters(sdd.query ? { search: sdd.query } : {}, { enabled: sdd.enabled, staleTime: 0 })
  const sOptionResults = sOptions?.results || sOptions || []

  const handleSelectFormation = (f) => {
    setFormation_id(f.id);
    fdd.close();
  };

  const handleSelectSy = (sy) => {
    setSchool_year_id(sy.id);
    sydd.close();
  };

  const handleSelectSemester = (s) => {
    setSemester_id(s.id);
    sdd.close();
  };

  const handleSelectEnrollment = (selectedEnrollment) => {
    const enrollmentId = selectedEnrollment?.[0]?.id || ""
    setEnrollment(enrollmentId);
  }

  const handleDelete = (enrollment) => {
    openModal({ title: `Supprimer l'inscription`, content: <DeleteConfirm Data={enrollment} onSuccess={() => {
      closeModal()
      setEnrollment("")
    }} /> })
  }

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation_id && { formation: formation_id }),
      ...(school_year_id && { school_year: school_year_id }),
      ...(semester_id && { semester: semester_id }),
      ...(status && { status }),
      ...(page && { page }),
    };
  }, [debouncedSearch, page, formation_id, school_year_id, status, semester_id]);

  const { data, isLoading: isDataLoading } = useEnrollments(filters);
  const results = data?.results || [];
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / PAGINATION_SIZE));

  const columns = [
    {
      header: "Etudiants", key: "student",
      render: (student) => student.first_name || student.last_name ? `${student.first_name} ${student.last_name}` : "-"
    },
    {
      header: "Parcours", key: "formation",
      render: (formation) => formation.text
    },
    {
      header: "Semestres", key: "semester",
      render: (semester) => semester.code
    },
    {
      header: "Année", key: "school_year",
      render: (sy) => sy.text
    },
    { header: "Statut", key: "status" ,render : (val) => val == "VALIDATED"? "Validé" : val == "NOT_VALIDATED" ? "Non Validé" : "Active" },
  ];


  const canDelete = [ROLES.DEPARTMENT_HEAD,ROLES.DEPARTMENT_SECRETARY].includes(role)
  const canGetBulletin = canDelete || role == ROLES.REGISTRAR_OFFICER

  const actions = [
    {
      label: "Supprimer",
      handler: handleDelete,
      conditionGlobal: canDelete
    },
  ];



  return (
    <Card>
      <div className="px-2 py-2 flex justify-between">
        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>
            Filtres
          </Button>
        </div>
        <SearchInput
          placeholder="Rechercher..."
          className="w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showFilters && (
        <div className="ml-2 mb-2">
          <div className="flex flex-wrap gap-4 border-b pb-4 mb-2 border-slate-200">
            <SearchableSelect
              label="Parcours"
              selectedValue={formation}
              onSelect={handleSelectFormation}
              onClear={() => setFormation_id("")}
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

            <SearchableSelect
              label="Année scolaire"
              selectedValue={school_year}
              onSelect={handleSelectSy}
              onClear={() => setSchool_year_id("")}
              options={syOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.text || option.label || option.name}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={sydd}
              loading={syFetching}
              placeholder="Rechercher une année"
              width="w-[200px]"
            />

            <SearchableSelect
              label="Semestre"
              selectedValue={semester}
              onSelect={handleSelectSemester}
              onClear={() => setSemester_id("")}
              options={sOptionResults}
              renderOption={(option) => (
                <div className="flex gap-x-2 items-center">
                  <div>{option.code || option.order}</div>
                  {option.code && <Badge content={option.code} color="blue" />}
                </div>
              )}
              searchDropdownProps={sdd}
              loading={sFetching}
              placeholder="Rechercher un semestre"
              width="w-[200px]"
            />

            {/* status */}
            <div>
              <label className="text-slate-600 text-sm font-bold block mb-1">Statut</label>
              <Filter
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                otherOptions={[
                  { key: "Tous", value: "" },
                  { key: "Actif", value: "ACTIVE" },
                  { key: "Validé", value: "VALIDATED" },
                  { key: "Non Validé", value: "NOT_VALIDATED" },
                ]}
                className="w-[200px] h-[38px]"
              />
            </div>
          </div>
        </div>
      )}

      {isDataLoading ? (
        <div className="flex justify-center text-slate-500 text-[13px] items-center h-[400px]">
          Chargement...
        </div>
      ) : results.length !== 0 ? (
        <DataTable
          data={results}
          columns={columns}
          actions={actions}
          selectionMode={"single"}
          onSelectionChange={handleSelectEnrollment}
        />
      ) : (
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
  );
}

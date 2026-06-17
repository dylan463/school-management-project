import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo, useState, useEffect } from "react"
import useDebounced from '../../hooks/useDebounced'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import useDRFErrors from "../../hooks/useDRFError"
import { toast } from 'react-toastify'
import Badge from "../Badge"
import Filter from "../Filter"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useNavigate } from 'react-router-dom'

import { useEnrollments } from "../../hooks/enrollments/useEnrollments"
import { useSearchDropdown } from "../../hooks/useSearchDropdown"
import SearchableSelect from "../SearchableSelect"

import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useSchoolyear } from "../../hooks/schoolyears/useSchoolyear"
import { useFormations } from "../../hooks/formations/useFormations"
import { useFormation } from "../../hooks/formations/useFormation"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSelected } from "../../context/SelectedContext"
import Switch from "../Switch"
import { useChangeEnrollmentStatus } from "../../hooks/enrollments/useChangeEnrollmentStatus"
import { useAutoDeliberation } from "../../hooks/enrollments/useAutoDeliberation"  // ← AJOUT


export default function DeliberationPanel() {
  const { openModal, closeModal } = useModal();
  const { selected: SelectedEnrollment, setSelected: setSelectedEnrollment } = useSelected()
  const navigate = useNavigate();

  const { search, page, setSearch, setPage, school_year: schoolyear, formation, setFormation, semester, enrollment, setEnrollment, setSemester, status, setStatus } = useQueryParams({
    search: { key: "search", type: "string", default: "" },
    page: { key: "page", type: "number", default: 1 },
    formation: { key: "formation", type: "string", default: "" },
    semester: { key: "semester", type: "string", default: "" },
    status: { key: "status", type: "string", default: "NOT_DELIBERATED" },
    enrollment: { key: "enrollment", type: "string", default: "" },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("page")) setPage(1);
    if (!params.get("status")) setStatus("NOT_DELIBERATED")
  }, []);

  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebounced(search);

  const changeEnrollmentStatusMutation = useChangeEnrollmentStatus();
  const autoDeliberationMutation = useAutoDeliberation();  // ← AJOUT

  // Filters hooks
  const { value: formationValue, query: formationQuery, onChange: formationOnChange, isOpen: formationIsOpen, close: formationClose, containerRef: formationContainerRef } = useSearchDropdown({ delay: 300, minChars: 1 });
  const { data: formationOptions, isFetching: isFormationFetching } = useFormations(formationQuery ? { search: formationQuery } : {}, formationQuery.length >= 1, 0);
  const formationOptionResults = formationOptions?.results || [];
  const { data: formationData } = useFormation(formation);

  const { data: semesterOptions, isSemesterFetching } = useSemesters({ no_pagination: true })
  const semesterOptionResults = semesterOptions || []

  const { data: activeSyData } = useSchoolyears({ status: "ACTIVE", no_pagination: true })
  const activeSy = activeSyData?.[0] || null

  const handleSelectFormation = (selectedFormation) => {
    setFormation(selectedFormation.id);
    formationClose();
  };

  const handleSelectEnrollment = (selectedEnrollment) => {
    const enrollmentId = selectedEnrollment?.[0]?.id || ""
    setEnrollment(enrollmentId);
    setSelectedEnrollment(enrollmentId)
  }

  const filters = useMemo(() => {
    return {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(formation && { formation: formation }),
      ...(semester && { semester }),
      ...(status && { status }),
      ...(page && { page }),
    };
  }, [debouncedSearch, page, formation, schoolyear, status, semester]);

  const { data, isLoading: isDataLoading } = useEnrollments(filters);
  const results = data?.results || [];
  const totalPages = Math.max(1, Math.ceil((data?.count || 0) / PAGINATION_SIZE));

  // ── AJOUT : handler délibération automatique ──────────────────────────────
  const handleAutoDeliberation = () => {
    // On transmet les filtres actifs pour cibler le même sous-ensemble
    // que ce qui est affiché à l'écran (même semestre / même parcours)
    const payload = {
      ...(semester  && { semester:  Number(semester)  }),
      ...(formation && { formation: Number(formation) }),
    }

    autoDeliberationMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Les étudiant qui ont validé tout leur UE sont validés.")
      },
      onError: () => {
        toast.error("Erreur lors de la délibération automatique.")
      },
    })
  }
  // ─────────────────────────────────────────────────────────────────────────

  const columns = [
    {
      header: "Etudiant", key: "student",
      render: (student) => student.first_name || student.last_name ? `${student.first_name} ${student.last_name}` : "-"
    },
    {
      header: "Parcours", key: "formation",
      render: (formation) => formation.text
    },
    {
      header: "Semestre", key: "semester",
      render: (semester) => semester.code
    },
    {
      header: "Année", key: "school_year",
      render: (sy) => sy.text
    },
    { header: "Statut", key: "status" ,render : (val) => val == "VALIDATED"? "Validé" : val == "NOT_VALIDATED" ? "Non Validé" : "Active" },
  ];

  const actions = [
    {
      label: "Annuler",
      handler: (row) => changeEnrollmentStatusMutation.mutate({ id: row.id, data: { status: "ACTIVE" } }, {
        onSuccess: () => {
          toast.success("Inscription annulée avec succès")
        },
        onError: (error) => {
          toast.error("Erreur lors de l'annulation de l'inscription")
        }
      }),
      conditionGlobal: status == "DELIBERATED" && !!activeSy
    },
  ];

  const statusTabs = [
    { key: "non délibéré", value: "NOT_DELIBERATED" },
    { key: "délibéré", value: "DELIBERATED" },
  ]

  return (
    <div>
      <Card className="p-4 mb-4">
        {activeSy ? `Année scolaire active : ${activeSy.text}` : "Aucune année scolaire active"}
      </Card>
      <Card>
        <div className="px-2 py-2 flex justify-between">
          <div className="flex items-center gap-2">
            <Switch
              tabs={statusTabs}
              active={status}
              onChange={(value) => setStatus(value)}
            />
            <Button variant="primary" onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>

            {/* ── AJOUT : bouton Délibération Automatique ───────────────────
                - Visible uniquement sur l'onglet "non délibéré"
                - Visible uniquement quand une année scolaire est active
                - Désactivé pendant le traitement (isPending)
                - Placé dans la même barre d'outils, à droite de "Filtres"
            ─────────────────────────────────────────────────────────────── */}
            {status === "NOT_DELIBERATED" && activeSy && (
              <Button
                variant="secondary"
                onClick={handleAutoDeliberation}
                disabled={autoDeliberationMutation.isPending}
              >
                {autoDeliberationMutation.isPending
                  ? "Traitement en cours..."
                  : "Délibération Automatique"}
              </Button>
            )}

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
              {/* Parcours */}
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Parcours</label>
                <SearchableSelect
                  label={null}
                  selectedValue={formationData}
                  onSelect={(selected) => {
                    handleSelectFormation(selected)
                  }}
                  onClear={() => setFormation(null)}
                  options={formationOptionResults}
                  renderOption={(option) => option.text || option.name}
                  renderSelected={(selected) => selected?.text || selected?.name}
                  searchDropdownProps={{
                    value: formationValue,
                    onChange: formationOnChange,
                    isOpen: formationIsOpen,
                    close: formationClose,
                    containerRef: formationContainerRef,
                  }}
                  loading={isFormationFetching}
                  placeholder="Rechercher..."
                  width="w-[200px]"
                />
              </div>

              {/* Semestre */}
              <div>
                <label className="text-slate-600 text-sm font-bold block mb-1">Semester</label>
                <Filter
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  otherOptions={[
                    { key: "Toutes", value: "" },
                  ]}
                  options={semesterOptionResults}
                  render={(value) => value.code}
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
            selectionMode={activeSy ? "single" : false}
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
    </div>
  );
}

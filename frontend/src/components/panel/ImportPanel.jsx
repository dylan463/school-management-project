import Card from "../ui/Card"
import SearchInput from "../SearchInput"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo } from "react"
import useDebounced from '../../hooks/useDebounced'
import Paginator from '../Paginator'
import { PAGINATION_SIZE } from "../../utils/constants"
import { useModal } from '../../context/ModalContext'
import { useState, useEffect } from "react"
import useDRFErrors from "../../hooks/useDRFError"
import { toast } from 'react-toastify'
import { useImportJobs } from "../../hooks/importJobs/useImportJobs"
import { useQueryParams } from "../../hooks/useQueryParams"
import { useDeleteImportJob } from "../../hooks/importJobs/useDeleteImportJob"
import Filter from "../Filter"

function DeleteConfirm({ Data, onSuccess }) {
  const destroy = useDeleteImportJob();
  const [loading, setLoading] = useState(false);
  const { handleErrors } = useDRFErrors();

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await destroy.mutateAsync(Data.id);
      toast.success("Importation supprimé avec succès");
      onSuccess?.();
    } catch (error) {
      handleErrors(error);
      const msg = error.response?.data?.detail || "Une erreur est survenue";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3">
      <p>
        Voulez-vous vraiment supprimer l'importation?
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={handleConfirm} disabled={loading} variant="primary">
          {loading ? "Suppression..." : "Supprimer"}
        </Button>
      </div>
    </div>
  );
}

export default function ImportPanel() {
  const { page,setPage } = useQueryParams({
    page: { key: "import_page", type: "number", default: 1 },
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.get("import_page")) {
      setPage(1);
    }
  }, []);

  const { openModal, closeModal } = useModal();

  const filters = useMemo(() => {
    return {
      ...(page && { page }),
    };
  }, [page]);

  const { data, isLoading } = useImportJobs(filters);
  const results = data?.results || [];
  const totalPages = Math.max(
    1,
    Math.ceil((data?.count || 0) / PAGINATION_SIZE)
  );
  const linkClassName = 'font-bold text-slate-700 hover:text-slate-500'

  const columns = [
    { header: "Id", key: "id" },
    { header: "Date", key: "created_at" ,render:(value)=>{
      const date = new Date(value);
      const formatted =
          String(date.getDate()).padStart(2, "0") + "/" +
          String(date.getMonth() + 1).padStart(2, "0") + "/" +
          date.getFullYear() + " " +
          String(date.getHours()).padStart(2, "0") + ":" +
          String(date.getMinutes()).padStart(2, "0");
      return formatted
    }},
    { header: "Type", key: "import_type" ,render : (value) =>{
      return value === "STUDENT_CREATION" ? "creation-etudiant" : "inscription"
    }},
    { header: "status", key: "status"},
    { header: "fichier", key: "input_file" ,render: (value)=>{
      return (
        <a className={linkClassName} href={value}>Télécharger fichier</a>
      )
    }},
    { header: "rapport", key: "report_file" ,render: (value)=>{
      return (
        <a className={linkClassName} href={value}>{value ? "Télécharger rapport" : "Aucun rapport disponible"}</a>
      )
    }},
  ];

  const actions = [
    {
      label: "Supprimer",
      handler: (row) =>
        openModal({
          title: `Supprimer ${row.first_name} ${row.last_name}`,
          content: <DeleteConfirm Data={row} onSuccess={closeModal} />,
        }),
    },
  ];

  return (
    <Card >
      <div className="px-2 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2"></div>
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
      <Paginator totalPages={totalPages} page={page} setPage={setPage} />
    </Card>
  );
}

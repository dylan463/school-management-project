import { useDebts } from "../../hooks/debts/useDebts"
import { useState, useMemo } from "react"
import Switch from "../Switch"
import Badge from "../Badge"
import DataTable from "../DataTable"
import Card from "../ui/Card"

const DebtPanel = ({ enrollmentId }) => {
    const [paid, setPaid] = useState(false)

    const filters = useMemo(() => {
        return {
            ...(enrollmentId && { enrollment: enrollmentId }),
            no_pagination: true,
            cleared: paid
        }
    }, [enrollmentId, paid])

    const { data, isLoading } = useDebts(filters)
    const debtResults = data ? data : []

    const columns = [
        { header: "Semestre", key: "semester" },
        { header: "Module", key: "course_module" },
        { header: "Parcour", key: "formation" },
        { header: "Année", key: "school_year" },
        { header: "Statut", key: "cleared", render: (value) => value ? <Badge content="Payé" color="green" /> : <Badge content="Non payé" color="red" /> }
    ]
    if (isLoading || !enrollmentId) return

    return (
        <Card className="p-2 flex gap-2 min-h-[200px] flex-col">
            <Switch
                tabs={[
                    { key: "Réglée", value: true },
                    { key: "Non Réglée", value: false },
                ]}
                active={paid}
                onChange={(value) => setPaid(value)}
            />
            {debtResults?.length > 0 ? (
                <DataTable
                    data={debtResults}
                    columns={columns}
                    selectionMode={false}
                />
            ) : (
                <div>Aucune dette</div>
            )}
        </Card>
    )
}
export default DebtPanel
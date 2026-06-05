import Card from "../ui/Card"
import Button from "../ui/Button"
import DataTable from '../DataTable'
import { useMemo } from "react"
import { useEnrollment } from "../../hooks/enrollments/useEnrollment"
import { useResults } from "../../hooks/results/useResults"
import { useSearchParams } from "react-router-dom"
import { useSelected } from "../../context/SelectedContext"
import DebtPanel from "./DebtPanel"

function HistoryResultPanel() {
    const { selected: enrollment, setSelected: setEnrollment } = useSelected()
    const { data: enrollmentData, isEnrollmentDataLoading } = useEnrollment(enrollment ? enrollment : null)
    const filters = useMemo(() => {
        return {
            ...(enrollment && { enrollment }),
            no_pagination: true
        }
    }, [enrollment])
    const { data: enrollmentResultData, isLoading: isResultsLoading } = useResults(filters)
    const enrollmentResults = enrollment && enrollmentResultData ? enrollmentResultData : []

    const columns = [
        { header: "UE", key: "course_unit" },
        { header: "EC", key: "course_module" },
        { header: "Note", key: "final_score" },
        { header: "Credit", key: "course_credit" },
        { header: "Status", key: "status" }
    ]
    const isLoading = isEnrollmentDataLoading || isResultsLoading
    if (!enrollmentData) return

    const student = enrollmentData.student;
    const prenoms = student.first_name;
    const nom = student.last_name;
    return (
        <>
            {!isLoading ? (
                <Card>
                    {/* enrollment informations */}
                    <div className="flex gap-2 min-h-[100px] justify-between pt-4 pb-4 border-b border-gray">
                        <div className="flex">
                            <div className="relative ml-4 mr-4">
                                <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-white shadow-md">
                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-4xl font-bold text-gray-500 select-none">
                                        {prenoms.charAt(0)}{nom.charAt(0)}
                                    </div>
                                </div>
                            </div>
                            <div className="mr-4">
                                <h2 className="text-2xl font-bold">
                                    {enrollmentData.student.first_name} {enrollmentData.student.last_name}
                                </h2>
                                <div>
                                    {enrollmentData.student.username}
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div>
                                    {enrollmentData.formation.text}
                                </div>
                                <div>
                                    {enrollmentData.semester.code}
                                </div>
                                <div>
                                    {enrollmentData.school_year.text}
                                </div>
                            </div>
                        </div>
                        {/* <div className="mr-4">
                            Moyenne générale
                        </div> */}
                    </div>
                    {/* results */}
                    {enrollmentResultData?.length > 0 &&
                        <>
                            <DataTable
                                data={enrollmentResults}
                                columns={columns}
                            />
                        </>
                    }
                </Card>
            ) :
                <div>
                    Chargement...
                </div>}
            <DebtPanel enrollmentId={enrollment} />
        </>

    )
}

export default HistoryResultPanel
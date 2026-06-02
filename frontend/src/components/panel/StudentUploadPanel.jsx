import { useState, useEffect, useRef } from "react"
import Card from "../ui/Card"
import Filter from "../Filter"
import Button from "../ui/Button"
import { useTaskPolling } from "../../hooks/Usetaskpolling"
import { useFormations } from "../../hooks/formations/useFormations"
import { useSemesters } from "../../hooks/semesters/useSemesters"
import { useSchoolyears } from "../../hooks/schoolyears/useSchoolyears"
import { useQueryParams } from '../../hooks/useQueryParams'
import { useImportJobs } from '../../hooks/importJobs/useImportJobs'
import api from '../../services/api'
import { toast } from "react-toastify"
import { useMutation, useQueryClient } from '@tanstack/react-query'
// ─── Icônes ───────────────────────────────────────────────────────────────────

function UploadIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path d="M12 16V4" />
            <path d="M7 9L12 4L17 9" />
            <path d="M4 20H20" />
        </svg>
    )
}

function FileIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-red-400">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    )
}

function AlertIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    )
}

// ─── Barre de progression ─────────────────────────────────────────────────────

function ProgressRow({ status, progress }) {
    if (!progress) return null

    const isSuccess = status === "COMPLETE"

    const barColor = isSuccess ? "bg-emerald-500" : "bg-blue-500"
    const bgColor = isSuccess ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-500"

    return (
        <div className={`rounded px-3 h-[35px] mb-2 flex items-center justify-between gap-3 ${bgColor}`}>
            <div className="flex-1 overflow-hidden">
                <div className="h-1 bg-white/60 rounded-full mt-0.5 overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${progress.percent}%` }}
                    />
                </div>
            </div>
            <span className="text-xs font-bold tabular-nums shrink-0">{progress.percent}%</span>
        </div>
    )
}

// ─── Résultat final ───────────────────────────────────────────────────────────

function ResultBadges({ result }) {
    if (!result) return null

    return (
        <div className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="flex gap-4 text-xs">
                <a href={result.report_file} className="bg-green-600 text-white font-bold flex items-center justify-center w-full h-[35px] rounded-lg">Télécharcher le Rapport</a>
            </div>
        </div>
    )
}

// ─── Composant principal ──────────────────────────────────────────────────────

const StudentUploadPanel = () => {
    // ── Données des filtres ────────────────────────────────────────────────────
    const { data: formations, isLoading: isLoadingFormations } = useFormations({ page_size: 100, status: 'OPEN' })
    const { data: semesters, isLoading: isLoadingSemesters } = useSemesters({ page_size: 100, is_active: true })
    const { data: schoolyears, isLoading: isLoadingSchoolyears } = useSchoolyears({ page_size: 100, is_active: true })

    // ── État des filtres ───────────────────────────────────────────────────────
    const [filters, setFilters] = useState({
        formation: "",
        school_year: "",
        semester: "",
    })

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    // ── Fichier ────────────────────────────────────────────────────────────────
    const [file, setFile] = useState(null)
    const [dragOver, setDragOver] = useState(false)
    const [fileError, setFileError] = useState(null)
    const fileInputRef = useRef(null)

    const ACCEPTED = ["csv"]

    const handleFile = (f) => {
        if (!f) return
        const ext = f.name.split(".").pop().toLowerCase()
        if (!ACCEPTED.includes(ext)) {
            setFileError(`Format non accepté. Utilisez : ${ACCEPTED.join(", ")}`)
            return
        }
        setFile(f)
        setFileError(null)
    }

    const onDrop = (e) => {
        e.preventDefault()
        setDragOver(false)
        handleFile(e.dataTransfer.files[0])
    }


    // ── Upload + Celery ────────────────────────────────────────────────────────
    const [job_id, setJob_id] = useState(null)
    const { data: jobs, isLoading: isJobsLoading } = useImportJobs({ import_type: "STUDENT_CREATION", status: "LOADING" })

    useEffect(() => {
        if (isJobsLoading || !jobs) return;
        const { results } = jobs
        const pendingJobs = results.filter(job => ["PENDING","PROGRESS"].includes(job.status))
        setJob_id(pendingJobs[0]?.id || null)
    }, [jobs])

    const { status, progress, result } = useTaskPolling(job_id)
    const [uploading, setUploading] = useState(false)

    const filtersComplete = filters.formation && filters.school_year && filters.semester
    const isRunning = job_id && !status === "pending"

    const queryClient = useQueryClient()

    const handleSubmit = async () => {
        if (!file || !filtersComplete) return

        setUploading(false)

        const formData = new FormData()
        formData.append("file", file)
        formData.append("formation", filters.formation)
        formData.append("school_year", filters.school_year)
        formData.append("semester", filters.semester)

        try {
            const { data } = await api.post("/portal/students/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            queryClient.invalidateQueries({
                queryKey: ['importJobs', { import_type: "STUDENT_CREATION", status: "LOADING" }],
            })
        } catch (err) {
            toast.error(err.response.data.detail || "une erreur est survenue pendant le televersement")
        } finally {
            setUploading(false)
        }
    }

    const loadingFilters = isLoadingFormations || isLoadingSchoolyears || isLoadingSemesters || isJobsLoading
    const canSubmit = file && filtersComplete && !isRunning && !uploading && !loadingFilters && !job_id

    // ─── Rendu ──────────────────────────────────────────────────────────────────
    return (
        <Card className="ml-4 w-[400px]">
            <div className="bg-surface-container-lowest rounded-card shadow-card border border-surface-variant/60 p-6 flex flex-col h-full relative">
                {/* Description */}
                <div className="mb-4">
                    <p className="font-body-md text-body-md text-secondary">
                        Définissez le contexte d'importation puis glissez votre fichier CSV.
                    </p>
                </div>

                {/* Filtres */}
                <div className="mb-4 flex flex-col gap-3">
                    <Filter
                        value={filters.formation}
                        label="Parcours"
                        onChange={handleFilterChange}
                        name="formation"
                        options={formations ? formations.results : []}
                        otherOptions={[{ key: loadingFilters ? "Chargement…" : "Choisissez une formation", value: "" }]}
                        render={(f) => f.text ?? f.code ?? f}
                        className="grid grid-cols-1"
                    />
                    <Filter
                        value={filters.school_year}
                        label="Année scolaire"
                        onChange={handleFilterChange}
                        name="school_year"
                        options={schoolyears ? schoolyears.results : []}
                        otherOptions={[{ key: loadingFilters ? "Chargement…" : "Choisissez une année", value: "" }]}
                        render={(y) => y.text ?? y.code ?? y}
                        className="grid grid-cols-1"
                    />
                    <Filter
                        value={filters.semester}
                        label="Semestre"
                        onChange={handleFilterChange}
                        name="semester"
                        options={semesters ? semesters.results : []}
                        otherOptions={[{ key: loadingFilters ? "Chargement…" : "Choisissez un semestre", value: "" }]}
                        render={(s) => s.code ?? s.order ?? s}
                        className="grid grid-cols-1"
                    />
                </div>

                {/* Zone de drop — masquée pendant le traitement */}
                {!isRunning && (
                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={[
                            "border-2 border-dashed rounded-xl mx-auto w-[200px] h-[200px]",
                            "flex flex-col items-center justify-center text-center mb-4 cursor-pointer",
                            "transition-colors duration-200 relative overflow-hidden",
                            dragOver
                                ? "border-red-400 bg-red-50"
                                : file
                                    ? "border-emerald-400 bg-emerald-50"
                                    : "border-red-300 hover:border-red-400 hover:bg-red-50/40",
                        ].join(" ")}
                    >
                        <div className="mb-3">
                            {file ? <FileIcon /> : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-red-300">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            )}
                        </div>

                        {file ? (
                            <>
                                <p className="text-xs font-semibold text-emerald-700 px-3 truncate w-full text-center">{file.name}</p>
                                <p className="text-[11px] text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} Ko</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Cliquez pour changer</p>
                            </>
                        ) : (
                            <>
                                <p className="font-body-md text-body-md text-secondary mb-3 px-2 text-xs">
                                    Glissez et déposez votre fichier ou cliquez pour parcourir
                                </p>
                                <span className="font-label-md text-label-md text-secondary bg-surface-variant/50 px-3 py-1 rounded text-[11px] text-slate-500">
                                    Formats acceptés : .csv, .xlsx
                                </span>
                            </>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx"
                            onChange={(e) => handleFile(e.target.files[0])}
                            className="hidden"
                        />
                    </div>
                )}

                {/* Erreurs */}
                {(fileError) && (
                    <div className="mb-2 flex items-start gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertIcon />
                        <span>{fileError}</span>
                    </div>
                )}

                {/* Barre de progression */}
                <ProgressRow status={status} progress={progress} />

                {/* Résultats */}
                <ResultBadges result={result} />

                {/* Boutons */}
                <Button
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    className={!canSubmit ? "opacity-50 cursor-not-allowed" : ""}
                >
                    {uploading || isRunning ? (
                        <>
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                            </svg>
                            {uploading ? "Envoi en cours…" : "Traitement en cours…"}
                        </>
                    ) : (
                        <>
                            <UploadIcon />
                            Démarrer l'importation
                        </>
                    )}
                </Button>

            </div>
        </Card>
    )
}

export default StudentUploadPanel
import { useState, useEffect, useRef, useCallback } from "react";
import { importJobServices } from "../services/portalService"

const POLL_INTERVAL_MS = 1500;

/**
 * Hook pour poller la progression d'une tâche Celery via l'objet axios `api`.
 *
 * @param {string|null} jobId   - L'ID de la tâche retourné par le backend
 * @returns {{ state, progress, result, error, isPolling }}
 */
export function useTaskPolling(jobId) {
    const [status, setStatus] = useState(null);
    const [progress, setProgress] = useState(null);
    const [result, setResult] = useState(null);
    const [isPolling, setIsPolling] = useState(false);

    const intervalRef = useRef(null);

    const stopPolling = useCallback(() => {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsPolling(false);
    }, []);

    const poll = useCallback(async () => {
        if (!jobId) return;
        try {
            const data = await importJobServices.retrieve(jobId)
            setStatus(data.status);
            setProgress({
                percent: data.total_rows !== 0 ? Math.round((data.processed_rows / data.total_rows) * 100) : 0,
                success_count: data.success_count,
                error_count: data.error_count,
                total_rows: data.total_rows,
                processed_rows: data.processed_rows,
            });

            if (data.status === "COMPLETED") {
                setResult({ input_file: data.input_file, report_file: data.report_file })
                stopPolling();
            }
        } catch (err) {
            stopPolling();
        }
    }, [jobId, stopPolling]);

    useEffect(() => {
        if (!jobId) return;

        setStatus("PENDING");
        setProgress({ percent: 0, success_count: 0, error_count: 0, total_rows: 0, processed_rows: 0 });
        setResult(null);
        setIsPolling(true);

        poll();
        intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);

        return () => stopPolling();
    }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

    return { status, progress, result, isPolling };
}
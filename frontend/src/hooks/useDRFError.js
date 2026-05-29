import { useState } from "react";

function useDRFErrors() {
    const [errors, setErrors] = useState({});

    const handleErrors = (err) => {
        if (err.response?.data) setErrors(err.response.data);
    };

    const getError = (field) => {
        const val = errors[field];
        return Array.isArray(val) ? val[0] : val ?? null;
    };

    const clearErrors = () => setErrors({});

    return { errors, handleErrors, getError, clearErrors };
}

export default useDRFErrors
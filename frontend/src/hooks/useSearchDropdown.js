import { useState, useEffect, useRef } from "react"
import useDebounced from "./useDebounced"

/**
 * Gère la valeur saisie, le debounce, l'ouverture du dropdown et le click-outside.
 *
 * @param {object} [params]
 * @param {number} [params.delay]    - Délai debounce ms (défaut : 300)
 * @param {number} [params.minChars] - Caractères min pour ouvrir (défaut : 2)
 *
 * @returns {{
 *   value    : string,   - Valeur brute → value= sur l'input
 *   query    : string,   - Valeur debounced → queryKey de useQuery
 *   onChange : Function, - Handler → onChange= sur l'input
 *   isOpen   : boolean,  - Contrôle l'affichage du dropdown
 *   close    : Function, - Vide le champ et ferme le dropdown
 *   containerRef : React.RefObject - ref= sur le div conteneur
 * }}
 */
export function useSearchDropdown({ delay = 300, minChars = 2 } = {}) {
    const [value, setValue] = useState("")
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)
    const query = useDebounced(value, delay)

    useEffect(() => {
        setIsOpen(query.length >= minChars)
    }, [query, minChars])

    useEffect(() => {
        if (!isOpen) return
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    return {
        value,
        query,
        onChange: (e) => setValue(e.target.value),
        isOpen,
        close: () => { setValue(""); setIsOpen(false) },
        containerRef,
        enabled:query.length >= minChars
    }
}
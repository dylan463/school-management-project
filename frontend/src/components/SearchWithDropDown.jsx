import { useId } from "react"

/**
 * Composant purement contrôlé — aucune logique interne.
 * Brancher avec useSearchDropdown dans le parent.
 *
 * @param {object}   props
 * @param {string}   props.value          - Valeur du champ (depuis useSearchDropdown)
 * @param {Function} props.onChange        - Handler input (depuis useSearchDropdown)
 * @param {boolean}  props.isOpen          - Contrôle le dropdown (depuis useSearchDropdown)
 * @param {React.RefObject} props.containerRef  - Ref du conteneur (depuis useSearchDropdown)
 * @param {Array}    props.options          - Résultats à afficher
 * @param {Function} props.onSelect         - Appelé avec l'option choisie
 * @param {Function} props.renderOption     - (option) => ReactNode
 * @param {boolean}  [props.loading]
 * @param {string}   [props.placeholder]
 * @param {string}   [props.className]
 */
export default function SearchWithDropdown({
    value,
    onChange,
    isOpen,
    containerRef,
    options = [],
    onSelect,
    renderOption,
    loading = false,
    placeholder = "Rechercher...",
    className = "",
    inputClassName = "",
}) {
    const inputId = useId()
    const showDropdown = isOpen && !loading

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <input
                id={inputId}
                type="text"
                role="combobox"
                aria-expanded={showDropdown}
                aria-autocomplete="list"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`bg-[#f5f3f4] rounded-[5px] h-[35px] px-2 text-[13px] outline-none focus:border-blue-400 ${inputClassName}`}
            />

            {loading && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                    …
                </span>
            )}

            {showDropdown && (
                <ul
                    role="listbox"
                    className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {options.length > 0 ? (
                        options.map((option) => (
                            <li key={option.id} role="option">
                                <button
                                    type="button"
                                    onClick={() => onSelect?.(option)}
                                    className="w-full h-[35px] text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                                >
                                    {renderOption?.(option)}
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="px-3 py-2 text-xs h-[35px] text-slate-500">
                            Aucun résultat trouvé
                        </li>
                    )}
                </ul>
            )}
        </div>
    )
}
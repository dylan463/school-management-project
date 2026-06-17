import SearchWithDropdown from "./SearchWithDropDown"

/**
 * Composant de sélection réutilisable qui alterne entre:
 * - Mode recherche: affiche SearchWithDropdown
 * - Mode sélectionné: affiche la valeur avec bouton "Changer"
 * 
 * @param {object} props
 * @param {string} props.label - Label du filtre
 * @param {object} props.selectedValue - Objet sélectionné (ou null)
 * @param {Function} props.onSelect - Callback quand l'utilisateur sélectionne un élément
 * @param {Function} props.onClear - Callback quand l'utilisateur clique "Changer"
 * @param {Array} props.options - Tableau des options disponibles
 * @param {Function} props.renderOption - (option) => string|ReactNode pour afficher une option
 * @param {Function} props.renderSelected - (selectedValue) => string pour afficher la valeur sélectionnée
 * @param {object} props.searchDropdownProps - Props pour le SearchWithDropdown (value, onChange, isOpen, close, containerRef)
 * @param {boolean} props.loading - État de chargement
 * @param {string} props.placeholder - Placeholder pour la recherche
 * @param {string} props.width - Largeur du composant (ex: "w-[220px]")
 */
export default function SearchableSelect({
    label,
    selectedValue,
    onSelect,
    onClear,
    options = [],
    renderOption,
    renderSelected,
    searchDropdownProps,
    loading = false,
    placeholder = "Rechercher...",
    width = "w-[220px]",
}) {
    return (
        <div>
            {label && (
                <label className="text-slate-600 font-bold text-sm block mb-1">
                    {label}
                </label>
            )}

            {!selectedValue ? (
                <SearchWithDropdown
                    {...searchDropdownProps}
                    options={options}
                    onSelect={onSelect}
                    renderOption={renderOption}
                    loading={loading}
                    placeholder={placeholder}
                    inputClassName={width}
                />
            ) : (
                <div className={`flex items-center justify-between border h-[38px] ${width} rounded-md px-3 py-2 bg-white`}>
                    <span className="text-sm truncate">
                        {renderSelected ? renderSelected(selectedValue) : selectedValue?.text || selectedValue?.code}
                    </span>
                    <button
                        type="button"
                        onClick={onClear}
                        className="text-xs text-red-500 hover:underline ml-2"
                    >
                        Changer
                    </button>
                </div>
            )}
        </div>
    )
}

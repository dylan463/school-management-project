import { useState,useEffect,useId } from "react"
import Badge from "./badge"

export default function SearchSelect({
    clickOutside = "search-clickoutside",
    label='',
    contents = [],
    search = '',
    setSearch = (value)=>{},
    searchLoading=false,
    debouncedSearch,
    selectedContent = null,
    onSelectContent = (content) => {},
    BadgeContent = [],
    displayAttr,
    displayPlaceholder,
    noDisplay = false,
}){
    const [showDropDown,setShowDropDown] = useState(false)

    useEffect(() => {
        if (debouncedSearch && !searchLoading){
            setShowDropDown(true)
        }else{
            setShowDropDown(false)
        }  
    },[debouncedSearch,searchLoading])


    useEffect(() => {
        const handleClickOutside = (event) => {
        if (showDropDown && !event.target.closest(`.${clickOutside}-container`)) {
            setShowDropDown(false)
        }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showDropDown])

    const fiedId = useId()
    const displayId = useId()

    return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
        {label && <label htmlFor={fiedId} className="text-xs font-medium text-slate-600">{label}</label>}
        <div className={`relative ${clickOutside}-container flex-1`}>
        <input
            type="text"
            id={fiedId}
            name={fiedId}
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
        />
        
        {/* Dropdown des résultats */}
        { !searchLoading && showDropDown && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {contents.length > 0 ? contents.map((content) => (
                <button
                type="button"
                key={content.id}
                onClick={() => {onSelectContent(content);setSearch('')}}
                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                >
                    {BadgeContent.map((func,index) =>{
                        return (
                        <div key={index}>
                            {Badge(func(content))}
                        </div>
                        )
                    }
                    )}
                </button>
            )) : (
                <div className="px-3 py-2 text-xs text-slate-500">
                Aucun résultat trouvé
                </div>
            )}
            </div>
        )}
        </div>
        
        {/* Selected school year display */}
        {!noDisplay && <div className="flex-1">
        <input
            type="text"
            name={displayId}
            id={displayId}
            value={selectedContent? selectedContent[displayAttr] : ''}
            readOnly
            placeholder={displayPlaceholder}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-slate-600"
        />
        </div>}
    </div>
    )
}
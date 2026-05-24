import { useState,useEffect,useId } from "react"

export default function SearchWithDropDown({
    contents = [],
    search = '',
    setSearch = (value)=>{},
    searchLoading=false,
    debouncedSearch,
    setSelectContent = (content) => {},
    contentDisplay = (content) => <div></div>
}){
    const fiedId = useId()
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
        if (showDropDown && !event.target.closest(`.${fiedId}-container`)) {
            setShowDropDown(false)
        }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showDropDown])
    return (
    <div className="flex items-center gap-2 mt-2 flex-wrap">
        <div className={`relative ${fiedId}-container flex-1`}>
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
                onClick={() => {setSelectContent(content);setSearch('')}}
                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                >
                    {BadgeContent.map((func,index) =>{
                        return (
                        <div key={index}>
                            {contentDisplay(content)}
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
    </div>
    )
}
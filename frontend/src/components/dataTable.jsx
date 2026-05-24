import { useEffect, useState,useId } from "react"

export function CreateAction(text, color, onClick = (content) => { }, contentCondition = (content) => { return true }, condition = true) {
  return { text, color, onClick, contentCondition, condition }
}


function DataTable({
    renderCondition = true,
    renderFailText = "",
    noContentText = "Aucun élément trouvé",
    contents = null,
    tableheadNames = [],
    headActions = 'Actions',
    actions = [],
    Row = (content) => <><td></td></>,
    hasSelection = false,
    selectedItem = null,
    setSelectedItem = () => { }
}) {
    if (!contents){
        return <></>
    }
    tableheadNames.push(headActions)
    const [openMenuId, setOpenMenuId] = useState(null)
    const clickoutside = useId()
    useEffect(() => {
        const handleClickOutside = (event) => {
        if (
            openMenuId &&
            !event.target.closest(`.${clickoutside}-menu-container`)
        ) {
            setOpenMenuId(null)
        }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
        document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [openMenuId])
    return (
        <>
            <div className="p-2 h-96 overflow-y-auto">
            {!renderCondition ? (
                <p className="text-xs text-slate-500">
                {renderFailText}
                </p>
            ) : contents.length === 0 ? (
                <p className="text-xs text-slate-500">
                {noContentText}
                </p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            {tableheadNames.map((value,index) =>{<th key={index}>{value}</th>})}
                        </tr>
                    </thead>
                    <tbody>
                        {contents.map((content)=>{
                            const contentConditions = actions.map(ac => {
                                return (!!ac.contentCondition ? ac.contentCondition(content) : true) && ac.condition
                            }) 
                            return (
                                <tr 
                                key={content.id} 
                                className={`relative ${clickoutside}-menu-container ${
                                    hasSelection
                                    ? `w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 ${
                                        selectedItem?.id === content.id
                                            ? "bg-blue-100 text-blue-800 border border-blue-200 font-medium"
                                            : "hover:bg-slate-100 text-slate-700"}`
                                    : "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors mb-1 hover:bg-slate-100 text-slate-700"
                                }`}
                                onClick={()=> {
                                    if (!hasSelection) return
                                    if (content.id = selectedItem?.id){
                                        setSelectedItem(null)
                                        return
                                    }
                                    setSelectedItem(content)
                                }}
                                >
                                    {Row(content)}
                                    {/* bouton action et menu flottant */}
                                    <td>
                                        {contentConditions.includes(true) && (
                                            <>
                                                <button
                                                    onClick={(e)=>{
                                                        e.stopPropagation()
                                                        setOpenMenuId(openMenuId === content.id? null : content.id)
                                                    }}
                                                    className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                                                >
                                                    ⋮
                                                </button>
                                                {openMenuId == content.id && (
                                                    <div className="absolute right-0 top-8 bg-white border border-slate-200 rounded-lg shadow-lg z-10 w-[100px]">
                                                        {actions.map(({text,onClick,color='blue'},index)=>{
                                                            contentConditions[index] && (
                                                                <button 
                                                                key={index} 
                                                                onClick={()=>{onClick();setOpenMenuId(null)}}
                                                                className={`w-full text-left px-3 py-2 text-xs text-${color}-600 hover:bg-${color}-50`}
                                                                >
                                                                    {text}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}                    
                    </tbody>
                </table>
                )}
            </div>
        </>)
    }



export default DataTable
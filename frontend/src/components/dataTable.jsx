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
    setSelectedItem = () => { },
    headClassName = ''
}) {
    if (!contents){
        return <></>
    }
    const tableHead = [...tableheadNames,headActions]
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
            <div className="min-h-[200px]  w-full">
            {!renderCondition ? (
                <p className="min-h-[200px] grid grid-cols-1 items-center justify-items-center text-xs text-slate-500">
                {renderFailText}
                </p>
            ) : contents.length === 0 ? (
                <p className="min-h-[200px] grid grid-cols-1 items-center justify-items-center text-xs text-slate-500">
                {noContentText}
                </p>
            ) : (
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-tb border-['#f5e6d8] bg-[#fdf6f0] h-[40px]">
                            {tableHead.map((value,index) =>{return <th className={headClassName} key={index}>{value}</th>})}
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
                                className={`relative ${clickoutside}-menu-container border-b h-[40px] border-slate-200 w-full text-left px-3 py-2 transition-colors mb-1 ${
                                    hasSelection
                                    ? `${
                                        selectedItem?.id === content.id
                                            ? "bg-slate-200 text-blue-800 font-medium"
                                            : "hover:bg-slate-100 text-slate-700"}`
                                    : "hover:bg-slate-100 text-slate-700 "
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
                                    <td className="w-[40px]">
                                        {contentConditions.includes(true) ? (
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
                                                            return contentConditions[index] && (
                                                                <button 
                                                                key={index} 
                                                                onClick={()=>{onClick(content);setOpenMenuId(null)}}
                                                                className={`w-full text-left px-3 py-2 text-${color}-600 hover:bg-${color}-50`}
                                                                >
                                                                    {text}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        ) : ' '}
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
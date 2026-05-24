import { useId } from "react"

export default function SearchInput({
    placeholder = "",
    value = '',
    onChange = (e)=>{},
    className = "px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white w-full sm:w-56"
}){
    const fieldId = useId()
    return (
        <input type="text"
        id={fieldId}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={className}
        />
    )
}
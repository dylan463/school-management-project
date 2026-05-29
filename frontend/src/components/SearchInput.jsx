import { useId } from "react"

export default function SearchInput({
    placeholder = "",
    value = '',
    onChange = (e)=>{},
    className=''
}){
    className = `bg-[#f5f3f4] rounded-[5px] h-[35px] px-2 text-[13px] ${className}` 
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
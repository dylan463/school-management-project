import { useId } from "react"
export default function Filter({
  defaultValue,
  value,
  label = '',
  onChange,
  name = '',
  options = [],
  optionAttr = '',
  otherOptions = [],
}
) {
  const SelectId = useId()
  const selectValue = value !== undefined ? value : defaultValue
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={SelectId} className="text-xs font-medium text-slate-600">{label}</label>
      <select
        id={SelectId}
        name={!name ? SelectId : name}
        value={selectValue}
        onChange={(e) => onChange(e)}
        className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 bg-white"
      >
        {otherOptions.map((op, index) => (
          <option key={index} value={op.value}>
            {op.label}
          </option>
        ))}
        {options.map((op) => (
          <option key={op.id} value={op.id}>
            {optionAttr && op[optionAttr]}
          </option>
        ))}
      </select>
    </div>
  )
}
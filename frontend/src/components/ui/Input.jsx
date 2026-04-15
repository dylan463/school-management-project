export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  autoComplete,
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-600">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        className={`
          w-full px-3 py-2.5 rounded-lg border text-sm font-normal text-slate-800
          outline-none transition-all duration-150 bg-white
          placeholder:text-slate-400
          ${error
            ? 'border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
          }
        `}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
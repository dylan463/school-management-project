const variants = {
  primary:   'bg-blue-700 hover:bg-blue-800 text-white border-transparent',
  secondary: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200',
  danger:    'bg-red-600 hover:bg-red-700 text-white border-transparent',
  ghost:     'bg-transparent hover:bg-slate-100 text-slate-600 border-transparent',
  navy:      'bg-navy-900 hover:bg-navy-800 text-white border-transparent',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-sm',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg border
        transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
    >
      {children}
    </button>
  )
}
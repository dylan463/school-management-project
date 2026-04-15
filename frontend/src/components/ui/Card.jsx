export default function Card({ title, children, action, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-slate-100 p-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
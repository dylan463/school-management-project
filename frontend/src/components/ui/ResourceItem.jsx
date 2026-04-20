import Pill from './Pill'

const iconColors = { PDF: 'bg-blue-50', ZIP: 'bg-green-50', default: 'bg-slate-100' }

export default function ResourceItem({ title, meta, type }) {
  const bg = iconColors[type] || iconColors.default
  return (
    <div className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
      <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 16 16">
          <path d="M3.5 2h5l4 4v7.5a1 1 0 01-1 1h-8a1 1 0 01-1-1V3a1 1 0 011-1z"
            stroke="currentColor" strokeWidth="1.2"/>
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-800 truncate">{title}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{meta}</p>
      </div>
      {type && <Pill label={type} />}
    </div>
  )
}
const dotColors = {
  blue:   'bg-blue-500',
  amber:  'bg-amber-500',
  green:  'bg-green-500',
  red:    'bg-red-500',
}

export default function NotifItem({ message, time, color = 'blue' }) {
  return (
    <div className="flex gap-2.5 py-2.5 border-b border-slate-50 last:border-0">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColors[color] || dotColors.blue}`} />
      <div>
        <p className="text-xs text-slate-800 leading-snug">{message}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{time}</p>
      </div>
    </div>
  )
}
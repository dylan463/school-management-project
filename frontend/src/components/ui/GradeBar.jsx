const barColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4']

export default function GradeBar({ label, value, max = 20, colorIndex = 0 }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="mb-2.5">
      <div className="flex justify-between text-xs text-slate-600 mb-1">
        <span>{label}</span>
        <span className="font-semibold">{value}/{max}</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: barColors[colorIndex % barColors.length] }}
        />
      </div>
    </div>
  )
}
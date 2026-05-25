const variants = {
  green:  'bg-green-100 text-green-800',
  amber:  'bg-amber-100 text-amber-800',
  red:    'bg-red-100 text-red-800',
  blue:   'bg-blue-100 text-blue-800',
  purple: 'bg-purple-100 text-purple-800',
  gray:   'bg-gray-100 text-gray-700',
}

const autoColor = (label) => {
  const map = {
    'Validé': 'green', 'En attente': 'amber', 'Insuffisant': 'red',
    'PDF': 'blue', 'ZIP': 'green', 'Examen': 'blue', 'TP': 'green',
    'Cours': 'purple', 'TD': 'amber',
  }
  return map[label] || 'gray'
}

export default function Pill({ label, color }) {
  const c = color || autoColor(label)
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${variants[c] || variants.gray}`}>
      {label}
    </span>
  )
}
const colors = [
  'bg-blue-100 text-blue-800',
  'bg-green-100 text-green-800',
  'bg-purple-100 text-purple-800',
  'bg-amber-100 text-amber-800',
  'bg-rose-100 text-rose-800',
]

function initials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export default function Avatar({ name = '', size = 'md', colorIndex = 0 }) {
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-10 h-10 text-sm' : 'w-8 h-8 text-xs'
  const color = colors[colorIndex % colors.length]
  return (
    <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials(name)}
    </div>
  )
}
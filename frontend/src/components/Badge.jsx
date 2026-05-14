function Badge({content = '', color = "slate", label=''}) {
    if (!content) return null

    const colors = {
      blue: "bg-blue-100",
      red: "bg-red-100",
      green: "bg-green-100",
      yellow: "bg-yellow-100",
      slate: "bg-slate-100"
    }

    return (
      <span
        className={`text-xs opacity-75 px-1 py-0.5 rounded ${colors[color] || colors.slate}`}
      >
        {label}
        {content}
      </span>
    )
}
export default Badge
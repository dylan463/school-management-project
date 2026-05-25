function Badge({content = '', color = "slate"}) {
    if (!content) return null

    return (
      <span
        className={`text-xs opacity-75 px-1 py-0.5 rounded bg-${color}-100`}
      >
        {content}
      </span>
    )
}
export default Badge
const Switch = ({ tabs = [], active, onChange }) => {
    return (
        <div className="flex items-center gap-1 bg-[#f0f0f0] rounded-2xl p-1 w-fit">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => onChange?.(tab.value)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all duration-150
            ${active === tab.value
                            ? "bg-white text-black shadow-sm"
                            : "text-slate-500 hover:text-black"
                        }`}
                >
                    {tab.key}
                </button>
            ))}
        </div>
    )
}
export default Switch
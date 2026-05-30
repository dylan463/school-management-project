export default function ActiveBadge({ isActive }) {
    const base = "text-xs opacity-75 px-1 py-0.5 rounded";
    const color = isActive ? "green" : "red";
    return <span className={`${base} bg-${color}-100 text-${color}-600`}>
        {isActive ? "Actif" : "Inactif"}
    </span>;
}

export default  function ResetButton({
    disabled=false,
    onReset= ()=> {}
}){
    return (
<button
    onClick={onReset}
    disabled={disabled}
    className={`px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none transition-colors ${
        disabled
        ? 'text-slate-300 cursor-not-allowed' 
        : 'text-slate-600 hover:bg-slate-50 cursor-pointer'
    }`}
    >
    Réinitialiser
</button>
    )
}
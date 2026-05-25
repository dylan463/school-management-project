import React from 'react'

function Paginator({page,setPage= (page)=>{},totalPages}) {
  const buttonClassName = 'border border-slate w-[25px]'
  const hover = 'hover:bg-slate-50'
  const disabledprev = page == 1
  const disabledNext = page == totalPages
  return (
    <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
    <button className={`${buttonClassName} ${disabledprev ? '' : hover}`} onClick={() => setPage(1)}          disabled={page === 1}>«</button>
    <button className={`${buttonClassName} ${disabledprev ? '' : hover}`} onClick={() => setPage((p) => p-1)} disabled={page === 1}>‹</button>
    <span>Page <strong>{page}</strong> sur <strong>{totalPages}</strong></span>
    <button className={`${buttonClassName} ${disabledNext ? '' : hover}`} onClick={() => setPage((p) => p+1)} disabled={page === totalPages}>›</button>
    <button className={`${buttonClassName} ${disabledNext ? '' : hover}`} onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
    </div>
  )
}

export default Paginator
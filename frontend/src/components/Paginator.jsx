import React from "react";

function Paginator({
  page = 1,
  setPage = () => {},
  totalPages = 1,
}) {
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  const baseButtonClass =
    "min-w-[32px] h-8 px-2 rounded-md border text-sm transition-colors duration-150";

  const normalButtonClass =
    "border-slate-300 hover:bg-slate-100 text-slate-700";

  const activeButtonClass =
    "bg-red-600 border-red-600 text-white";

  const disabledButtonClass =
    "border-slate-200 text-slate-300 cursor-not-allowed";

  const goToPage = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
  };

  const pages = [];

  // Cas où il y a peu de pages
  if (totalPages <= 3) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  }
  // Première page
  else if (page === 1) {
    pages.push(1, 2, 3);
  }
  // Dernière page
  else if (page === totalPages) {
    pages.push(totalPages - 2, totalPages - 1, totalPages);
  }
  // Milieu
  else {
    pages.push(page - 1, page, page + 1);
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-2 py-2">
      <div className="text-sm text-slate-500">
        Affichage de la page {page} sur {totalPages}
      </div>

      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          className={`${baseButtonClass} ${
            isFirstPage ? disabledButtonClass : normalButtonClass
          }`}
          onClick={() => goToPage(page - 1)}
          disabled={isFirstPage}
        >
          ‹
        </button>

        {/* Pages */}
        {pages.map((p) => (
          <button
            key={p}
            className={`${baseButtonClass} ${
              p === page ? activeButtonClass : normalButtonClass
            }`}
            onClick={() => goToPage(p)}
          >
            {p}
          </button>
        ))}

        {/* Next */}
        <button
          className={`${baseButtonClass} ${
            isLastPage ? disabledButtonClass : normalButtonClass
          }`}
          onClick={() => goToPage(page + 1)}
          disabled={isLastPage}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default Paginator;
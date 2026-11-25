import React from "react";

const OfferPagination = ({ pagination, page, limit, setPage, setLimit }) => {
  const {
    totalOffers = 0,
    totalPages = 1,
    hasNextPage = false,
    hasPreviousPage = false,
  } = pagination || {};

  const handlePrevious = () => {
    if (hasPreviousPage) {
      setPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-[10px] text-slate-500 dark:text-slate-400">
        Showing{" "}
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {Math.min(limit, totalOffers)}
        </span>{" "}
        of <span className="font-medium text-slate-700 dark:text-slate-300">{totalOffers}</span>{" "}
        offers
      </p>

      <div className="flex items-center gap-1.5">
        {/* Page Size */}

        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(1);
          }}
          className="h-7 rounded-md border border-slate-200 bg-white px-2 text-[9px] text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <option value={5}>5 / page</option>

          <option value={10}>10 / page</option>

          <option value={20}>20 / page</option>

          <option value={50}>50 / page</option>
        </select>

        {/* Previous */}

        <button
          type="button"
          disabled={!hasPreviousPage}
          onClick={handlePrevious}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-[14px] text-slate-500 transition hover:border-[#6655df] hover:text-[#6655df] disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-[#818cf8] dark:hover:text-[#818cf8]"
        >
          ‹
        </button>

        {/* Page */}

        <span className="min-w-[55px] text-center text-[9px] text-slate-500 dark:text-slate-400">
          {page} / {totalPages}
        </span>

        {/* Next */}

        <button
          type="button"
          disabled={!hasNextPage}
          onClick={handleNext}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-[14px] text-slate-500 transition hover:border-[#6655df] hover:text-[#6655df] disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-[#818cf8] dark:hover:text-[#818cf8]"
        >
          ›
        </button>
      </div>
    </div>
  );
};

export default OfferPagination;

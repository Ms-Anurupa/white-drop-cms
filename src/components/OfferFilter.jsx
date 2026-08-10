import React from "react";
import { STATUS_TABS } from "../utils/offerUtils";

const OfferFilters = ({
  search,
  setSearch,

  activeTab,
  setActiveTab,

  offerType,
  setOfferType,

  fromDate,
  setFromDate,

  toDate,
  setToDate,

  onReset,
}) => {
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (status) => {
    setActiveTab(status);
  };

  return (
    <>
      {/* Search + Status */}

      <div className="mb-3 flex flex-wrap items-center gap-2">
        {/* Search */}

        <div className="flex h-9 w-full max-w-[280px] items-center rounded-md border border-slate-200 bg-white px-2.5 shadow-sm">
          <span className="mr-2 text-[16px] text-slate-400">⌕</span>

          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search offers..."
            className="h-full w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Status Tabs */}

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleStatusChange(tab.key)}
              className={`h-8 shrink-0 rounded-full border px-3 text-[10px] font-medium transition ${
                activeTab === tab.key
                  ? "border-[#6655df] bg-[#6655df] text-white"
                  : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date / Type Filters */}

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
        {/* Offer Type */}

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-medium text-slate-500">
            Offer Type
          </label>

          <input
            type="text"
            value={offerType}
            onChange={(e) => setOfferType(e.target.value)}
            placeholder="Offer type"
            className="h-8 w-[155px] rounded-md border border-slate-200 bg-white px-2.5 text-[10px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#6655df]"
          />
        </div>

        {/* From Date */}

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-medium text-slate-500">
            From Date
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-8 w-[150px] rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-600 outline-none focus:border-[#6655df]"
          />
        </div>

        {/* To Date */}

        <div className="flex flex-col gap-1">
          <label className="text-[9px] font-medium text-slate-500">
            To Date
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-8 w-[150px] rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-600 outline-none focus:border-[#6655df]"
          />
        </div>

        {/* Reset */}

        <button
          type="button"
          onClick={onReset}
          className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[10px] font-medium text-slate-500 shadow-sm transition hover:border-[#6655df] hover:text-[#6655df]"
        >
          ↻ Reset
        </button>
      </div>
    </>
  );
};

export default OfferFilters;

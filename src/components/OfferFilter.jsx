import React from "react";
import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  ListFilter,
} from "lucide-react";

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

  const getStatusIcon = (key) => {
    switch (key) {
      case "ACTIVE":
        return <CheckCircle2 size={12} />;

      case "INACTIVE":
        return <XCircle size={12} />;

      default:
        return <ListFilter size={12} />;
    }
  };

  return (
    <div className="mb-5 space-y-3">
      {/* ================================================================
          SEARCH + STATUS
      ================================================================= */}

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}

          <div className="relative w-full lg:w-[320px]">
            <Search
              size={15}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search offers..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-3 text-[11px] font-medium text-slate-700 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-[#6655df] focus:bg-white focus:ring-2 focus:ring-[#6655df]/10"
            />
          </div>

          {/* Status Filter */}

          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-1">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusChange(tab.key)}
                  className={`flex h-7 shrink-0 items-center gap-1.5 rounded-md px-3 text-[10px] font-semibold transition-all ${
                    isActive
                      ? "bg-white text-[#6655df] shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:bg-white/70 hover:text-slate-700"
                  }`}
                >
                  {getStatusIcon(tab.key)}

                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================
          ADVANCED FILTERS
      ================================================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6655df]/10">
              <SlidersHorizontal
                size={13}
                strokeWidth={2}
                className="text-[#6655df]"
              />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-slate-700">
                Advanced Filters
              </p>

              <p className="text-[9px] text-slate-400">
                Refine your offer results
              </p>
            </div>
          </div>

          {/* Active filter indicator */}

          {(offerType || fromDate || toDate) && (
            <span className="rounded-full bg-[#6655df]/10 px-2 py-1 text-[8px] font-semibold text-[#6655df]">
              Filters applied
            </span>
          )}
        </div>

        {/* Filter Controls */}

        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
          {/* Offer Type */}

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label className="text-[9px] font-semibold uppercase tracking-[0.04em] text-slate-400">
              Offer Type
            </label>

            <input
              type="text"
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              placeholder="Search by offer type..."
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-[10px] font-medium text-slate-700 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-[#6655df] focus:bg-white focus:ring-2 focus:ring-[#6655df]/10"
            />
          </div>

          {/* From Date */}

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label className="text-[9px] font-semibold uppercase tracking-[0.04em] text-slate-400">
              From Date
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-[10px] font-medium text-slate-600 outline-none transition-all hover:border-slate-300 focus:border-[#6655df] focus:bg-white focus:ring-2 focus:ring-[#6655df]/10"
            />
          </div>

          {/* To Date */}

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label className="text-[9px] font-semibold uppercase tracking-[0.04em] text-slate-400">
              To Date
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-[10px] font-medium text-slate-600 outline-none transition-all hover:border-slate-300 focus:border-[#6655df] focus:bg-white focus:ring-2 focus:ring-[#6655df]/10"
            />
          </div>

          {/* Reset */}

          <button
            type="button"
            onClick={onReset}
            className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 text-[10px] font-semibold text-slate-500 transition-all hover:border-[#6655df]/30 hover:bg-[#6655df]/5 hover:text-[#6655df] active:scale-[0.98]"
          >
            <RotateCcw size={12} strokeWidth={2} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfferFilters;

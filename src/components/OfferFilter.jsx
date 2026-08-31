import {
  Search,
  RotateCcw,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  ListFilter,
} from "lucide-react";

import { STATUS_TABS } from "../utils/offerUtils";

const mono = { fontFamily: "'JetBrains Mono', monospace" };

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
  const handleSearch = (e) => setSearch(e.target.value);
  const handleStatusChange = (status) => setActiveTab(status);

  const handleFromDateChange = (e) => {
    const value = e.target.value;
    if (!value) return setFromDate("");
    setFromDate(value);
  };

  const handleToDateChange = (e) => {
    const value = e.target.value;
    if (!value) return setToDate("");
    setToDate(value);
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

  const isDateRangeComplete = Boolean(fromDate && toDate);

  return (
    <div className="mb-5 space-y-3">
      {/* SEARCH + STATUS */}
      <div className="rounded-xl border border-[#E5E7F0] bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:w-[320px]">
            <Search
              size={15}
              strokeWidth={2}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9AA1B8]"
            />
            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Search offers..."
              className="h-9 w-full rounded-lg border border-[#E5E7F0] bg-[#F7F8FC] pl-9 pr-3 text-[11px] font-medium text-[#12151F] outline-none transition-all placeholder:font-normal placeholder:text-[#9AA1B8] hover:border-[#D0D4E4] focus:border-[#6655DF] focus:bg-white focus:ring-2 focus:ring-[#6655DF]/12"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-[#E5E7F0] bg-[#F7F8FC] p-1">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleStatusChange(tab.key)}
                  className={`flex h-7 shrink-0 items-center gap-1.5 rounded-md px-3 text-[10px] font-semibold transition-all ${isActive
                      ? "bg-white text-[#6655DF] shadow-sm ring-1 ring-[#E5E7F0]"
                      : "text-[#5C6480] hover:bg-white/70 hover:text-[#12151F]"
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

      {/* ADVANCED FILTERS */}
      <div className="overflow-hidden rounded-xl border border-[#E5E7F0] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.03)]">
        <div className="flex items-center justify-between border-b border-[#F0F1F6] px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6655DF]/10">
              <SlidersHorizontal
                size={13}
                strokeWidth={2}
                className="text-[#6655DF]"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-[#12151F]">
                Advanced Filters
              </p>
              <p className="text-[9px] text-[#9AA1B8]">
                Refine your offer results
              </p>
            </div>
          </div>

          {(offerType || isDateRangeComplete) && (
            <span
              className="rounded-full bg-[#14B8A6]/10 px-2 py-1 text-[8px] font-semibold uppercase tracking-wide text-[#0D9488]"
              style={mono}
            >
              Filters active
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label
              className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#9AA1B8]"
              style={mono}
            >
              Offer Type
            </label>
            <input
              type="text"
              value={offerType}
              onChange={(e) => setOfferType(e.target.value)}
              placeholder="Search by offer type..."
              className="h-9 w-full rounded-lg border border-[#E5E7F0] bg-[#F7F8FC] px-3 text-[10px] font-medium text-[#12151F] outline-none transition-all placeholder:font-normal placeholder:text-[#9AA1B8] hover:border-[#D0D4E4] focus:border-[#6655DF] focus:bg-white focus:ring-2 focus:ring-[#6655DF]/12"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label
              className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#9AA1B8]"
              style={mono}
            >
              From Date
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={handleFromDateChange}
              max={toDate || undefined}
              className="h-9 w-full rounded-lg border border-[#E5E7F0] bg-[#F7F8FC] px-3 text-[10px] font-medium text-[#5C6480] outline-none transition-all hover:border-[#D0D4E4] focus:border-[#6655DF] focus:bg-white focus:ring-2 focus:ring-[#6655DF]/12"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <label
              className="text-[9px] font-semibold uppercase tracking-[0.06em] text-[#9AA1B8]"
              style={mono}
            >
              To Date
            </label>
            <input
              type="date"
              value={toDate}
              onChange={handleToDateChange}
              min={fromDate || undefined}
              className="h-9 w-full rounded-lg border border-[#E5E7F0] bg-[#F7F8FC] px-3 text-[10px] font-medium text-[#5C6480] outline-none transition-all hover:border-[#D0D4E4] focus:border-[#6655DF] focus:bg-white focus:ring-2 focus:ring-[#6655DF]/12"
            />
          </div>

          <button
            type="button"
            onClick={onReset}
            className="flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#E5E7F0] bg-white px-4 text-[10px] font-semibold text-[#5C6480] transition-all hover:border-[#6655DF]/30 hover:bg-[#6655DF]/5 hover:text-[#6655DF] active:scale-[0.98]"
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

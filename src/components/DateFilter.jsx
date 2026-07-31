import React from "react";
import { CalendarRange } from "lucide-react";

const DateFilter = ({
  filters = [],
  activeFilter,
  onFilterChange,
  showRange = true,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
  rangeLabel, // e.g. "Joined date" — shows a label+icon instead of pills
  trailingText, // e.g. "12 partners found" — right-aligned note
}) => {
  const hasPills = filters.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 flex flex-wrap items-end gap-3">
      {/* Filter Pills */}
      {hasPills && (
        <div className="flex flex-wrap items-center gap-2 pb-0.5">
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer ${
                activeFilter === filter.key
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}
              {filter.count !== undefined && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    activeFilter === filter.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Optional label instead of pills */}
      {!hasPills && rangeLabel && (
        <div className="flex items-center gap-2 text-gray-500 text-sm pb-2">
          <CalendarRange size={16} />
          <span className="font-medium">{rangeLabel}</span>
        </div>
      )}

      {hasPills && showRange && (
        <div className="hidden sm:block w-px self-stretch bg-gray-100 mx-6" />
      )}

      {/* Date Range */}
      {showRange && (
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500">From</label>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          <span className="text-gray-300 pb-2">→</span>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500">To</label>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => onToDateChange(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              onClick={onClear}
              className="h-9 px-3 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* {trailingText && (
        <p className="text-xs text-gray-400 ml-auto pb-2">{trailingText}</p>
      )} */}
    </div>
  );
};

export default DateFilter;

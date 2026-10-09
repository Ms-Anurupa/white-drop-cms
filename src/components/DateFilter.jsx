import { CalendarRange, ChevronDown } from "lucide-react";

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
  rangeLabel,
  bare = false,
  className = "",
  dateFilterType,
  onDateTypeChange,
  dateTypeOptions = [],
}) => {
  const hasPills = filters.length > 0;

  return (
    <div
      className={`${className} ${
        !bare ? "bg-white rounded-2xl border border-gray-100 shadow-sm p-3" : ""
      } flex flex-wrap items-end gap-3`}
    >
      {hasPills && (
        <div className="flex flex-wrap items-center gap-2 pb-0.5">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange?.(filter.key)}
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
                  {filter.count}{" "}
                </span>
              )}{" "}
            </button>
          ))}{" "}
        </div>
      )}

      {!hasPills && rangeLabel && (
        <div className="flex items-center gap-2 text-gray-500 text-sm pb-2">
          <CalendarRange size={16} />
          <span className="font-medium">{rangeLabel}</span>
        </div>
      )}
      {showRange && (
        <div className="flex flex-wrap items-end gap-2">
          {dateTypeOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-500">
                Filter date by
              </label>

              <div className="relative">
                <select
                  value={dateFilterType || dateTypeOptions[0]?.value || ""}
                  onChange={(e) => onDateTypeChange?.(e.target.value)}
                  className="h-9 min-w-[140px] appearance-none pl-3  rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                >
                  {dateTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500">From</label>
            <input
              type="date"
              value={fromDate || ""}
              max={toDate || undefined}
              onChange={(e) => onFromDateChange?.(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          <span className="text-gray-300 pb-2">→</span>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-500">To</label>
            <input
              type="date"
              value={toDate || ""}
              min={fromDate || undefined}
              onChange={(e) => onToDateChange?.(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={onClear}
              className="h-9 px-3 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition shrink-0 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DateFilter;

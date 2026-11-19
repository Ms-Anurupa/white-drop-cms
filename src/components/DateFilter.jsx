import { useRef } from "react";
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

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  const openDatePicker = (ref) => {
    const input = ref.current;
    if (!input) return;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    } catch {
      input.focus();
    }
  };

  const dateInputClass =
    "h-9 w-full cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm font-normal text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400";

  return (
    <div
      className={`${className} ${
        !bare ? "rounded-2xl border border-gray-100 bg-white p-3 shadow-sm" : ""
      } flex flex-wrap items-end gap-3`}
    >
      {/* FILTER PILLS */}
      {hasPills && (
        <div className="flex flex-wrap items-center gap-2 pb-0.5">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => onFilterChange?.(filter.key)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-normal transition ${
                activeFilter === filter.key
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {filter.label}

              {filter.count !== undefined && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-normal ${
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

      {/* RANGE LABEL */}
      {!hasPills && rangeLabel && (
        <div className="flex items-center gap-2 pb-2 text-sm text-gray-500">
          <CalendarRange size={16} />
          <span className="font-normal">{rangeLabel}</span>
        </div>
      )}

      {/* DATE RANGE */}
      {showRange && (
        <div className="flex flex-wrap items-end gap-2">
          {/* DATE TYPE */}
          {dateTypeOptions.length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-normal text-gray-500">
                Filter date by
              </label>

              <div className="relative">
                <select
                  value={dateFilterType || dateTypeOptions[0]?.value || ""}
                  onChange={(e) => onDateTypeChange?.(e.target.value)}
                  className="h-9 min-w-[140px] cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-sm font-normal text-gray-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {dateTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>
          )}

          {/* FROM DATE */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-normal text-gray-500">
              From
            </label>

            <div
              onClick={() => openDatePicker(fromDateRef)}
              className="date-click-area flex h-9 w-full min-w-[145px] cursor-pointer items-center rounded-lg"
            >
              <input
                ref={fromDateRef}
                type="date"
                value={fromDate || ""}
                max={toDate || undefined}
                onChange={(e) => onFromDateChange?.(e.target.value)}
                onClick={() => openDatePicker(fromDateRef)}
                className={dateInputClass}
              />
            </div>
          </div>

          <span className="pb-2 text-gray-300">→</span>

          {/* TO DATE */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-normal text-gray-500">To</label>

            <div
              onClick={() => openDatePicker(toDateRef)}
              className="date-click-area flex h-9 w-full min-w-[145px] cursor-pointer items-center rounded-lg"
            >
              <input
                ref={toDateRef}
                type="date"
                value={toDate || ""}
                min={fromDate || undefined}
                onChange={(e) => onToDateChange?.(e.target.value)}
                onClick={() => openDatePicker(toDateRef)}
                className={dateInputClass}
              />
            </div>
          </div>

          {/* CLEAR */}
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={onClear}
              className="h-9 shrink-0 cursor-pointer rounded-lg border border-red-200 px-3 text-sm font-normal text-red-600 transition hover:bg-red-50"
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

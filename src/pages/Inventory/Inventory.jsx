import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  X,
  Clock,
  RefreshCw,
} from "lucide-react";
import inventoryStore from "@/zustand/Store/inventoryStore";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/Loader";

const PAGE_SIZE = 10;

const DATE_FILTERS = [
  { label: "All", value: "" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

const TEAL = "#0E7C86";
const AMBER = "#B45309";

const formatDate = (dateStr) => {
  if (!dateStr) return "—";

  if (
    typeof dateStr === "string" &&
    dateStr.includes("-") &&
    dateStr.length === 10
  ) {
    const parts = dateStr.split("-");
    if (parts[0].length === 2) {
      const day = Number(parts[0]);
      const month = Number(parts[1]) - 1;
      const year = Number(parts[2]);
      const dateObj = new Date(year, month, day);
      if (!isNaN(dateObj)) {
        return dateObj.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }
  }

  const parsedDate = new Date(dateStr);
  if (isNaN(parsedDate)) return dateStr;

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "—";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate)) return "—";
  return parsedDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (value) => {
  if (value == null) return "—";
  const number = Number(value);
  if (Number.isNaN(number)) return "—";
  return Number.isInteger(number) ? number : Number(number.toFixed(2));
};

const getUnitLabel = (unit) => (unit ? String(unit).toUpperCase() : "L");

function InventoryDetailsPanel({ item, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 dark:bg-black/60 transition-opacity"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl overflow-y-auto"
      >
        <div
          className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-[#E3E8EA] dark:border-slate-800 px-5 py-4 flex items-center justify-between"
        >
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Inventory Entry</p>
            <h2
              className="text-base font-semibold flex items-center gap-2 mt-1 text-[#0B1220] dark:text-slate-100"
            >
              <CalendarDays size={16} className="text-slate-400 dark:text-slate-500" />
              {formatDate(item.entryDate)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 dark:hover:bg-slate-800 dark:text-slate-400"
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <section
            className="rounded-lg p-4 bg-[#E4F3F1] dark:bg-teal-950/50 dark:border dark:border-teal-900/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0E7C86] dark:text-teal-300">
                Opening Stock
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock size={12} />
                {formatTime(item.openingTime)}
              </span>
            </div>

            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Opening Qty</p>
              <p
                className="text-sm font-semibold tabular-nums mt-1 text-[#0B1220] dark:text-slate-100"
              >
                {formatNumber(item.openingQty)} {getUnitLabel(item.unit)}
              </p>
            </div>
          </section>

          <section className="bg-slate-50 dark:bg-slate-800/70 rounded-lg p-4 border border-slate-100 dark:border-slate-700 space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              Stock Movement
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Produced</p>
                <p className="text-sm font-medium tabular-nums mt-0.5 text-slate-700 dark:text-slate-200">
                  {item.produced != null
                    ? `${formatNumber(item.produced)} ${getUnitLabel(item.unit)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bulk Out</p>
                <p className="text-sm font-medium tabular-nums mt-0.5 text-slate-700 dark:text-slate-200">
                  {item.bulkStockout != null
                    ? `${formatNumber(item.bulkStockout)} ${getUnitLabel(item.unit)}`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Packet Out</p>
                <p className="text-sm font-medium tabular-nums mt-0.5 text-slate-700 dark:text-slate-200">
                  {item.packetStockout != null
                    ? `${formatNumber(item.packetStockout)} ${getUnitLabel(item.unit)}`
                    : "—"}
                </p>
              </div>
            </div>
          </section>

          <section
            className={`rounded-lg p-4 ${
              item.closingQty != null
                ? "bg-[#F1F5F4] dark:bg-slate-800/70 dark:border dark:border-slate-700"
                : "bg-[#FBEEE0] dark:bg-amber-950/50 dark:border dark:border-amber-900/50"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3
                className={`text-sm font-semibold ${
                  item.closingQty != null
                    ? "text-[#334155] dark:text-slate-200"
                    : "text-[#B45309] dark:text-amber-300"
                }`}
              >
                Closing Stock
              </h3>
              {item.closingTime && (
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(item.closingTime)}
                </span>
              )}
            </div>

            {item.closingQty != null ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Closing Qty</p>
                  <p
                    className="text-sm font-semibold tabular-nums mt-1 text-[#0B1220] dark:text-slate-100"
                  >
                    {formatNumber(item.closingQty)} {getUnitLabel(item.unit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Wastage</p>
                  <p
                    className="text-sm font-semibold tabular-nums mt-1 text-[#B45309] dark:text-amber-300"
                  >
                    {item.wastageQty != null
                      ? `${formatNumber(item.wastageQty)} ${getUnitLabel(item.unit)}`
                      : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[#B45309] dark:text-amber-300">
                Closing stock hasn't been recorded for this day yet.
              </p>
            )}
          </section>

          {item.wastageNote && (
            <section>
              <h3 className="text-xs font-semibold uppercase text-slate-400 dark:text-slate-500 mb-2">
                Wastage Note
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800/70 rounded-lg p-4 border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.wastageNote}</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Inventory() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [activeDateFilter, setActiveDateFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const getInventoryListing = inventoryStore(
    (state) => state.getInventoryListing
  );
  const inventoryLists = inventoryStore((state) => state.inventoryLists);
  const inventoryMeta = inventoryStore((state) => state.inventoryMeta);
  const loading = inventoryStore((state) => state.loading);

  useEffect(() => {
    if ((startDate && !endDate) || (!startDate && endDate)) {
      return;
    }
    const params = {
      page,
      limit: PAGE_SIZE,
    };
    if (activeDateFilter) {
      params.dateFilter = activeDateFilter;
    }
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate;
    }
    getInventoryListing(params);
  }, [getInventoryListing, page, activeDateFilter, startDate, endDate]);

  const data = Array.isArray(inventoryLists) ? inventoryLists : [];

  // Extract recorded entry dates to pass to Add Inventory page
  const existingDates = data.map((item) => item.entryDate).filter(Boolean);

  const meta = inventoryMeta || {};
  const total = Number(meta.total) || 0;
  const totalPages = Math.max(Number(meta.totalPages) || 1, 1);
  const currentPage = Math.min(Number(meta.page) || page, totalPages);
  const showingFrom = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const showingTo = Math.min(currentPage * PAGE_SIZE, total);
  const hasFilters =
    Boolean(activeDateFilter) || Boolean(startDate) || Boolean(endDate);

  const handleDateFilter = (value) => {
    setActiveDateFilter(value);
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handleStartDate = (value) => {
    setActiveDateFilter("");
    setStartDate(value);
    setPage(1);
  };

  const handleEndDate = (value) => {
    setActiveDateFilter("");
    setEndDate(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setActiveDateFilter("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const handlePrevious = () => currentPage > 1 && setPage((p) => p - 1);
  const handleNext = () => currentPage < totalPages && setPage((p) => p + 1);

  const handleAddEntryClick = () => {
    navigate("/dashboard/inventory/add-inventory", {
      state: {
        entryType: "OPENING",
        existingDates,
      },
    });
  };

  const handleAddClosingClick = (item) => {
    // id goes in the query string so Add Inventory can load/update that record;
    // entryType + selectedDate lock the form to Closing on that exact date.
    navigate(`/dashboard/inventory/add-inventory?id=${item.id}`, {
      state: {
        entryType: "CLOSING",
        selectedDate: item.entryDate,
        existingDates,
      },
    });
  };

  const handleRowAction = (item, action) => {
    if (action === "view") setSelectedItem(item);
    else if (action === "closing") handleAddClosingClick(item);
  };

  if (loading && data.length === 0) {
    return <Loader text="Loading Inventory Listing..." />;
  }

  const BASE_BTN =
  "inline-flex h-8 min-w-[84px] items-center justify-center rounded-md px-3 text-xs font-medium leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer";

  const BTN_VARIANTS = {
    outline: "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-700",
    solid: "border border-transparent text-white hover:opacity-90 focus:ring-teal-200",
  };

  function ActionButton({ variant = "outline", style, className = "", children, ...props }) {
    return (
      <button
        type="button"
        className={`${BASE_BTN} ${BTN_VARIANTS[variant]} ${className}`}
        style={variant === "solid" ? { backgroundColor: TEAL, ...style } : style}
        {...props}
      >
        {children}
      </button>
    );
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div
      className="min-h-screen lg:p-6 md:p-6 space-y-5 bg-[#F7F9FA] dark:bg-slate-950"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-[#0B1220] dark:text-slate-100">
            Inventory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Daily opening and closing milk stock, production, and wastage
            tracking
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddEntryClick}
          className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 w-full sm:w-auto"
          style={{ backgroundColor: TEAL }}
        >
          <Plus size={15} />
          Add entry
        </button>
      </div>

      <div
        className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-[#E3E8EA] dark:border-slate-800"
      >
        <div className="flex flex-wrap items-center gap-2">
          {DATE_FILTERS.map((filter) => {
            const active =
              activeDateFilter === filter.value && !startDate && !endDate;
            return (
              <button
                key={filter.label}
                type="button"
                onClick={() => handleDateFilter(filter.value)}
                className={`cursor-pointer px-3.5 py-1.5 rounded-md text-sm font-medium border transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[#0E7C86] border-[#0E7C86] text-white"
                    : "bg-white border-[#E3E8EA] text-[#64748B] hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {filter.label}
              </button>
            );
          })}

          <div
            className="w-px self-stretch mx-1 bg-[#E3E8EA] dark:bg-slate-700"
          />

          <div className="flex items-center gap-1.5">
            <label
              htmlFor="startDate"
              className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap"
            >
              From
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDate(e.target.value)}
              onClick={(e) => {
                const input = e.currentTarget;
                try {
                  input.showPicker?.();
                } catch {
                  input.focus();
                }
              }}
              className="cursor-pointer bg-white border border-[#E3E8EA] rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#E4F3F1] w-36 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-teal-500/30 dark:[color-scheme:dark]"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label
              htmlFor="endDate"
              className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap"
            >
              To
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onClick={(e) => {
                const input = e.currentTarget;
                try {
                  input.showPicker?.();
                } catch {
                  input.focus();
                }
              }}
              min={startDate || undefined}
              onChange={(e) => handleEndDate(e.target.value)}
              className="cursor-pointer bg-white border border-[#E3E8EA] rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-[#E4F3F1] w-36 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:ring-teal-500/30 dark:[color-scheme:dark]"
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="cursor-pointer ml-auto px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 whitespace-nowrap"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 whitespace-nowrap border border-[#E3E8EA] rounded-md bg-white dark:text-slate-300 dark:hover:text-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {(startDate || endDate) && !(startDate && endDate) && (
          <p className="text-xs mt-2 text-[#B45309] dark:text-amber-400">
            Select both a from date and a to date to apply the custom range.
          </p>
        )}
      </div>

      <div
        className="bg-white dark:bg-slate-900 rounded-lg border border-[#E3E8EA] dark:border-slate-800 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="dark:border-slate-800 dark:bg-slate-800/70">
                <TableHead className="dark:text-slate-400">Entry Date</TableHead>
                <TableHead className="dark:text-slate-400">Opening Qty</TableHead>
                <TableHead className="dark:text-slate-400">Produced</TableHead>
                <TableHead className="dark:text-slate-400">Stockouts (Bulk / Pkt)</TableHead>
                <TableHead className="dark:text-slate-400">Closing Qty</TableHead>
                <TableHead className="dark:text-slate-400">Wastage</TableHead>
                <TableHead className="text-right dark:text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow className="dark:border-slate-800">
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-slate-400 dark:text-slate-500"
                  >
                    Loading inventory…
                  </TableCell>
                </TableRow>
              ) : data.length > 0 ? (
                data.map((item) => {
                  const isClosed = item.closingQty != null;
                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 dark:border-slate-800 transition-colors"
                      style={{
                        borderLeft: `3px solid ${isClosed ? TEAL : AMBER}`,
                      }}
                    >
                      <TableCell className="p-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2 font-medium">
                          <CalendarDays size={14} className="text-slate-400 dark:text-slate-500" />
                          {formatDate(item.entryDate)}
                        </div>
                      </TableCell>

                      <TableCell className="p-4 tabular-nums">
                        <span className="font-semibold text-[#0B1220] dark:text-slate-100">
                          {formatNumber(item.openingQty)}{" "}
                          <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">
                            {getUnitLabel(item.unit)}
                          </span>
                        </span>
                      </TableCell>

                      <TableCell className="p-4 tabular-nums text-slate-600 dark:text-slate-300">
                        {item.produced != null ? (
                          <span>
                            {formatNumber(item.produced)}{" "}
                            <span className="text-xs text-slate-400 dark:text-slate-500">
                              {getUnitLabel(item.unit)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </TableCell>

                      <TableCell className="p-4 tabular-nums text-slate-600 dark:text-slate-300">
                        {item.bulkStockout != null ||
                        item.packetStockout != null ? (
                          <span className="text-xs">
                            {formatNumber(item.bulkStockout ?? 0)} /{" "}
                            {formatNumber(item.packetStockout ?? 0)}{" "}
                            {getUnitLabel(item.unit)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </TableCell>

                      <TableCell className="p-4 tabular-nums">
                        {isClosed ? (
                          <span
                            className="font-semibold text-[#0B1220] dark:text-slate-100"
                          >
                            {formatNumber(item.closingQty)}{" "}
                            <span className="text-slate-400 dark:text-slate-500 text-sm font-normal">
                              {getUnitLabel(item.unit)}
                            </span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full bg-[#FBEEE0] text-[#B45309] dark:bg-amber-950/60 dark:text-amber-300"
                          >
                            Pending
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="p-4 tabular-nums">
                        {item.wastageQty != null ? (
                          <span
                            className="font-medium text-[#B45309] dark:text-amber-400"
                          >
                            {formatNumber(item.wastageQty)}{" "}
                            {getUnitLabel(item.unit)}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">—</span>
                        )}
                      </TableCell>

                      {/* Actions dropdown: View, and Closing Entry (only while pending) */}
                      {/* Actions Column */}
                      <TableCell className="p-4 text-right">
                        {isClosed ? (
                          <ActionButton
                            variant="outline"
                            onClick={() => handleRowAction(item, "view")}
                          >
                            View
                          </ActionButton>
                        ) : (
                          <ActionButton
                            variant="solid"
                            onClick={() => handleRowAction(item, "closing")}
                          >
                            Closing Entry
                          </ActionButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No entries in this range yet.
                    </p>
                    <button
                      type="button"
                      onClick={handleAddEntryClick}
                      className="mt-3 text-sm font-medium cursor-pointer text-[#0E7C86] dark:text-teal-400"
                    >
                      Add today's opening stock →
                    </button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Showing {showingFrom}–{showingTo} of {total}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={handlePrevious}
            className="w-9 h-9 flex items-center justify-center border border-[#E3E8EA] rounded-md disabled:opacity-40 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={handleNext}
            className="w-9 h-9 flex items-center justify-center border border-[#E3E8EA] rounded-md disabled:opacity-40 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {selectedItem && (
        <InventoryDetailsPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
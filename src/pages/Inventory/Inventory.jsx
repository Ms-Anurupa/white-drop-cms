import { useEffect, useMemo, useState } from "react";
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
  Eye,
  Pencil,
  CalendarDays,
  X,
} from "lucide-react";
import inventoryStore from "@/zustand/Store/inventoryStore";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const DATE_FILTERS = [
  { label: "All", value: "" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This week", value: "week" },
  { label: "This month", value: "month" },
];

const INK = "#0B1220";
const TEAL = "#0E7C86";
const TEAL_SOFT = "#E4F3F1";
const AMBER = "#B45309";
const AMBER_SOFT = "#FBEEE0";
const LINE = "#E3E8EA";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (value) => {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) return 0;
  return Number.isInteger(number) ? number : Number(number.toFixed(2));
};

const getUnitLabel = (unit) => (unit ? String(unit).toUpperCase() : "—");

const getDateKey = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
};

function LedgerPanel({ summary }) {
  const periods = [
    { key: "today", label: "Today", data: summary.today },
    { key: "yesterday", label: "Yesterday", data: summary.yesterday },
    { key: "thisWeek", label: "This week", data: summary.thisWeek },
    { key: "thisMonth", label: "This month", data: summary.thisMonth },
  ];

  return (
    <div
      className="bg-white rounded-lg overflow-hidden border"
      style={{ borderColor: LINE }}
    >
      <div
        className="grid grid-cols-2 xl:grid-cols-4 divide-x divide-y xl:divide-y-0"
        style={{ borderColor: LINE }}
      >
        {periods.map((period) => (
          <div
            key={period.key}
            className="p-4 sm:p-5"
            style={{ borderColor: LINE }}
          >
            <p className="text-sm text-slate-500">{period.label}</p>

            <p
              className="mt-2 text-2xl font-semibold tracking-tight tabular-nums"
              style={{ color: INK }}
            >
              {formatNumber(period.data?.totalQty)}
              <span className="text-sm font-normal text-slate-400 ml-1">L</span>
            </p>

            <div className="mt-2 flex items-center gap-3 text-xs">
              {period.data?.totalWastageQty > 0 && (
                <span
                  className="tabular-nums font-medium"
                  style={{ color: AMBER }}
                >
                  {formatNumber(period.data.totalWastageQty)} L wastage
                </span>
              )}
              {period.key === "thisMonth" &&
                period.data?.totalEntries != null && (
                  <span className="text-slate-400">
                    {formatNumber(period.data.totalEntries)} entries
                  </span>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InventoryDetailsPanel({ item, onClose }) {
  if (!item) return null;
  const { opening, closing } = item;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40">
      <div className="h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto">
        <div
          className="sticky top-0 z-10 bg-white border-b px-5 py-4 flex items-center justify-between"
          style={{ borderColor: LINE }}
        >
          <div>
            <p className="text-xs text-slate-400">Inventory entry</p>
            <h2
              className="text-base font-semibold flex items-center gap-2 mt-1"
              style={{ color: INK }}
            >
              <CalendarDays size={16} className="text-slate-400" />
              {formatDate(opening?.entryDate || closing?.entryDate)}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500"
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <section
            className="rounded-lg p-4"
            style={{ backgroundColor: TEAL_SOFT }}
          >
            <h3 className="text-sm font-medium mb-3" style={{ color: TEAL }}>
              Opening
            </h3>

            {opening ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Quantity</p>
                  <p
                    className="text-sm font-semibold tabular-nums mt-1"
                    style={{ color: INK }}
                  >
                    {formatNumber(opening.qty)} {getUnitLabel(opening.unit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Rate</p>
                  <p
                    className="text-sm font-semibold tabular-nums mt-1"
                    style={{ color: INK }}
                  >
                    {opening.rate != null
                      ? `₹${formatNumber(opening.rate)}`
                      : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not recorded</p>
            )}
          </section>

          <section
            className="rounded-lg p-4"
            style={{ backgroundColor: closing ? "#F1F5F4" : AMBER_SOFT }}
          >
            <h3
              className="text-sm font-medium mb-3"
              style={{ color: closing ? "#334155" : AMBER }}
            >
              Closing
            </h3>

            {closing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Quantity</p>
                  <p
                    className="text-sm font-semibold tabular-nums mt-1"
                    style={{ color: INK }}
                  >
                    {formatNumber(closing.qty)} {getUnitLabel(closing.unit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Wastage</p>
                  <p
                    className="text-sm font-semibold tabular-nums mt-1"
                    style={{ color: AMBER }}
                  >
                    {closing.wastageQty != null
                      ? `${formatNumber(closing.wastageQty)} ${getUnitLabel(closing.unit)}`
                      : "—"}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: AMBER }}>
                Closing stock hasn't been recorded for this day yet.
              </p>
            )}
          </section>

          {closing?.remarks && (
            <section>
              <h3 className="text-sm font-medium mb-2" style={{ color: INK }}>
                Remarks
              </h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600">{closing.remarks}</p>
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
    (state) => state.getInventoryListing,
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

  const groupedData = useMemo(() => {
    const grouped = new Map();
    data.forEach((item) => {
      const dateKey = getDateKey(item.entryDate);
      if (!dateKey) return;
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          date: item.entryDate,
          opening: null,
          closing: null,
        });
      }
      const group = grouped.get(dateKey);
      if (item.type === "OPENING") group.opening = item;
      if (item.type === "CLOSING") group.closing = item;
    });
    return Array.from(grouped.values()).sort(
      (a, b) => new Date(b.date) - new Date(a.date),
    );
  }, [data]);

  const meta = inventoryMeta || {};
  const summary = meta.summary || {};
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

  const handleEdit = (item) => {
    const targetId = item.opening?.id || item.closing?.id;
    if (targetId) navigate(`/dashboard/inventory/add-inventory?id=${targetId}`);
  };

  return (
    <div
      className="min-h-screen lg:p-6 md:p-6 space-y-5"
      style={{ backgroundColor: "#F7F9FA" }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: INK }}>
            Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Daily opening and closing milk stock, with wastage tracked per entry
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/inventory/add-inventory")}
          className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 w-full sm:w-auto"
          style={{ backgroundColor: TEAL }}
        >
          <Plus size={15} />
          Add entry
        </button>
      </div>

      <LedgerPanel summary={summary} />

      <div
        className="bg-white rounded-lg p-4 border"
        style={{ borderColor: LINE }}
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
                className="cursor-pointer px-3.5 py-1.5 rounded-md text-sm font-medium border transition-colors whitespace-nowrap"
                style={
                  active
                    ? {
                        backgroundColor: TEAL,
                        borderColor: TEAL,
                        color: "#fff",
                      }
                    : {
                        backgroundColor: "#fff",
                        borderColor: LINE,
                        color: "#64748B",
                      }
                }
              >
                {filter.label}
              </button>
            );
          })}

          <div
            className="w-px self-stretch mx-1"
            style={{ backgroundColor: LINE }}
          />

          <div className="flex items-center gap-1.5">
            <label
              htmlFor="startDate"
              className="text-xs text-slate-500 whitespace-nowrap"
            >
              From
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => handleStartDate(e.target.value)}
              className="bg-white border rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 w-36"
              style={{ borderColor: LINE, "--tw-ring-color": TEAL_SOFT }}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label
              htmlFor="endDate"
              className="text-xs text-slate-500 whitespace-nowrap"
            >
              To
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => handleEndDate(e.target.value)}
              className="bg-white border rounded-md px-2.5 py-1.5 text-sm outline-none focus:ring-2 w-36"
              style={{ borderColor: LINE, "--tw-ring-color": TEAL_SOFT }}
            />
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="cursor-pointer ml-auto px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-600 whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {(startDate || endDate) && !(startDate && endDate) && (
          <p className="text-xs mt-2" style={{ color: AMBER }}>
            Select both a from date and a to date to apply the custom range.
          </p>
        )}
      </div>

      <div
        className="bg-white rounded-lg border overflow-hidden"
        style={{ borderColor: LINE }}
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry date</TableHead>
                <TableHead>Opening qty</TableHead>
                <TableHead>Opening rate</TableHead>
                <TableHead>Closing qty</TableHead>
                <TableHead>Wastage</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-sm text-slate-400"
                  >
                    Loading inventory…
                  </TableCell>
                </TableRow>
              ) : groupedData.length > 0 ? (
                groupedData.map((item) => {
                  const isComplete = Boolean(item.closing);
                  return (
                    <TableRow
                      key={getDateKey(item.date)}
                      className="hover:bg-slate-50/70 transition-colors"
                      style={{
                        borderLeft: `3px solid ${isComplete ? TEAL : AMBER}`,
                      }}
                    >
                      <TableCell className="p-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-slate-400" />
                          {formatDate(item.date)}
                        </div>
                      </TableCell>

                      <TableCell className="p-4 tabular-nums">
                        {item.opening ? (
                          <span
                            style={{ color: INK }}
                            className="font-semibold"
                          >
                            {formatNumber(item.opening.qty)}{" "}
                            <span className="text-slate-400 text-sm font-normal">
                              {getUnitLabel(item.opening.unit)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell className="p-4 tabular-nums">
                        {item.opening?.rate != null ? (
                          <span style={{ color: INK }} className="font-medium">
                            ₹{formatNumber(item.opening.rate)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell className="p-4 tabular-nums">
                        {item.closing ? (
                          <span
                            style={{ color: INK }}
                            className="font-semibold"
                          >
                            {formatNumber(item.closing.qty)}{" "}
                            <span className="text-slate-400 text-sm font-normal">
                              {getUnitLabel(item.closing.unit)}
                            </span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: AMBER_SOFT,
                              color: AMBER,
                            }}
                          >
                            Pending
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="p-4 tabular-nums">
                        {item.closing?.wastageQty != null ? (
                          <span
                            className="font-medium"
                            style={{ color: AMBER }}
                          >
                            {formatNumber(item.closing.wastageQty)}{" "}
                            {getUnitLabel(item.closing.unit)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>

                      <TableCell className="p-4 max-w-xs">
                        <p
                          className="text-sm text-slate-500 truncate"
                          title={item.closing?.remarks || ""}
                        >
                          {item.closing?.remarks || "—"}
                        </p>
                      </TableCell>

                      <TableCell className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedItem(item)}
                            className="cursor-pointer inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            style={{ borderColor: LINE }}
                          >
                            <Eye size={14} />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="cursor-pointer inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-slate-100 text-slate-400"
                            aria-label="Edit entry"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <p className="text-sm text-slate-500">
                      No entries in this range yet.
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/dashboard/inventory/add-inventory")
                      }
                      className="mt-3 text-sm font-medium"
                      style={{ color: TEAL }}
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
        <p className="text-xs text-slate-400">
          Showing {showingFrom}–{showingTo} of {total}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={handlePrevious}
            className="w-9 h-9 flex items-center justify-center border rounded-md disabled:opacity-40 bg-white hover:bg-slate-50"
            style={{ borderColor: LINE }}
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm text-slate-500 tabular-nums">
            {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={handleNext}
            className="w-9 h-9 flex items-center justify-center border rounded-md disabled:opacity-40 bg-white hover:bg-slate-50"
            style={{ borderColor: LINE }}
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

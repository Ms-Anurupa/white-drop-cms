import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Inbox,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import expenseStore, { PAGE_LIMIT } from "../zustand/Store/expenseStore";
import CategorySelect from "../components/CategorySelect";
import excelStore from "@/zustand/Store/excelStore";
import { toast } from "react-toastify";

const DATE_PILLS = [
  { label: "All Time", value: "" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Custom Range", value: "custom" },
];

const inr = (n) =>
  n !== null && n !== undefined
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }).format(Number(n))
    : "—";

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-slate-400">—</span>;
  const isFiled =
    status.toLowerCase() === "filed" || status.toLowerCase() === "yes";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold ${
        isFiled
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
          : "bg-amber-50 text-amber-700 border border-amber-200/60"
      }`}
    >
      {status}
    </span>
  );
};

const MetricCard = ({ label, amount, highlight = false }) => (
  <div
    className={`rounded-2xl border p-4 transition-all ${
      highlight
        ? "border-blue-200 bg-blue-50/50 shadow-sm"
        : "border-slate-200/80 bg-white"
    }`}
  >
    <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
    <p
      className={`mt-1.5 text-2xl font-bold tracking-tight ${
        highlight ? "text-blue-600" : "text-slate-900"
      }`}
    >
      {inr(amount)}
    </p>
  </div>
);

const ExpenseListing = () => {
  const navigate = useNavigate();

  const expenses = expenseStore((s) => s.expenses);
  const pagination = expenseStore((s) => s.pagination);
  const meta = expenseStore((s) => s.meta);
  const loading = expenseStore((s) => s.loading);
  const error = expenseStore((s) => s.error);
  const filters = expenseStore((s) => s.filters);
  const getExpenseListing = expenseStore((s) => s.getExpenseListing);
  const setFilter = expenseStore((s) => s.setFilter);
  const setDateFilter = expenseStore((s) => s.setDateFilter);
  const setPage = expenseStore((s) => s.setPage);
  const resetFilters = expenseStore((s) => s.resetFilters);

  const { downloadExcel, isDownloading } = excelStore();

  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const hasStartedLoading = useRef(false);

  useEffect(() => {
    if (loading) {
      hasStartedLoading.current = true;
    } else if (hasStartedLoading.current) {
      setInitialLoadDone(true);
    }
  }, [loading]);

  useEffect(() => {
    if (
      filters.dateFilter === "custom" &&
      (!filters.dateFrom || !filters.dateTo)
    )
      return;

    const t = setTimeout(getExpenseListing, filters.search ? 400 : 0);
    return () => clearTimeout(t);
  }, [
    filters.page,
    filters.limit,
    filters.category,
    filters.dateFilter,
    filters.dateFrom,
    filters.dateTo,
    filters.search,
    getExpenseListing,
  ]);

  const serial = (idx) => (pagination.page - 1) * PAGE_LIMIT + idx + 1;

  // True while the store is fetching, and also for the brief window before
  // the very first fetch has kicked in (so we never flash an empty state).
  const showSkeleton = loading || !initialLoadDone;

  const handleExport = () => {
    if(filters.dateFilter!="" && filters.dateFilter!="custom"){
      toast.error("Please either select ALL or Custom date range")
      return;
    }
    if((!filters.dateFrom && !filters.dateTo) || (filters.dateFrom && filters.dateTo)){
      downloadExcel("expense",filters.dateFrom,filters.dateTo);
    }else{
      toast.error("Select both To and From Date!!")
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Expenses
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
              {pagination.total || 0}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Comprehensive ledger showing purchase, GST, and filing breakdown.
          </p>
        </div>

        {/* Button Group Container */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExport} disabled={isDownloading}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98]"
          >
            <FileSpreadsheet size={18} />
            {isDownloading ? "Exporting..." : "Export To Excel"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/dashboard/create-expense")}
            className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            <Plus size={18} />
            Create Expense
          </button>
        </div>
      </div>

      {/* Metric Overview */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <MetricCard label="Today" amount={meta.today} />
        <MetricCard label="Yesterday" amount={meta.yesterday} />
        <MetricCard label="This Week" amount={meta.this_week} />
        <MetricCard label="This Month" amount={meta.this_month} />
        <MetricCard
          label={filters.dateFilter ? "Filtered Total" : "All Time Total"}
          amount={meta.totalAmount}
          highlight
        />
      </div>

      {/* Control Panel */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {DATE_PILLS.map((pill) => {
              const active = filters.dateFilter === pill.value;
              return (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => setDateFilter(pill.value)}
                  className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          >
            <RotateCcw size={13} />
            Reset Filters
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={filters.search}
              onChange={(e) => setFilter("search", e.target.value)}
              placeholder="Search vendor / supplier..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <CategorySelect
            value={filters.category}
            onChange={(id) => setFilter("category", id)}
            placeholder="All Categories"
            allowClear
          />

          {filters.dateFilter === "custom" && (
            <>
              <input
                type="date"
                value={filters.dateFrom}
                max={filters.dateTo || undefined}
                onChange={(e) => setFilter("dateFrom", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
              />
              <input
                type="date"
                value={filters.dateTo}
                min={filters.dateFrom || undefined}
                onChange={(e) => setFilter("dateTo", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
              />
            </>
          )}
        </div>
      </div>

      {/* Comprehensive Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              {/* Categorized Column Headers */}
              <tr className="border-b border-slate-200 bg-slate-100/70 font-semibold text-slate-600 uppercase tracking-wider">
                <th colSpan={6} className="px-4 py-2 border-r border-slate-200">
                  Basic Purchase Details
                </th>
                <th colSpan={7} className="px-4 py-2 border-r border-slate-200">
                  Invoice & Supplier Details
                </th>
                <th colSpan={6} className="px-4 py-2 border-r border-slate-200">
                  Tax Breakdown
                </th>
                <th colSpan={4} className="px-4 py-2">
                  Filing Compliance
                </th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-3 py-3 border-r border-slate-100">#</th>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-3 py-3">Qty</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3 border-r border-slate-200">
                  Purchase Date
                </th>

                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">GSTIN</th>
                <th className="px-4 py-3">Invoice #</th>
                <th className="px-4 py-3">Invoice Type</th>
                <th className="px-4 py-3">Invoice Date</th>
                <th className="px-4 py-3">Invoice Value</th>
                <th className="px-4 py-3 border-r border-slate-200">
                  Place of Supply
                </th>

                <th className="px-4 py-3">Taxable Value</th>
                <th className="px-4 py-3">IGST</th>
                <th className="px-4 py-3">CGST</th>
                <th className="px-4 py-3">SGST / UTGST</th>
                <th className="px-4 py-3">Cess</th>
                <th className="px-4 py-3 border-r border-slate-200">
                  Reverse Tax (Rate)
                </th>

                <th className="px-4 py-3">GSTR-1 Status</th>
                <th className="px-4 py-3">GSTR-1 Period</th>
                <th className="px-4 py-3">GSTR-1 Date</th>
                <th className="px-4 py-3">GSTR-3B Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {showSkeleton &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={23} className="px-4 py-4">
                      <div className="h-5 w-full animate-pulse rounded bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!showSkeleton &&
                expenses.map((expense, idx) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Basic Purchase Details */}
                    <td className="px-3 py-3 font-mono text-slate-400 border-r border-slate-100">
                      {serial(idx)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      <div>{expense.itemName}</div>
                      {expense.notes && (
                        <div className="max-w-[180px] truncate text-[11px] font-normal text-slate-400">
                          {expense.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                        {expense.category?.name || expense.category || "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {expense.quantity
                        ? `${expense.quantity} ${expense.unit || ""}`.trim()
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {inr(expense.price)}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200 text-slate-500">
                      {formatDate(expense.purchaseDate)}
                    </td>

                    {/* Invoice & Supplier Details */}
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {expense.supplierName || expense.supplierName || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {expense.gstin || "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {expense.invoiceNumber || "—"}
                    </td>
                    <td className="px-4 py-3">{expense.invoiceType || "—"}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(expense.invoiceDate)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {inr(expense.invoiceValue)}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      {expense.placeOfSupply || "—"}
                    </td>

                    {/* Tax Breakdown */}
                    <td className="px-4 py-3 font-medium">
                      {inr(expense.taxableValue)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {inr(expense.integratedTax)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {inr(expense.centralTax)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {inr(expense.stateUtTax)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {inr(expense.cess)}
                    </td>
                    <td className="px-4 py-3 border-r border-slate-200">
                      {expense.supplyAttractReverseTax ? (
                        <span>
                          {expense.supplyAttractReverseTax}{" "}
                          {expense.reverseTaxRate
                            ? `(${expense.reverseTaxRate}%)`
                            : ""}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Filing Compliance */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={expense.gstr1IffGstr1A5FilingStatus}
                      />
                    </td>
                    <td className="px-4 py-3">
                      {expense.gstr1IffGstr1A5FilingPeriod || "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {formatDate(expense.gstr1IffGstr1A5FilingDate)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={expense.gstr3bFilingStatus} />
                    </td>
                  </tr>
                ))}

              {!showSkeleton && expenses.length === 0 && !error && (
                <tr>
                  <td colSpan={23} className="px-4 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Inbox size={24} />
                    </div>
                    <p className="mt-3 text-base font-semibold text-slate-800">
                      No expense entries found
                    </p>
                  </td>
                </tr>
              )}

              {!showSkeleton && error && (
                <tr>
                  <td colSpan={23} className="px-4 py-12 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <AlertCircle size={20} />
                    </div>
                    <p className="mt-2 text-sm font-medium text-red-600">
                      {error}
                    </p>
                    <button
                      type="button"
                      onClick={getExpenseListing}
                      className="mt-3 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Numbered Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
            {/* Page Info */}
            <p className="text-xs font-medium text-slate-500">
              Page{" "}
              <span className="font-semibold text-slate-800">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {pagination.totalPages}
              </span>
            </p>

            {/* Page Controls */}
            <div className="flex items-center gap-1.5">
              {/* First Page (<<) */}
              <button
                type="button"
                disabled={pagination.page === 1 || showSkeleton}
                onClick={() => setPage(1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                title="First Page"
              >
                «
              </button>

              {/* Previous Page (<) */}
              <button
                type="button"
                disabled={!pagination.hasPrevPage || showSkeleton}
                onClick={() => setPage(pagination.page - 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                title="Previous Page"
              >
                ‹
              </button>

              {/* Page Numbers */}
              {(() => {
                const pages = [];
                const total = pagination.totalPages;
                const current = pagination.page;

                let start = Math.max(1, current - 1);
                let end = Math.min(total, current + 1);

                if (current === 1) end = Math.min(total, 3);
                if (current === total) start = Math.max(1, total - 2);

                if (start > 1) {
                  pages.push(
                    <button
                      key={1}
                      type="button"
                      onClick={() => setPage(1)}
                      className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      1
                    </button>,
                  );
                  if (start > 2) {
                    pages.push(
                      <span
                        key="dots-start"
                        className="px-1 text-xs text-slate-400 select-none"
                      >
                        ...
                      </span>,
                    );
                  }
                }

                for (let i = start; i <= end; i++) {
                  const isActive = i === current;
                  pages.push(
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(i)}
                      className={`h-8 w-8 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {i}
                    </button>,
                  );
                }

                if (end < total) {
                  if (end < total - 1) {
                    pages.push(
                      <span
                        key="dots-end"
                        className="px-1 text-xs text-slate-400 select-none"
                      >
                        ...
                      </span>,
                    );
                  }
                  pages.push(
                    <button
                      key={total}
                      type="button"
                      onClick={() => setPage(total)}
                      className="h-8 w-8 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                    >
                      {total}
                    </button>,
                  );
                }

                return pages;
              })()}

              {/* Next Page (>) */}
              <button
                type="button"
                disabled={!pagination.hasNextPage || showSkeleton}
                onClick={() => setPage(pagination.page + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                title="Next Page"
              >
                ›
              </button>

              {/* Last Page (>>) */}
              <button
                type="button"
                disabled={
                  pagination.page === pagination.totalPages || showSkeleton
                }
                onClick={() => setPage(pagination.totalPages)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                title="Last Page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseListing;

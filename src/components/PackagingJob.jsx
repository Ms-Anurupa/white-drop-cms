import React, { useEffect, useMemo } from "react";
import {
    Package,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    X,
    Loader2,
    ShoppingBag,
    Repeat,
    Boxes,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import usePackagingJobStore from "@/zustand/Store/packagingJobStore";

const SORT_FIELDS = [
    { value: "deliveryDate", label: "Delivery date" },
    { value: "createdAt", label: "Created" },
    { value: "totalCount", label: "Total packaged" },
    { value: "totalOrders", label: "Orders" },
    { value: "totalSubscriptions", label: "Subscriptions" },
];

const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });

const fmtDateTime = (d) =>
    new Date(d).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
    });

const fmtNum = (n) => new Intl.NumberFormat("en-IN").format(n ?? 0);

const isToday = (d) => {
    const a = new Date(d);
    const b = new Date();
    return (
        a.getUTCFullYear() === b.getUTCFullYear() &&
        a.getUTCMonth() === b.getUTCMonth() &&
        a.getUTCDate() === b.getUTCDate()
    );
};

// -----------------------------------------------------------------------
// Summary strip — today / yesterday / this week / this month, from
// meta.summary on the list response.
// -----------------------------------------------------------------------
function SummaryStrip({ summary, loading }) {
    const cards = [
        { key: "today", label: "Today" },
        { key: "yesterday", label: "Yesterday" },
        { key: "thisWeek", label: "This week" },
        { key: "thisMonth", label: "This month" },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cards.map(({ key, label }) => {
                const s = summary?.[key];
                return (
                    <div
                        key={key}
                        className="rounded-lg border border-slate-200 bg-white p-4"
                    >
                        <p className="text-sm text-slate-500">{label}</p>
                        {loading || !s ? (
                            <div className="mt-2 h-7 w-16 animate-pulse rounded bg-slate-100" />
                        ) : (
                            <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-slate-900">
                                {fmtNum(s.totalCount)}
                            </p>
                        )}
                        {!loading && s && (
                            <p className="mt-1 text-xs text-slate-400">
                                {fmtNum(s.jobsDone)} {s.jobsDone === 1 ? "job" : "jobs"} ·{" "}
                                {fmtNum(s.totalOrders)} orders · {fmtNum(s.totalSubscriptions)}{" "}
                                subs
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// -----------------------------------------------------------------------
// Filter bar — date range + sort control
// -----------------------------------------------------------------------
function FilterBar({ filters, onChange, onReset, onRefresh, refreshing }) {
    return (
      <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">From</label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => {
                const startDate = e.target.value;
                onChange({ startDate });
              }}
              className="rounded-md border border-slate-300 py-1.5 pl-8 pr-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">To</label>
          <div className="relative">
            <Calendar className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => {
                const endDate = e.target.value;
                onChange({
                  endDate,
                });
              }}
              className="rounded-md border border-slate-300 py-1.5 pl-8 pr-2 text-sm text-slate-700 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onChange({
              sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
            })
          }
          className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          {filters.sortOrder === "asc" ? (
            <ArrowUp className="h-3.5 w-3.5" />
          ) : (
            <ArrowDown className="h-3.5 w-3.5" />
          )}
          {filters.sortOrder === "asc" ? "Ascending" : "Descending"}
        </button>

        {(filters.startDate || filters.endDate) && (
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm text-red-500 decoration-slate-300 underline-offset-2 hover:text-red-700"
          >
            Clear dates
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="cursor-pointer flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
    );
}

// -----------------------------------------------------------------------
// Table
// -----------------------------------------------------------------------
function SortHeader({ field, label, filters, onChange, align = "left" }) {
    const active = filters.sortBy === field;
    return (
        <button
            type="button"
            onClick={() =>
                onChange({
                    sortBy: field,
                    sortOrder: active && filters.sortOrder === "desc" ? "asc" : "desc",
                })
            }
            className={`flex w-full items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500 hover:text-slate-700 ${align === "right" ? "justify-end" : "justify-start"
                }`}
        >
            {label}
            {active ? (
                filters.sortOrder === "desc" ? (
                    <ArrowDown className="h-3 w-3" />
                ) : (
                    <ArrowUp className="h-3 w-3" />
                )
            ) : (
                <ArrowUpDown className="h-3 w-3 opacity-40" />
            )}
        </button>
    );
}

function JobsTable({ jobs, loading, filters, onChange, onSelect }) {
    if (loading) {
        return (
            <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3.5">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                        <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-100" />
                        <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                        <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                    </div>
                ))}
            </div>
        );
    }

    if (!jobs.length) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white py-16 text-center">
                <Boxes className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">
                    No packaging jobs in this range
                </p>
                <p className="text-xs text-slate-400">
                    Try widening the date filter or clearing it.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                        <th className="px-4 py-2.5 text-left">
                            <SortHeader
                                field="deliveryDate"
                                label="Delivery date"
                                filters={filters}
                                onChange={onChange}
                            />
                        </th>
                        <th className="px-4 py-2.5 text-left">
                            <SortHeader
                                field="totalOrders"
                                label="Orders"
                                filters={filters}
                                onChange={onChange}
                                align="left"
                            />
                        </th>
                        <th className="px-4 py-2.5 text-lfet">
                            <SortHeader
                                field="totalSubscriptions"
                                label="Subs"
                                filters={filters}
                                onChange={onChange}
                                align="left"
                            />
                        </th>
                        <th className="px-4 py-2.5 text-left">
                            <SortHeader
                                field="totalCount"
                                label="Total packaged"
                                filters={filters}
                                onChange={onChange}
                                align="left"
                            />
                        </th>
                        <th className="px-4 py-2.5 text-left">
                            <SortHeader
                                field="createdAt"
                                label="Generated"
                                filters={filters}
                                onChange={onChange}
                            />
                        </th>
                        <th className="px-4 py-2.5" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {jobs.map((job) => (
                        <tr
                            key={job.id}
                            onClick={() => onSelect(job.id)}
                            className="cursor-pointer hover:bg-sky-50/60"
                        >
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900">
                                        {fmtDate(job.deliveryDate)}
                                    </span>
                                    {isToday(job.deliveryDate) && (
                                        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                                            Today
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-left font-mono tabular-nums text-slate-600">
                                {fmtNum(job.totalOrders)}
                            </td>
                            <td className="px-4 py-3 text-left font-mono tabular-nums text-slate-600">
                                {fmtNum(job.totalSubscriptions)}
                            </td>
                            <td className="px-4 py-3 text-left font-mono text-base font-semibold tabular-nums text-slate-900">
                                {fmtNum(job.totalCount)}
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                                {fmtDateTime(job.createdAt)}
                            </td>
                            <td className="px-4 py-3 text-left">
                                <span className="text-xs font-medium text-sky-600">
                                    View breakdown &rsaquo;
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Pagination({ pagination, onPageChange }) {
    if (!pagination) return null;
    const {
        currentPage,
        totalPages,
        totalRecords,
        limit,
        hasNextPage,
        hasPrevPage,
    } = pagination;
    const start = totalRecords === 0 ? 0 : (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalRecords);

    return (
        <div className="flex items-center justify-between px-1 py-2">
            <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                    {start}–{end}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">
                    {fmtNum(totalRecords)}
                </span>
            </p>
            <div className="flex items-center gap-1">
                <button
                    type="button"
                    disabled={!hasPrevPage}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs text-slate-500">
                    Page {currentPage} of {Math.max(totalPages, 1)}
                </span>
                <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Slide-over detail panel — per-variant breakdown for one packaging job
// -----------------------------------------------------------------------
function JobDetailPanel({ onClose }) {
    // Individual primitive/function selectors — never an object-literal
    // selector, to avoid the Zustand infinite-re-render class of bug.
    // The fetch itself was already kicked off by the row click that set
    // selectedJobId (see PackagingJob's onSelect={getPackagingDetailsById}).
    const job = usePackagingJobStore((s) => s.selectedJob);
    const loading = usePackagingJobStore((s) => s.selectedJobLoading);
    const error = usePackagingJobStore((s) => s.selectedJobError);

    const details = job?.packagingDetails ?? [];

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div
                className="absolute inset-0 bg-slate-900/30"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                    <div>
                        <h2 className="text-sm font-medium text-slate-500">
                            Packaging job
                        </h2>
                        <p className="text-lg font-semibold text-slate-900">
                            {job ? fmtDate(job.deliveryDate) : loading ? "Loading…" : "—"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {loading && (
                        <div className="flex items-center justify-center py-16 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {job && !loading && (
                        <>
                            <div className="mb-5 grid grid-cols-3 gap-2">
                                <div className="rounded-md bg-slate-50 p-3 text-center">
                                    <ShoppingBag className="mx-auto mb-1 h-4 w-4 text-slate-400" />
                                    <p className="font-mono text-lg font-semibold tabular-nums text-slate-900">
                                        {fmtNum(job.totalOrders)}
                                    </p>
                                    <p className="text-[11px] text-slate-500">Orders</p>
                                </div>
                                <div className="rounded-md bg-slate-50 p-3 text-center">
                                    <Repeat className="mx-auto mb-1 h-4 w-4 text-slate-400" />
                                    <p className="font-mono text-lg font-semibold tabular-nums text-slate-900">
                                        {fmtNum(job.totalSubscriptions)}
                                    </p>
                                    <p className="text-[11px] text-slate-500">Subscriptions</p>
                                </div>
                                <div className="rounded-md bg-sky-50 p-3 text-center">
                                    <Package className="mx-auto mb-1 h-4 w-4 text-sky-500" />
                                    <p className="font-mono text-lg font-semibold tabular-nums text-sky-700">
                                        {fmtNum(job.totalCount)}
                                    </p>
                                    <p className="text-[11px] text-sky-600">Total</p>
                                </div>
                            </div>

                            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                                Breakdown by variant
                            </h3>

                            {details.length === 0 ? (
                                <p className="rounded-md border border-dashed border-slate-200 p-4 text-center text-sm text-slate-400">
                                    No variant breakdown recorded for this job.
                                </p>
                            ) : (
                                <div className="overflow-hidden rounded-md border border-slate-200">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-xs text-slate-500">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium">
                                                    Variant
                                                </th>
                                                <th className="px-3 py-2 text-right font-medium">
                                                    Bottles
                                                </th>
                                                <th className="px-3 py-2 text-right font-medium">
                                                    Total volume
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {details.map((d) => (
                                                <tr key={d.variantId}>
                                                    <td className="px-3 py-2 text-slate-700">
                                                        {d.quantity} {d.unit}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-500">
                                                        {fmtNum(d.bottleCount)}
                                                    </td>
                                                    <td className="px-3 py-2 text-right font-mono font-medium tabular-nums text-slate-900">
                                                        {fmtNum(d.quantity * d.bottleCount)} {d.unit}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <p className="mt-4 text-xs text-slate-400">
                                Generated {fmtDateTime(job.createdAt)}
                                {job.updatedAt !== job.createdAt &&
                                    ` · Updated ${fmtDateTime(job.updatedAt)}`}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// -----------------------------------------------------------------------
// Root component
// -----------------------------------------------------------------------
export default function PackagingJob() {
    // Individual primitive/function selectors throughout — same convention
    // that fixed the Zustand infinite-re-render bug in Inventory.jsx. Never
    // select `{ ...multiple, fields }` as one object literal here.
    const filters = usePackagingJobStore((s) => s.filters);
    const jobs = usePackagingJobStore((s) => s.jobs);
    const pagination = usePackagingJobStore((s) => s.pagination);
    const summary = usePackagingJobStore((s) => s.summary);
    const loading = usePackagingJobStore((s) => s.loading);
    const refreshing = usePackagingJobStore((s) => s.refreshing);
    const error = usePackagingJobStore((s) => s.error);
    const selectedJobId = usePackagingJobStore((s) => s.selectedJobId);

    const fetchPackagingJobs = usePackagingJobStore((s) => s.fetchPackagingJobs);
    const getPackagingDetailsById = usePackagingJobStore(
        (s) => s.getPackagingDetailsById,
    );
    const setFilters = usePackagingJobStore((s) => s.setFilters);
    const setPage = usePackagingJobStore((s) => s.setPage);
    const resetFilters = usePackagingJobStore((s) => s.resetFilters);
    const clearSelectedJob = usePackagingJobStore((s) => s.clearSelectedJob);

    useEffect(() => {
        if ((filters.startDate && !filters.endDate) || (!filters.startDate && filters.endDate)) {
            return;
        }
        fetchPackagingJobs();
    }, [filters]);

    const rangeLabel = useMemo(() => {
      if (!filters.startDate && !filters.endDate) {
        return "All time";
      }

      if (filters.startDate && filters.endDate) {
        return `${fmtDate(filters.startDate)} – ${fmtDate(filters.endDate)}`;
      }

      return "Select both dates to apply filter";
    }, [filters.startDate, filters.endDate]);

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-slate-900">
                            Packaging jobs
                        </h1>
                        <p className="text-sm text-slate-500">{rangeLabel}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <SummaryStrip summary={summary} loading={loading && !summary} />
                </div>

                <div className="mb-4">
                    <FilterBar
                        filters={filters}
                        onChange={setFilters}
                        onReset={resetFilters}
                        onRefresh={() => fetchPackagingJobs(true)}
                        refreshing={refreshing}
                    />
                </div>

                <JobsTable
                    jobs={jobs}
                    loading={loading}
                    filters={filters}
                    onChange={setFilters}
                    onSelect={getPackagingDetailsById}
                />

                <Pagination
                    pagination={pagination}
                    onPageChange={(page) => setPage(page)}
                />
            </div>

            {selectedJobId && <JobDetailPanel onClose={clearSelectedJob} />}
        </div>
    );
}

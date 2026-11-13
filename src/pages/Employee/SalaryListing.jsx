import ExportExcelButton from "@/components/ExportExcelButton";
import employeeStore from "@/zustand/Store/employeeStore";
import { useEffect, useRef, useState } from "react";
import { getMonthName } from "../../utils/salaryHelper";


const PAGE_SIZES = [10, 25, 50, 100];
const CURRENT_YEAR = new Date().getFullYear();

const inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

const fmtDate = (value) =>
    new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

const fmtTime = (value) =>
    new Date(value).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
    });

const initials = (name = "") =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join("") || "?";

const toPeriodValue = (month, year) =>
  month ? `${year}-${String(month).padStart(2, "0")}` : "";

function pageWindow(current, total) {
    const wanted = new Set([1, total, current - 1, current, current + 1]);
    const nums = [...wanted]
        .filter((n) => n >= 1 && n <= total)
        .sort((a, b) => a - b);

    const result = [];
    nums.forEach((n, i) => {
        if (i && n - nums[i - 1] > 1) result.push(`gap-${n}`);
        result.push(n);
    });
    return result;
}

/* ---------- shared class strings ---------- */
const fieldLabel = "flex min-w-0 flex-col gap-1";
const fieldLabelText =
    "text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const fieldControl =
    "h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-[13px] text-slate-800 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";

const th =
    "whitespace-nowrap border-b border-slate-200 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const td = "px-2.5 py-1.5 align-middle";

/* Money cell: muted dash for zero so the eye lands on real values */
function Money({ value, tone = "text-slate-700" }) {
    return value === 0 ? (
        <span className="text-slate-300">—</span>
    ) : (
        <span className={tone}>{inr.format(value)}</span>
    );
}

const NoteIcon = ({ note }) => (
    <span
        title={note}
        aria-label={`Note: ${note}`}
        tabIndex={0}
        className="inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-700"
    >
        i
    </span>
);

export default function SalaryPaymentLogs() {
    const logs = employeeStore((state) => state.salaryLogs);
    const pagination = employeeStore((state) => state.salaryLogPagination);
    const summary = employeeStore((state) => state.salaryLogSummary);
    const filters = employeeStore((state) => state.salaryFilters);
    const loading = employeeStore((state) => state.loading);
    const error = employeeStore((state) => state.error);
    const employees = employeeStore((state) => state.employees);

    const getSalaryPaymentLogs = employeeStore(
        (state) => state.getSalaryPaymentLogs,
    );
    const setSalaryFilters = employeeStore((state) => state.setSalaryFilters);
    const resetSalaryFilters = employeeStore((state) => state.resetSalaryFilters);
    const getEmployeeList = employeeStore((state) => state.getEmployeeList);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchText, setSearchText] = useState(filters?.search || "");
    const [toast, setToast] = useState(null);
    const salaryDateRef = useRef(null);

    useEffect(() => {
        if (!employees.length) {
            getEmployeeList({ page: 1, limit: 100 }).catch(() => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getSalaryPaymentLogs(page, limit);
    }, [filters, page, limit, getSalaryPaymentLogs]);

    useEffect(() => {
        if (searchText.trim() === (filters?.search || "")) return;
        const timeout = setTimeout(() => {
            setPage(1);
            setSalaryFilters({ search: searchText.trim() });
        }, 400);
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchText]);

    // auto-dismiss toast
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 2500);
        return () => clearTimeout(t);
    }, [toast]);

    const applyFilters = (patch) => {
        setPage(1);
        setSalaryFilters(patch);
    };

    const handleReset = () => {
        setSearchText("");
        setPage(1);
        resetSalaryFilters();
    };

    const dateMode = Boolean(filters?.salaryDate);

    const periodLabel = dateMode
        ? fmtDate(`${filters.salaryDate}T00:00:00`)
        : filters?.month
            ? `${getMonthName(filters.month)} ${filters.year}`
            : `${filters?.year || CURRENT_YEAR}`;

    const selectedEmployee = employees.find(
        (employee) => employee.id === filters?.employeeId,
    );

    const chips = [];
    if (filters?.search) {
        chips.push({
            key: "search",
            label: `“${filters.search}”`,
            clear: () => {
                setSearchText("");
                applyFilters({ search: "" });
            },
        });
    }
    if (filters?.employeeId) {
        chips.push({
            key: "employeeId",
            label: selectedEmployee?.empName || "Selected employee",
            clear: () => applyFilters({ employeeId: "" }),
        });
    }
    if (filters?.salaryDate) {
        chips.push({
            key: "salaryDate",
            label: fmtDate(`${filters.salaryDate}T00:00:00`),
            clear: () => applyFilters({ salaryDate: "" }),
        });
    }

    const handleRefresh = async () => {
        try {
            await getSalaryPaymentLogs(page, limit);
            setToast({ message: "Salary logs refreshed", tone: "ok" });
        } catch {
            setToast({ message: "Unable to refresh salary logs", tone: "error" });
        }
    };

    const firstLoad = loading && logs.length === 0;
    const total = pagination?.totalRecords ?? 0;
    const from =
        total === 0 ? 0 : (pagination.currentPage - 1) * pagination.limit + 1;
    const to =
        total === 0
            ? 0
            : Math.min(pagination.currentPage * pagination.limit, total);

    /* mobile: each td becomes a labelled row via data-label */
    const mobileCell =
        "max-[720px]:flex max-[720px]:items-center max-[720px]:justify-between max-[720px]:px-0 max-[720px]:py-1 max-[720px]:before:text-[11px] max-[720px]:before:font-medium max-[720px]:before:text-slate-500 max-[720px]:before:content-[attr(data-label)]";
    const numCell = `${td} whitespace-nowrap text-right tabular-nums ${mobileCell}`;

    return (
      <section
        className="min-h-full bg-slate-100 p-3 text-[13px] leading-snug text-slate-800 sm:p-4 md:p-5"
        aria-labelledby="spl-title"
      >
        {/* Header */}
        <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
            <div>
              <h1
                id="spl-title"
                className="text-lg font-bold tracking-tight text-slate-800"
              >
                Salary payments
              </h1>
              <p className="text-xs text-slate-500">
                Every payout recorded for your team.
              </p>
            </div>

            <div
              className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5"
              aria-live="polite"
            >
              <span className="block text-xl font-bold leading-tight tracking-tight tabular-nums text-emerald-700">
                {firstLoad ? (
                  <span className="inline-block h-6 w-32 animate-pulse rounded bg-emerald-100" />
                ) : (
                  inr.format(summary?.totalPaidAmount ?? 0)
                )}
              </span>
              <span className="text-[11px] text-emerald-800/70">
                {firstLoad
                  ? "Loading totals…"
                  : `Paid across ${summary?.totalRecords ?? 0} ${
                      (summary?.totalRecords ?? 0) === 1
                        ? "payment"
                        : "payments"
                    } ${dateMode ? "on" : "in"} ${periodLabel}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:ml-auto">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              >
                <path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7" />
              </svg>
              Refresh
            </button>
            <ExportExcelButton type="esiReport" buttonText="ESI Report" />
            <ExportExcelButton type="paidSalary" />
          </div>
        </header>

        {/* Filters */}
        <div
          className="grid grid-cols-1 gap-2.5 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[minmax(240px,2fr)_minmax(160px,1fr)]"
          role="search"
        >
          <label className={fieldLabel}>
            <span className={fieldLabelText}>Search</span>
            <input
              type="search"
              placeholder="Employee name or phone"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={fieldControl}
            />
          </label>

          <label
            className={`${fieldLabel} cursor-pointer`}
            onClick={() => salaryDateRef.current?.showPicker()}
          >
            <span className={`${fieldLabelText} cursor-pointer`}>Paid on</span>

            <input
              ref={salaryDateRef}
              type="date"
              value={filters?.salaryDate || ""}
              onChange={(e) =>
                applyFilters({ salaryDate: e.target.value, month: "" })
              }
              className={`${fieldControl} w-full cursor-pointer`}
            />
          </label>
        </div>

        {/* Active filter chips */}
        {chips.length > 0 && (
          <div
            className="mt-2 flex flex-wrap items-center gap-1.5"
            aria-label="Active filters"
          >
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs text-teal-900 transition hover:bg-teal-200"
              >
                {chip.label}
                <span aria-hidden="true">×</span>
                <span className="sr-only">Remove filter</span>
              </button>
            ))}
            <button
              type="button"
              onClick={handleReset}
              className="p-1 text-xs text-teal-700 underline hover:text-teal-900"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            className="mt-3 flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-2.5 text-sm text-red-700"
            role="alert"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => getSalaryPaymentLogs(page, limit)}
              className="shrink-0 rounded-md border border-red-300 px-3 py-1 text-xs font-medium transition hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* Table */}
        <div
          className={`mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white transition-opacity duration-150 ${
            loading && !firstLoad ? "pointer-events-none opacity-55" : ""
          }`}
          aria-busy={loading}
        >
          <div
            className="max-h-[70vh] overflow-auto min-[721px]:overscroll-contain
                        [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-slate-100
                        [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400"
          >
            <table className="w-full border-collapse text-left text-[12px] min-[721px]:min-w-[860px]">
              <thead className="bg-slate-50 max-[720px]:sr-only min-[721px]:sticky min-[721px]:top-0 min-[721px]:z-10">
                <tr>
                  <th scope="col" className={th}>
                    Employee
                  </th>
                  <th scope="col" className={th}>
                    Period
                  </th>
                  <th scope="col" className={th}>
                    Paid on
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    Base pay
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    Prof. Tax
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    Employeer Cont. (ESI)
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    Employee Cont. (ESI)
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    LOP
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    Bonus
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    Overtime
                  </th>
                  <th scope="col" className={`${th} text-right`}>
                    Net payout
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {firstLoad &&
                  Array.from({ length: 8 }).map((_, index) => (
                    <tr
                      key={index}
                      className="max-[720px]:block max-[720px]:p-2"
                    >
                      {Array.from({ length: 10 }).map((_, cell) => (
                        <td
                          key={cell}
                          className="px-2.5 py-2.5 max-[720px]:block max-[720px]:p-1"
                        >
                          <span className="block h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                        </td>
                      ))}
                    </tr>
                  ))}

                {!firstLoad &&
                  logs?.map((row) => {
                    const emp = row?.employees;

                    const basePay = Number(row.basePay) || 0;
                    const paidAmount = Number(row.paidAmount) || 0;
                    const bonus = Number(row.bonus) || 0;
                    const overtime = Number(row.overtime) || 0;
                    const pTax = Number(row.pTax) || 0;
                    const employeeEsi = Number(row.employeeEsi) || 0;
                    const employeerEsi = Number(row.employeerEsi) || 0;
                    const lop = Number(row.lop) || 0;

                    const netPayout =
                      paidAmount + bonus + overtime - pTax - employeeEsi - employeerEsi - lop;

                    return (
                      <tr
                        key={row.id}
                        className="transition-colors even:bg-slate-50/50 hover:bg-teal-50/50 max-[720px]:block max-[720px]:p-3"
                      >
                        {/* Employee */}
                        <td
                          className={`${td} max-[720px]:block max-[720px]:p-0 max-[720px]:pb-1`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-700"
                              aria-hidden="true"
                            >
                              {initials(emp?.empName)}
                            </span>
                            <div className="min-w-0">
                              <strong className="block truncate text-[12.5px] font-semibold text-slate-800">
                                {emp?.empName || "Unknown employee"}
                              </strong>
                              <div className="truncate text-[11px] text-slate-500">
                                {emp?.empPhone || "No phone on file"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Period */}
                        <td
                          data-label="Period"
                          className={`${td} whitespace-nowrap ${mobileCell}`}
                        >
                          <div className="max-[720px]:text-right">
                            <div className="font-medium text-slate-700">
                              {getMonthName(row.month)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              FY {row.fy}
                            </div>
                          </div>
                        </td>

                        {/* Paid on */}
                        <td
                          data-label="Paid on"
                          className={`${td} whitespace-nowrap ${mobileCell}`}
                        >
                          <div className="max-[720px]:text-right">
                            <div className="text-slate-700">
                              {fmtDate(row.createdAt)}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {fmtTime(row.createdAt)}
                            </div>
                          </div>
                        </td>

                        <td data-label="Base pay" className={numCell}>
                          <Money value={basePay} />
                        </td>
                        <td data-label="Prof. Tax" className={numCell}>
                          <Money value={pTax} tone="text-rose-600" />
                        </td>
                        <td data-label="Employeer Cont. (ESI)" className={numCell}>
                          <Money value={employeerEsi} tone="text-rose-600" />
                        </td>
                        <td data-label="Employee Cont. (ESI)" className={numCell}>
                          <Money value={employeeEsi} tone="text-rose-600" />
                        </td>
                        <td data-label="LOP" className={numCell}>
                          <Money value={lop} tone="text-rose-600" />
                        </td>
                        <td data-label="Bonus" className={numCell}>
                          <Money value={bonus} tone="text-emerald-600" />
                        </td>
                        <td data-label="Overtime" className={numCell}>
                          <Money value={overtime} tone="text-emerald-600" />
                        </td>

                        {/* Net payout */}
                        <td
                          data-label="Net payout"
                          className={`${numCell} font-semibold text-emerald-700 max-[720px]:mt-1 max-[720px]:border-t max-[720px]:border-slate-100 max-[720px]:pt-2 max-[720px]:text-sm`}
                        >
                          <span className="inline-flex items-center justify-end gap-1.5">
                            {row.note && <NoteIcon note={row.note} />}
                            {inr.format(netPayout)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {!loading && !error && logs.length === 0 && (
            <div className="px-4 py-10 text-center">
              <h2 className="mb-1 text-sm font-semibold text-slate-800">
                No payments found for {periodLabel}
              </h2>
              <p className="text-xs text-slate-500">
                {chips.length > 0
                  ? "Try removing a filter or choosing a wider period."
                  : "Payments you record will appear here."}
              </p>
              {chips.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && total > 0 && (
          <nav
            className="mt-3 flex flex-wrap items-center justify-between gap-2 max-[720px]:flex-col max-[720px]:items-stretch"
            aria-label="Pagination"
          >
            <p className="text-xs tabular-nums text-slate-500">
              Showing {from}–{to} of {total}
            </p>

            <div className="flex flex-wrap items-center gap-1 max-[720px]:justify-center">
              <button
                type="button"
                disabled={!pagination.hasPrevPage || loading}
                onClick={() => setPage((c) => c - 1)}
                className="cursor-pointer inline-flex min-h-8 items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              {pageWindow(pagination.currentPage, pagination.totalPages).map(
                (number) =>
                  typeof number === "string" ? (
                    <span
                      key={number}
                      className="px-1 text-slate-500"
                      aria-hidden="true"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={number}
                      type="button"
                      aria-current={
                        number === pagination.currentPage ? "page" : undefined
                      }
                      disabled={loading}
                      onClick={() => setPage(number)}
                      className={`cursor-pointer inline-flex min-h-8 min-w-8 items-center justify-center rounded-md border px-2 py-1 text-xs tabular-nums transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        number === pagination.currentPage
                          ? "border-slate-800 bg-slate-800 text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {number}
                    </button>
                  ),
              )}

              <button
                type="button"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => setPage((c) => c + 1)}
                className="cursor-pointer inline-flex min-h-8 items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-500 max-[720px]:justify-between">
              Rows per page
              <select
                value={limit}
                onChange={(e) => {
                  setPage(1);
                  setLimit(Number(e.target.value));
                }}
                className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </nav>
        )}

        {/* Toast */}
        {toast && (
          <div
            role="status"
            className={`fixed bottom-5 right-5 z-50 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg ${
              toast.tone === "error" ? "bg-red-600" : "bg-slate-900"
            }`}
          >
            {toast.message}
          </div>
        )}
      </section>
    );
}

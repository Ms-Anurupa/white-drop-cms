import ExportExcelButton from "@/components/ExportExcelButton";
import employeeStore from "@/zustand/Store/employeeStore";
import { useEffect, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const PAGE_SIZES = [10, 25, 50, 100];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

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

function pageWindow(current, total) {
  const wanted = new Set([1, total, current - 1, current, current + 1]);

  const nums = [...wanted]
    .filter((number) => number >= 1 && number <= total)
    .sort((a, b) => a - b);

  const result = [];

  nums.forEach((number, index) => {
    if (index && number - nums[index - 1] > 1) {
      result.push(`gap-${number}`);
    }

    result.push(number);
  });

  return result;
}

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
  const [searchText, setSearchText] = useState(filters.search || "");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!employees.length) {
      getEmployeeList({ page: 1, limit: 100 }).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getSalaryPaymentLogs(page, limit);
  }, [filters, page, limit, getSalaryPaymentLogs]);

  useEffect(() => {
    if (searchText.trim() === (filters.search || "")) return;

    const timeout = setTimeout(() => {
      setPage(1);
      setSalaryFilters({ search: searchText.trim() });
    }, 400);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const applyFilters = (patch) => {
    setPage(1);
    setSalaryFilters(patch);
  };

  const handleReset = () => {
    setSearchText("");
    setPage(1);
    resetSalaryFilters();
  };

  const dateMode = Boolean(filters.salaryDate);

  const periodLabel = dateMode
    ? fmtDate(`${filters.salaryDate}T00:00:00`)
    : filters.month
      ? `${MONTHS[Number(filters.month) - 1]} ${filters.year}`
      : `${filters.year}`;

  const selectedEmployee = employees.find(
    (employee) => employee.id === filters.employeeId,
  );

  const chips = [];

  if (filters.search) {
    chips.push({
      key: "search",
      label: `“${filters.search}”`,
      clear: () => {
        setSearchText("");
        applyFilters({ search: "" });
      },
    });
  }

  if (filters.employeeId) {
    chips.push({
      key: "employeeId",
      label: selectedEmployee?.empName || "Selected employee",
      clear: () => applyFilters({ employeeId: "" }),
    });
  }

  if (filters.salaryDate) {
    chips.push({
      key: "salaryDate",
      label: fmtDate(`${filters.salaryDate}T00:00:00`),
      clear: () => applyFilters({ salaryDate: "" }),
    });
  }

  if (filters.month) {
    chips.push({
      key: "month",
      label: MONTHS[Number(filters.month) - 1],
      clear: () => applyFilters({ month: "" }),
    });
  }

  if (Number(filters.year) !== CURRENT_YEAR && !dateMode) {
    chips.push({
      key: "year",
      label: String(filters.year),
      clear: () => applyFilters({ year: CURRENT_YEAR }),
    });
  }

   const notify = (message, tone = "ok") => {
     setToast({
       message,
       tone,
     });
   };

  const handleRefresh = async () => {
    try {
      await getEmployeeList();
      notify("Due register refreshed");
    } catch {
      notify("Unable to refresh due register", "error");
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

  return (
    <section
      className="min-h-full bg-slate-100 p-3 text-[14px] leading-relaxed text-slate-800 sm:p-5 md:p-6"
      aria-labelledby="spl-title"
    >
      {/* Compact Header */}
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left Section: Title & Amount Summary */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
          <div>
            <h1
              id="spl-title"
              className="text-xl font-bold tracking-tight text-slate-800"
            >
              Salary payments
            </h1>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Every payout recorded for your team.
            </p>
          </div>

          {/* Amount Summary (Left Aligned) */}
          <div
            className="border-slate-200 text-left sm:border-l sm:pl-6"
            aria-live="polite"
          >
            <span className="block text-2xl font-bold leading-tight tracking-tight text-emerald-700 sm:text-3xl">
              {firstLoad ? (
                <span className="inline-block h-7 w-36 animate-pulse rounded bg-slate-200" />
              ) : (
                inr.format(summary?.totalPaidAmount ?? 0)
              )}
            </span>

            <span className="text-xs text-slate-500">
              {firstLoad
                ? "Loading totals…"
                : `Paid across ${summary?.totalRecords ?? 0} ${
                    (summary?.totalRecords ?? 0) === 1 ? "payment" : "payments"
                  } ${dateMode ? "on" : "in"} ${periodLabel}`}
            </span>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => handleRefresh()}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
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

          <ExportExcelButton type="paidSalary" />
        </div>
      </header>

      {/* Filters */}
      <div
        className="grid grid-cols-1 gap-2.5 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,2fr)_repeat(3,minmax(130px,1fr))]"
        role="search"
      >
        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">Search</span>
          <input
            type="search"
            placeholder="Employee name or phone"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex min-w-0 flex-col gap-1">
          <span className="text-xs font-semibold text-slate-600">
            Exact date
          </span>
          <input
            type="date"
            value={filters.salaryDate}
            onChange={(event) =>
              applyFilters({
                salaryDate: event.target.value,
                month: "",
              })
            }
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      {dateMode && (
        <p className="mt-2 text-xs text-slate-500">
          Showing a single day, so month and year are paused. Clear the date to
          use them again.
        </p>
      )}

      {/* Active Filter Chips */}
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
              className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-900 transition hover:bg-blue-200"
            >
              {chip.label}
              <span aria-hidden="true">×</span>
              <span className="sr-only">Remove filter</span>
            </button>
          ))}

          <button
            type="button"
            onClick={handleReset}
            className="p-1 text-xs text-blue-600 underline hover:text-blue-800"
          >
            Reset all
          </button>
        </div>
      )}

      {/* Error Alert */}
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

      {/* Payment Table */}
      <div
        className={`mt-3 overflow-hidden rounded-lg border border-slate-200 bg-white transition-opacity duration-150 ${
          loading && !firstLoad ? "pointer-events-none opacity-55" : ""
        }`}
        aria-busy={loading}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="bg-slate-50 max-[720px]:sr-only">
              <tr>
                <th
                  scope="col"
                  className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="border-b border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                >
                  Paid on
                </th>
                <th
                  scope="col"
                  className="border-b border-slate-200 px-3 py-2 text-right text-xs font-semibold text-slate-600"
                >
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {firstLoad &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="max-[720px]:block max-[720px]:p-2">
                    {[1, 2, 3].map((cell) => (
                      <td
                        key={cell}
                        className="px-3 py-2 max-[720px]:block max-[720px]:p-1"
                      >
                        <span className="block h-3 w-3/4 animate-pulse rounded bg-slate-200" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!firstLoad &&
                logs.map((row) => {
                  const [first, ...others] = row.employees || [];

                  return (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-slate-50 max-[720px]:block max-[720px]:p-2"
                    >
                      <td className="px-3 py-2 align-middle max-[720px]:block max-[720px]:p-0">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-semibold text-emerald-700"
                            aria-hidden="true"
                          >
                            {initials(first?.empName)}
                          </span>

                          <div className="min-w-0">
                            <strong className="block text-sm font-semibold text-slate-800">
                              {first?.empName || "Unknown employee"}
                            </strong>

                            {others.length > 0 && (
                              <span className="text-xs text-slate-500">
                                +{others.length} more
                              </span>
                            )}

                            <div className="text-xs text-slate-500">
                              {first?.empPhone || "No phone on file"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 align-middle max-[720px]:flex max-[720px]:justify-between max-[720px]:p-0 max-[720px]:pt-1">
                        <div className="text-sm text-slate-700">
                          {fmtDate(row.createdAt)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {fmtTime(row.createdAt)}
                        </div>
                      </td>

                      <td className="px-3 py-2 text-right align-middle text-sm font-semibold tabular-nums whitespace-nowrap text-emerald-700 max-[720px]:block max-[720px]:pt-1 max-[720px]:text-left max-[720px]:text-base">
                        {inr.format(
                          (row.paidAmount ?? 0) - (row.deduction ?? 0),
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && !error && logs.length === 0 && (
          <div className="px-4 py-8 text-center">
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
            {from}–{to} of {total}
          </p>

          <div className="flex flex-wrap items-center gap-1 max-[720px]:justify-center">
            <button
              type="button"
              disabled={!pagination.hasPrevPage || loading}
              onClick={() => setPage((current) => current - 1)}
              className="inline-flex min-h-8 items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
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
                    className={`inline-flex min-h-8 min-w-8 items-center justify-center rounded-md border px-2 py-1 text-xs tabular-nums transition disabled:cursor-not-allowed disabled:opacity-50 ${
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
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex min-h-8 items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-500 max-[720px]:justify-between">
            Rows per page
            <select
              value={limit}
              onChange={(event) => {
                setPage(1);
                setLimit(Number(event.target.value));
              }}
              className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
    </section>
  );
}

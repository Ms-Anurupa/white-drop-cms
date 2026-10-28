import employeeStore from "@/zustand/Store/employeeStore";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const PAGE_SIZE = 10;
const BACK_ROUTE = "/dashboard/employee-list";

/* ---------- helpers ---------- */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const num = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));

// Use paidAmount directly from response; fallback to calculated value
const net = (r) =>
  r.paidAmount !== undefined
    ? num(r.paidAmount)
    : num(r.baseSalary ?? r.salary) + num(r.bonus) + num(r.overtime) - num(r.deduction);

const dateLabel = (r) =>
  r.period
    ? new Date(r.period).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : new Date(r.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const money = (n) => inr.format(n);
const signed = (n) => `${n > 0 ? "+" : "−"}${money(Math.abs(n))}`;

/* ---------- small pieces ---------- */

const Icon = ({ d, className = "h-4 w-4" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const ICONS = {
  back: "M15 18l-6-6 6-6",
  refresh: "M20 11a8 8 0 10-2.3 5.7M20 4v7h-7",
  empty: "M3 7h18M3 12h18M3 17h10",
  filter: "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
};

function Delta({ value }) {
  if (value === null)
    return <span className="text-stone-400">First record</span>;
  if (value === 0) return <span className="text-stone-400">No change</span>;
  return (
    <span className={value > 0 ? "text-emerald-700" : "text-rose-700"}>
      {signed(value)}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4" aria-hidden="true">
      <div className="h-24 rounded-xl bg-stone-100" />
      <div className="h-64 rounded-xl bg-stone-100" />
    </div>
  );
}

/* ---------- main ---------- */

const EmployeeSalary = () => {
  const params = useParams();
  const location = useLocation();
  const targetId = params.employeeId || location.state?.employeeId;

  const employees = employeeStore((s) => s.employees);
  const salaryRecords = employeeStore((s) => s.salaryRecords);
  const salaryPagination = employeeStore((s) => s.salaryPagination);
  const salarySummary = employeeStore((s) => s.salarySummary); // Assuming store passes `summary`
  const loading = employeeStore((s) => s.loading);
  const error = employeeStore((s) => s.error);

  const fetchLogs =
    employeeStore((s) => s.getSalaryPaymentLogsById) ||
    employeeStore((s) => s.getEmployeeSalariesById);

  const [ready, setReady] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const load = async (extraParams = {}, append = false) => {
    if (!targetId || !fetchLogs) return;

    const filterParams = { ...extraParams };
    if (selectedYear) {
      filterParams.year = selectedYear;
    } else {
      if (startDate) filterParams.startDate = startDate;
      if (endDate) filterParams.endDate = endDate;
    }

    try {
      await fetchLogs(targetId, { limit: PAGE_SIZE, ...filterParams }, append);
    } catch {
      /* Handled in store */
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(false);
    if (targetId) {
      load().finally(() => setReady(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, selectedYear, startDate, endDate]);

  const employee = useMemo(
    () =>
      employees.find((e) => e.id === targetId) ||
      location.state?.employee ||
      null,
    [employees, targetId, location.state],
  );

  const records = ready ? salaryRecords : [];
  const latest = records[0];
  const previous = records[1];
  const change = latest && previous ? net(latest) - net(previous) : null;
  const average = records.length
    ? records.reduce((sum, r) => sum + net(r), 0) / records.length
    : 0;
  const hasMore = Boolean(salaryPagination?.hasNextPage);

  // Available year selections for filter dropdown
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <Link
        to={BACK_ROUTE}
        className="mb-4 inline-flex items-center gap-1 rounded-md text-sm text-stone-600 hover:text-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
      >
        <Icon d={ICONS.back} />
        Employees
      </Link>

      {/* Header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
            {initials(employee?.empName)}
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-stone-900">
              {employee?.empName || "Employee"}
            </h1>
            <p className="text-sm text-stone-500">
              {employee?.empPhone ? `${employee.empPhone} · ` : ""}Salary
              history
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          <Icon
            d={ICONS.refresh}
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Date & Year Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:px-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
          <Icon d={ICONS.filter} className="h-3.5 w-3.5" />
          Filter:
        </div>

        {/* Filter by Year */}
        <select
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            setStartDate("");
            setEndDate("");
          }}
          className="cursor-pointer rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 focus:border-teal-600 focus:outline-none"
        >
          <option className="cursor-pointer" value="">
            All Years
          </option>
          {yearOptions.map((y) => (
            <option className="cursor-pointer" key={y} value={y}>
              Year {y}
            </option>
          ))}
        </select>

        <span className="text-xs text-stone-400">or range</span>

        {/* Date Range Inputs */}
        <input
          type="date"
          value={startDate}
          disabled={Boolean(selectedYear)}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-800 disabled:bg-stone-100 disabled:text-stone-400 focus:border-teal-600 focus:outline-none"
        />
        <span className="text-xs text-stone-400">to</span>
        <input
          type="date"
          value={endDate}
          disabled={Boolean(selectedYear)}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-800 disabled:bg-stone-100 disabled:text-stone-400 focus:border-teal-600 focus:outline-none"
        />

        {(selectedYear || startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setSelectedYear("");
              setStartDate("");
              setEndDate("");
            }}
            className="cursor-pointer ml-auto text-xs font-medium text-stone-500 hover:text-stone-800 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {!ready ? (
        <Skeleton />
      ) : error && records.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-white px-6 py-14 text-center">
          <p className="text-sm text-stone-700">{error}</p>
          <button
            type="button"
            onClick={() => load()}
            className="mt-4 rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Try again
          </button>
        </div>
      ) : records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-white px-6 py-14 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-500">
            <Icon d={ICONS.empty} className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-stone-800">
            No salary records found
          </p>
          <p className="max-w-sm text-sm text-stone-500">
            No salary records match the selected time frame. Try clearing
            filters or changing dates.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          {/* Summary Stats */}
          <dl className="grid grid-cols-1 divide-y divide-stone-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {/* Aggregate yearly/filtered total from backend summary */}
            <div className="px-5 py-4 sm:px-6">
              <dt className="text-sm text-stone-500">
                {selectedYear
                  ? `Total Salary (${selectedYear})`
                  : "Total Filtered Salary"}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-teal-700">
                {money(
                  salarySummary?.totalYearSalary ??
                    records.reduce((acc, r) => acc + net(r), 0),
                )}
              </dd>
              <dd className="mt-0.5 text-xs text-stone-500">
                {salarySummary?.totalRecords ?? records.length} total payments
              </dd>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <dt className="text-sm text-stone-500">Change from previous</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                <Delta value={change} />
              </dd>
            </div>

            <div className="px-5 py-4 sm:px-6">
              <dt className="text-sm text-stone-500">Average net pay</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                {money(average)}
              </dd>
              <dd className="mt-0.5 text-xs text-stone-500">
                Across {records.length} loaded{" "}
                {records.length === 1 ? "record" : "records"}
              </dd>
            </div>
          </dl>

          {/* Ledger Table */}
          <div className="overflow-x-auto border-t border-stone-200">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500">
                <tr>
                  <th className="py-3 pl-5 pr-3 font-medium sm:pl-6">
                    {records[0]?.period ? "Month" : "Date"}
                  </th>
                  <th className="px-3 py-3 text-right font-medium">Net Paid</th>
                  <th className="px-3 py-3 text-right font-medium">Bonus</th>
                  <th className="px-3 py-3 text-right font-medium">Overtime</th>
                  <th className="px-3 py-3 text-right font-medium">
                    Deductions
                  </th>
                  <th className="py-3 pl-3 pr-5 text-right font-medium sm:pr-6">
                    Change
                  </th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {records.map((r, i) => {
                  const prev = records[i + 1];
                  const diff = prev ? net(r) - net(prev) : null;
                  const deductionAmt = num(r.deduction);

                  return (
                    <tr
                      key={r.id || i}
                      className={`border-t border-stone-200 ${
                        i === 0 ? "bg-teal-50/40" : "hover:bg-stone-50"
                      }`}
                    >
                      <td className="py-3 pl-5 pr-3 sm:pl-6">
                        <div className="font-medium text-stone-900">
                          {dateLabel(r)}
                        </div>
                        {r.note && (
                          <div
                            className="mt-0.5 max-w-[220px] truncate text-xs text-stone-500"
                            title={r.note}
                          >
                            {r.note}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-stone-900">
                        {money(num(r.paidAmount))}
                      </td>
                      <td className="px-3 py-3 text-right text-stone-600">
                        {money(num(r.bonus))}
                      </td>
                      <td className="px-3 py-3 text-right text-stone-600">
                        {money(num(r.overtime))}
                      </td>
                      {/* Fixed: Corrected r.deduction usage */}
                      <td className="px-3 py-3 text-right text-stone-600">
                        {deductionAmt > 0 ? (
                          <span className="text-rose-700">
                            −{money(deductionAmt)}
                          </span>
                        ) : (
                          money(0)
                        )}
                      </td>
                      <td className="py-3 pl-3 pr-5 text-right text-xs sm:pr-6">
                        <Delta value={diff} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-5 py-3 text-sm text-stone-600 sm:px-6">
            <span>
              Showing {records.length}{" "}
              {records.length === 1 ? "record" : "records"}
              {hasMore ? "" : " · end of history"}
            </span>
            {error && <span className="text-rose-700">{error}</span>}
            {hasMore && (
              <button
                type="button"
                onClick={() =>
                  load({ cursor: salaryPagination.nextCursor }, true)
                }
                disabled={loading}
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                {loading ? "Loading…" : "Load older records"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalary;

import ExportExcelButton from "@/components/ExportExcelButton";
import employeeStore from "@/zustand/Store/employeeStore";
import {
  fmtDate,
  fyOptions,
  initials,
  money,
  num,
  payoutOf,
  inHandOf,
} from "../../utils/salaryHelper";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const PAGE_SIZE = 10;
const BACK_ROUTE = "/dashboard/employee-list";
const MANAGE_ROUTE = "/dashboard/create-salary";
const FY_OPTIONS = fyOptions(5);

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
  filter:
    "M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z",
};

function StatusBadge({ status }) {
  if (!status) return null;
  const active = status === "ACTIVE";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${active
          ? "bg-emerald-50 text-emerald-800"
          : "bg-stone-200 text-stone-700"
        }`}
    >
      {active ? "Active" : "Deactivated"}
    </span>
  );
}

/* Change in base pay compared with the previous payment */

// Zero amounts become a quiet dash so non-zero values stand out
const Amount = ({ value, negative }) => {
  const n = num(value);
  if (n <= 0) return <span className="text-stone-300">—</span>;
  return negative ? (
    <span className="text-rose-700">−{money(n)}</span>
  ) : (
    <span>{money(n)}</span>
  );
};

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
  const salaryEmployee = employeeStore((s) => s.salaryEmployee);
  const salaryRecords = employeeStore((s) => s.salaryRecords);
  const salaryPagination = employeeStore((s) => s.salaryPagination);
  const salarySummary = employeeStore((s) => s.salarySummary);
  const loading = employeeStore((s) => s.loading);
  const error = employeeStore((s) => s.error);
  const fetchLogs = employeeStore((s) => s.getSalaryPaymentLogsById);
  const clearSalaryRecords = employeeStore((s) => s.clearSalaryRecords);

  const [ready, setReady] = useState(false);
  const [fy, setFy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const load = async (extraParams = {}, append = false) => {
    if (!targetId) return;

    const filters = { ...extraParams };
    if (fy) filters.fy = fy;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    try {
      await fetchLogs(targetId, { limit: PAGE_SIZE, ...filters }, append);
    } catch {
      // The store keeps the error message.
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(false);
    clearSalaryRecords();

    if (targetId) {
      load().finally(() => setReady(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, fy, startDate, endDate]);

  const employee = useMemo(
    () =>
      employees.find((e) => e.id === targetId) ||
      location.state?.employee ||
      salaryEmployee ||
      null,
    [employees, targetId, location.state, salaryEmployee],
  );

  const records = ready ? salaryRecords : [];
  const latest = records[0];
  const hasMore = Boolean(salaryPagination?.hasNextPage);
  const totalRecords =
    salaryPagination?.totalRecords ??
    salarySummary?.totalRecords ??
    records.length;

  // The backend total covers every page; fall back to what is loaded
  const backendTotal = salarySummary?.totalPayout;
  const totalPayout =
    backendTotal ?? records.reduce((sum, r) => sum + payoutOf(r), 0);
  const totalIsPartial = backendTotal == null && hasMore;


  const salary = employee?.salary;
  const hasFilters = Boolean(fy || startDate || endDate);

  const clearFilters = () => {
    setFy("");
    setStartDate("");
    setEndDate("");
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white">
            {initials(employee?.empName)}
          </div>

          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-stone-900">
                {employee?.empName || "Employee"}
              </h1>
              <StatusBadge status={employee?.status} />
            </div>

            <p className="text-sm text-stone-500">
              {employee?.empPhone ? `${employee.empPhone} · ` : ""}
              Payment history
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => load()}
            disabled={loading}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
          >
            <Icon
              d={ICONS.refresh}
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <ExportExcelButton type="salaryHistory" employeeId={employee?.id} />

          <Link
            to={`/dashboard/manage-salary/${targetId}`}
            state={{ employeeId: targetId, employee }}
            className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          >
            Manage salary
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 sm:px-4">
        <div className="flex items-center gap-1.5 text-sm font-medium text-stone-500">
          <Icon d={ICONS.filter} className="h-3.5 w-3.5" />
          Filter
        </div>

        <select
          aria-label="Financial year"
          value={fy}
          onChange={(e) => setFy(e.target.value)}
          className="cursor-pointer rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-800 focus:border-teal-600 focus:outline-none"
        >
          <option value="">All financial years</option>
          {FY_OPTIONS.map((y) => (
            <option key={y} value={y}>
              FY {y}
            </option>
          ))}
        </select>

        <span className="text-xs text-stone-400">saved between</span>

        <input
          type="date"
          aria-label="From date"
          value={startDate}
          max={endDate || undefined}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-800 focus:border-teal-600 focus:outline-none"
        />

        <span className="text-xs text-stone-400">and</span>

        <input
          type="date"
          aria-label="To date"
          value={endDate}
          min={startDate || undefined}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-sm text-stone-800 focus:border-teal-600 focus:outline-none"
        />

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto cursor-pointer text-xs font-medium text-stone-500 underline hover:text-stone-800"
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
            className="mt-4 cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
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
            {hasFilters ? "No payments match these filters" : "No payments yet"}
          </p>

          <p className="max-w-sm text-sm text-stone-500">
            {hasFilters
              ? "Try another financial year or a wider date range."
              : "Payments you record from Manage salary will show up here."}
          </p>

          {hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-2 cursor-pointer rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Clear filters
            </button>
          ) : (
            <Link
              to={MANAGE_ROUTE}
              state={{ employeeId: targetId, employee }}
              className="mt-2 rounded-lg bg-teal-700 px-3 py-2 text-sm font-medium text-white hover:bg-teal-800"
            >
              Record a payment
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
          {/* Summary */}
          <dl className="grid grid-cols-1 gap-px bg-stone-200 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white px-5 py-4 sm:px-6">
              <dt className="text-sm text-stone-500">
                {fy ? `Total paid out (FY ${fy})` : "Total paid out"}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-teal-700">
                {money(totalPayout)}
              </dd>
              <dd className="mt-0.5 text-xs text-stone-500">
                {totalRecords} {totalRecords === 1 ? "payment" : "payments"}
                {totalIsPartial ? " · loaded so far" : ""}
              </dd>
            </div>

            <div className="bg-white px-5 py-4 sm:px-6">
              <dt className="text-sm text-stone-500">Latest payment</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                {money(payoutOf(latest))}
              </dd>
              <dd className="mt-0.5 text-xs text-stone-500">
                {latest.month} {latest.fy}
              </dd>
            </div>

            <div className="bg-white px-5 py-4 sm:px-6">
              <dt className="text-sm text-stone-500">Current base pay</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-stone-900">
                {salary?.basePay != null ? money(salary.basePay) : "Not set"}
              </dd>
              {salary?.finalPay != null && (
                <dd className="mt-0.5 text-xs tabular-nums text-stone-500">
                  Net {money(salary.finalPay)} a month
                </dd>
              )}
            </div>
          </dl>

          {/* Payment table */}
          <div className="overflow-x-auto border-t border-stone-200">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-stone-50 text-xs text-stone-500">
                <tr>
                  <th className="py-3 pl-5 pr-3 font-medium sm:pl-6">Period</th>
                  <th className="px-3 py-3 text-right font-medium">Base pay</th>
                  <th className="px-3 py-3 text-right font-medium">Bonus</th>
                  <th className="px-3 py-3 text-right font-medium">Overtime</th>
                  <th className="px-3 py-3 text-right font-medium">LOP</th>
                  <th className="px-3 py-3 text-right font-medium">P.Tax</th>
                  <th className="px-3 py-3 text-right font-medium">ESI</th>
                  <th className="py-3 pl-3 pr-5 text-right font-medium sm:pr-6">
                    Total payout
                  </th>
                </tr>
              </thead>

              <tbody className="tabular-nums">
                {records.map((r, i) => {
                  // Records are newest first, so the next row is the previous payment

                  return (
                    <tr
                      key={r.id || i}
                      className={`border-t border-stone-200 ${i === 0 ? "bg-teal-50/40" : "hover:bg-stone-50"
                        }`}
                    >
                      <td className="py-3 pl-5 pr-3 sm:pl-6">
                        <div className="font-medium text-stone-900">
                          {r.month} {r.fy}
                        </div>
                        <div className="mt-0.5 text-xs text-stone-500">
                          Saved {fmtDate(r.createdAt)}
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

                      <td className="px-3 py-3 text-right text-stone-700">
                        {money(r.basePay)}
                      </td>

                      <td className="px-3 py-3 text-right text-stone-600">
                        <Amount value={r.bonus} />
                      </td>

                      <td className="px-3 py-3 text-right text-stone-600">
                        <Amount value={r.overtime} />
                      </td>

                      <td className="px-3 py-3 text-right">
                        <Amount value={r.lop} negative />
                      </td>

                      <td className="px-3 py-3 text-right text-stone-600">
                        <Amount value={r.pTax} />
                      </td>

                      <td className="px-3 py-3 text-right text-stone-600">
                        <Amount value={r.esi} />
                      </td>

                      <td className="py-3 pl-3 pr-5 text-right sm:pr-6">
                        <div className="font-semibold text-stone-900">
                          {money(payoutOf(r))}
                        </div>
                        <div className="mt-0.5 text-xs text-stone-500">
                          In-Hand {money(inHandOf(r))}
                        </div>
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
              Showing {records.length} of {totalRecords}
              {hasMore ? "" : " · end of history"}
            </span>

            {error && <span className="text-rose-700">{error}</span>}

            {hasMore && (
              <button
                type="button"
                onClick={() =>
                  load({ page: (salaryPagination?.currentPage || 1) + 1 }, true)
                }
                disabled={loading}
                className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
              >
                {loading ? "Loading…" : "Load older payments"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalary;

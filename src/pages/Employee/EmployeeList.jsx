import employeeStore from "@/zustand/Store/employeeStore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

const PAGE_SIZES = [10, 25, 50];

/* ---------- helpers ---------- */

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const num = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));

const netPay = (s) =>
  num(s.baseSalary ?? s.salary) +
  num(s.bonus) +
  num(s.overtime) -
  num(s.deductions);

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "?";

const fmtPeriod = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "—";

const byPeriodDesc = (a, b) =>
  new Date(b.period || b.createdAt) - new Date(a.period || a.createdAt);

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

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
  search: "M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z",
  chevron: "M9 6l6 6-6 6",
  left: "M15 18l-6-6 6-6",
  right: "M9 18l6-6-6-6",
  refresh: "M20 11a8 8 0 10-2.3 5.7M20 4v7h-7",
  users:
    "M17 20v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1M10 11a4 4 0 100-8 4 4 0 000 8zM21 20v-1a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8",
};

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  INACTIVE: "bg-stone-100 text-stone-600 ring-stone-500/20",
};

function StatusBadge({ status }) {
  if (!status) return null;

  const style =
    STATUS_STYLES[status] || "bg-amber-50 text-amber-700 ring-amber-600/20";

  const label =
    status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
}

function Avatar({ name }) {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-semibold text-white">
      {initials(name)}
    </div>
  );
}

function SalaryHistory({ salaries, emp }) {
  const navigate = useNavigate();
  const rows = useMemo(() => [...salaries].sort(byPeriodDesc), [salaries]);

  if (!rows.length) {
    return (
      <p className="px-4 py-5 text-sm text-stone-500 sm:px-6">
        No salary records yet for this employee.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto px-4 py-4 sm:px-6">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="text-left text-xs text-stone-500">
            <th className="pb-2 font-medium">Month</th>
            <th className="pb-2 text-right font-medium">Base</th>
            <th className="pb-2 text-right font-medium">Bonus</th>
            <th className="pb-2 text-right font-medium">Overtime</th>
            <th className="pb-2 text-right font-medium">Deductions</th>
            <th className="pb-2 text-right font-medium">Net pay</th>
            <th className="pb-2 text-right font-medium">Change</th>
            <th className="pb-2 text-center font-medium">Manage</th>
            <th className="pb-2 text-center font-medium">Action</th>
          </tr>
        </thead>

        <tbody className="tabular-nums">
          {rows.map((s, i) => {
            const net = netPay(s);
            const prev = rows[i + 1] ? netPay(rows[i + 1]) : null;
            const diff = prev === null ? null : net - prev;

            return (
              <tr key={s.id || i} className="border-t border-stone-200/70">
                <td className="py-2 pr-4 font-medium text-stone-800">
                  {fmtPeriod(s.period || s.createdAt)}
                </td>

                <td className="py-2 text-right text-stone-600">
                  {inr.format(num(s.baseSalary ?? s.salary))}
                </td>

                <td className="py-2 text-right text-stone-600">
                  {inr.format(num(s.bonus))}
                </td>

                <td className="py-2 text-right text-stone-600">
                  {inr.format(num(s.overtime))}
                </td>

                <td className="py-2 text-right text-stone-600">
                  {num(s.deductions)
                    ? `−${inr.format(num(s.deductions))}`
                    : inr.format(0)}
                </td>

                <td className="py-2 text-right font-semibold text-stone-900">
                  {inr.format(net)}
                </td>

                <td
                  className={`py-2 text-right text-xs ${
                    diff === null || diff === 0
                      ? "text-stone-400"
                      : diff > 0
                        ? "text-emerald-700"
                        : "text-rose-700"
                  }`}
                >
                  {diff === null
                    ? "—"
                    : diff === 0
                      ? "No change"
                      : `${diff > 0 ? "+" : "−"}${inr.format(Math.abs(diff))}`}
                </td>

                <td className="px-3 py-3 text-center">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard/manage-salary", {
                        state: { employeeId: emp.id, employee: emp },
                      })
                    }
                    className="cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                  >
                    Manage Salary
                  </button>
                </td>

                <td className="px-3 py-3 pr-4 text-center sm:pr-6">
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/dashboard/manage-salary", {
                        state: { employeeId: emp.id, employee: emp },
                      })
                    }
                    className="cursor-pointer rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                  >
                    View
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function EmployeeRow({ emp, open, onToggle }) {
  const navigate = useNavigate();

  const panelId = `salary-${emp.id}`;

  return (
    <>
      <tr
        className={`border-t border-stone-200 transition-colors ${
          open ? "bg-teal-50/40" : "hover:bg-stone-50"
        }`}
      >
        <td className="py-3 pl-4 pr-2 sm:pl-6">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={`${open ? "Hide" : "Show"} salary history for ${emp.empName}`}
            className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-200/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
          >
            <Icon
              d={ICONS.chevron}
              className={`h-4 w-4 transition-transform ${open ? "rotate-90" : ""}`}
            />
          </button>
        </td>

        <td className="px-2 py-3">
          <div className="flex items-center gap-3">
            <Avatar name={emp.empName} />

            <div className="min-w-0">
              <div className="truncate font-medium text-stone-900">
                {emp.empName}
              </div>

              <div className="truncate text-xs text-stone-500">
                {emp.empEmail || "No email"}
              </div>
            </div>
          </div>
        </td>

        <td className="px-3 py-3 tabular-nums text-stone-700">
          {emp.empPhone}
        </td>

        <td className="hidden max-w-[260px] px-3 py-3 text-stone-600 lg:table-cell">
          <span className="line-clamp-2">{emp.empAddress || "—"}</span>
        </td>

        <td className="px-3 py-3 text-right tabular-nums">
          <div className="text-xs text-stone-500">
            Joined{" "}
            {new Date(emp.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </td>
        <td className="px-3 py-3 pr-4 sm:pr-6">
          <StatusBadge status={emp.status} />
        </td>

        <td className="px-3 py-3 text-center">
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/manage-salary", {
                state: { employeeId: emp.id, employee: emp },
              })
            }
            className="cursor-pointer rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Manage Salary
          </button>
        </td>
      </tr>

      {open && (
        <tr id={panelId} className="border-t border-stone-200 bg-stone-50">
          <td colSpan={8} className="p-0">
            <SalaryHistory salaries={emp.salaries || []} emp={emp} />
          </td>
        </tr>
      )}
    </>
  );
}

function SkeletonRows({ count }) {
  return Array.from({ length: count }).map((_, i) => (
    <tr key={i} className="border-t border-stone-200">
      <td className="py-4 pl-4 sm:pl-6" />

      <td className="px-2 py-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-stone-200" />

          <div className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded bg-stone-200" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-stone-100" />
          </div>
        </div>
      </td>

      <td className="px-3 py-4">
        <div className="h-3 w-24 animate-pulse rounded bg-stone-200" />
      </td>

      <td className="hidden px-3 py-4 lg:table-cell">
        <div className="h-3 w-40 animate-pulse rounded bg-stone-100" />
      </td>

      <td className="px-3 py-4">
        <div className="ml-auto h-3 w-20 animate-pulse rounded bg-stone-200" />
      </td>

      <td className="px-3 py-4 pr-4 sm:pr-6">
        <div className="h-5 w-16 animate-pulse rounded-full bg-stone-100" />
      </td>

      <td className="px-3 py-4" />
      <td className="px-3 py-4" />
    </tr>
  ));
}

/* ---------- main ---------- */

const EmployeeList = () => {
  const {
    employees = [],
    employeeMeta,
    loading,
    error,
    getEmployeeList,
  } = employeeStore();

  const meta = employeeMeta || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  };

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [expandedId, setExpandedId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch, status, limit]);

  useEffect(() => {
    getEmployeeList({
      page,
      limit,
      status: status || undefined,
      search: debouncedSearch.trim() || undefined,
    })
      .then(() => {
        setExpandedId(null);
      })
      .catch(() => {});
  }, [page, limit, status, debouncedSearch, reloadKey, getEmployeeList]);

  const from =
    meta.totalItems === 0 ? 0 : (meta.currentPage - 1) * meta.itemsPerPage + 1;

  const to = Math.min(meta.currentPage * meta.itemsPerPage, meta.totalItems);

  const filtered = Boolean(debouncedSearch.trim() || status);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-900">
            Employees
          </h1>

          <p className="mt-0.5 text-sm text-stone-500">
            {loading && !employees.length
              ? "Loading…"
              : `${meta.totalItems} ${
                  meta.totalItems === 1 ? "employee" : "employees"
                }${filtered ? " match your filters" : ""}`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        >
          <Icon
            d={ICONS.refresh}
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search employees</span>

          <Icon
            d={ICONS.search}
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or address"
            className="w-full rounded-lg border border-stone-300 bg-white py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </label>

        <div
          role="group"
          aria-label="Filter by status"
          className="inline-flex rounded-lg border border-stone-300 bg-white p-0.5"
        >
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setStatus(o.value)}
              aria-pressed={status === o.value}
              className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${
                status === o.value
                  ? "bg-teal-700 text-white"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="w-12 py-3 pl-4 sm:pl-6">
                  <span className="sr-only">Expand</span>
                </th>

                <th className="px-2 py-3 font-medium">Employee</th>
                <th className="px-3 py-3 font-medium">Phone</th>

                <th className="hidden px-3 py-3 font-medium lg:table-cell">
                  Address
                </th>

                <th className="px-3 py-3 text-right font-medium">
                  Joining Date
                </th>

                <th className="px-3 py-3 pr-4 font-medium sm:pr-6">Status</th>

                <th className="px-3 py-3 text-center font-medium">
                  Manage Salary
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && !employees.length ? (
                <SkeletonRows count={Math.min(limit, 6)} />
              ) : error ? null : employees.length ? (
                employees.map((emp) => (
                  <EmployeeRow
                    key={emp.id}
                    emp={emp}
                    open={expandedId === emp.id}
                    onToggle={() =>
                      setExpandedId((id) => (id === emp.id ? null : emp.id))
                    }
                  />
                ))
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <p className="text-sm text-stone-700">
              {typeof error === "string"
                ? error
                : "Couldn't load employees. Check your connection and try again."}
            </p>

            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="cursor-pointer rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && employees.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-500">
              <Icon d={ICONS.users} className="h-5 w-5" />
            </div>

            <p className="text-sm font-medium text-stone-800">
              {filtered
                ? "No employees match your filters"
                : "No employees yet"}
            </p>

            <p className="text-sm text-stone-500">
              {filtered
                ? "Try a different name or phone number, or clear the status filter."
                : "Employees you add will show up here."}
            </p>

            {filtered && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                }}
                className="cursor-pointer mt-2 text-sm font-medium text-teal-700 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Footer / pagination */}
        {!error && meta.totalItems > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="tabular-nums">
                {from}–{to} of {meta.totalItems}
              </span>

              <label className="flex items-center gap-2">
                <span className="text-stone-500">Rows</span>

                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="rounded-md border border-stone-300 bg-white py-1 pl-2 pr-6 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || loading}
                aria-label="Previous page"
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-md border border-stone-300 bg-white hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
              >
                <Icon d={ICONS.left} />
              </button>

              <span className="px-2 tabular-nums">
                Page {meta.currentPage} of {meta.totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages || loading}
                aria-label="Next page"
                className="cursor-pointer flex h-8 w-8 items-center justify-center rounded-md border border-stone-300 bg-white hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
              >
                <Icon d={ICONS.right} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;

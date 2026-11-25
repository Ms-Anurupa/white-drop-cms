import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import subscriptionStore from "@/zustand/Store/subscriptionStore";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 500;

// 👉 Change this to your actual create-plan route
const ROUTES = {
  createPlan: "/dashboard/subscriptionPlan/create",
};

const WEEK = [
  { key: "MONDAY", short: "M", name: "Monday" },
  { key: "TUESDAY", short: "T", name: "Tuesday" },
  { key: "WEDNESDAY", short: "W", name: "Wednesday" },
  { key: "THURSDAY", short: "T", name: "Thursday" },
  { key: "FRIDAY", short: "F", name: "Friday" },
  { key: "SATURDAY", short: "S", name: "Saturday" },
  { key: "SUNDAY", short: "S", name: "Sunday" },
];

/* ----------------------------- Small helpers ----------------------------- */

const Icon = ({ path, className = "h-4 w-4" }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    {path}
  </svg>
);

const PlusIcon = () => <Icon path={<path d="M12 5v14M5 12h14" />} />;
const RefreshIcon = ({ spinning }) => (
  <Icon
    className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
    path={
      <>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v6h-6" />
      </>
    }
  />
);
const SearchIcon = ({ className }) => (
  <Icon
    className={className}
    path={
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m16 16 4 4" />
      </>
    }
  />
);
const CloseIcon = () => <Icon path={<path d="M6 6l12 12M18 6 6 18" />} />;
const CalendarIcon = ({ className }) => (
  <Icon
    className={className}
    path={
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M8 3v4M16 3v4M3 10h18" />
      </>
    }
  />
);

const pluralize = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

const formatInterval = (weeks) =>
  weeks === 1 ? "Every week" : `Every ${weeks} weeks`;

const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push("…");
    result.push(p);
  });
  return result;
};

/* ------------------------------ Sub-components --------------------------- */

/* The signature element: a Monday-to-Sunday strip where delivery days are lit. */
const DeliveryWeek = ({ days }) => {
  if (!Array.isArray(days) || days.length === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-stone-400 dark:text-slate-500">
        <CalendarIcon className="h-4 w-4" />
        Flexible schedule
      </span>
    );
  }

  const active = new Set(days.map((d) => String(d).toUpperCase()));
  const names = WEEK.filter((d) => active.has(d.key)).map((d) => d.name);

  return (
    <div className="flex items-center gap-2.5">
      <div
        role="img"
        aria-label={`Delivers on ${names.join(", ")}`}
        title={names.join(", ")}
        className="inline-flex items-center gap-0.5"
      >
        {WEEK.map((d) => {
          const on = active.has(d.key);
          return (
            <span
              key={d.key}
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold transition-colors ${on ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-400 dark:bg-slate-800 dark:text-slate-500"
                }`}
            >
              {d.short}
            </span>
          );
        })}
      </div>
      <span className="whitespace-nowrap text-[11px] text-stone-500 dark:text-slate-400">
        {names.length}/wk
      </span>
    </div>
  );
};

/* --------------------------------- Page ---------------------------------- */

const SubscriptionPlanListing = () => {
  const navigate = useNavigate();
  const { activeSubPlans, activeSubPagination, getActiveSubPlan } =
    subscriptionStore();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const searchRef = useRef(null);

  /* Press "/" anywhere to jump to search */
  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (e.key !== "/" || tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* Debounce search; only reset to page 1 when the term actually changes */
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = search.trim();
      if (next !== debouncedSearch) {
        setDebouncedSearch(next);
        setPage(1);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  /* Single fetch function, used by effect + refresh + retry.
     Ignores stale responses so fast typing can't show outdated data. */
  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const fetchPlans = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError("");
      await getActiveSubPlan({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error("Failed to fetch subscription plans:", err);
      setError(
        err?.response?.data?.message || "Unable to fetch subscription plans.",
      );
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
  }, [page, debouncedSearch, getActiveSubPlan]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPlans();
  }, [fetchPlans]);

  const plans = activeSubPlans || [];
  const totalPages = activeSubPagination?.totalPages || 0;
  const totalRecords = activeSubPagination?.totalRecords || 0;

  /* If the current page no longer exists (e.g. after data changes), go back */
  useEffect(() => {
    if (!loading && totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [loading, totalPages, page]);

  const isInitialLoading = loading && plans.length === 0;
  const isRefetching = loading && plans.length > 0;
  const isSearching = debouncedSearch.length > 0;

  const rangeStart = totalRecords === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, totalRecords);

  const handleCreate = () => navigate(ROUTES.createPlan);

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-slate-100">
            Subscription plans
          </h1>
          <p className="mt-1 text-xs text-stone-500 dark:text-slate-400">
            {isInitialLoading
              ? "Loading your plans…"
              : `${pluralize(totalRecords, "active plan")} customers can subscribe to.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchPlans}
            disabled={loading}
            aria-label="Refresh plans"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RefreshIcon spinning={loading} />
            <span className="hidden sm:inline">
              {loading ? "Refreshing…" : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm shadow-teal-600/25 transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
          >
            <PlusIcon />
            Create subscription
          </button>
        </div>
      </header>

      {/* ERROR */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={fetchPlans}
            className="cursor-pointer rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-red-800 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950"
          >
            Try again
          </button>
        </div>
      )}

      {/* LIST CONTAINER: search lives inside so toolbar + table read as one surface */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 dark:border-slate-800">
          <div className="relative w-full sm:max-w-sm">
            <label htmlFor="plan-search" className="sr-only">
              Search subscription plans
            </label>
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500">
              <SearchIcon />
            </span>
            <input
              ref={searchRef}
              id="plan-search"
              type="search"
              placeholder="Search by plan name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/60 py-2 pl-10 pr-10 text-[13px] outline-none transition placeholder:text-stone-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 [&::-webkit-search-cancel-button]:appearance-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-teal-500 dark:focus:bg-slate-800 dark:focus:ring-teal-950/50"
            />
            {search ? (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <CloseIcon />
              </button>
            ) : (
              <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-stone-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-stone-400 sm:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                /
              </kbd>
            )}
          </div>

          {isSearching && !isInitialLoading && (
            <p className="text-sm text-stone-500 dark:text-slate-400" aria-live="polite">
              {pluralize(totalRecords, "result")} for{" "}
              <span className="font-medium text-stone-800 dark:text-slate-200">
                “{debouncedSearch}”
              </span>
            </p>
          )}
        </div>

        {/* Thin progress bar for refetches (keeps existing rows visible → no flicker) */}
        <div
          className="h-0.5 w-full overflow-hidden bg-transparent"
          aria-hidden="true"
        >
          {isRefetching && (
            <div className="h-full w-1/3 animate-pulse bg-teal-500" />
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-[13px]" aria-busy={loading}>
            <caption className="sr-only">Active subscription plans</caption>
            <thead className="border-b border-stone-100 bg-stone-50/70 text-xs text-stone-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Plan
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Minimum commitment
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Frequency
                </th>
                <th scope="col" className="px-4 py-2.5 font-medium">
                  Delivery days
                </th>
              </tr>
            </thead>

            <tbody
              className={`divide-y divide-stone-100 transition-opacity dark:divide-slate-800 ${isRefetching ? "opacity-60" : "opacity-100"
                }`}
            >
              {isInitialLoading ? (
                <SkeletonRows />
              ) : plans.length > 0 ? (
                plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="transition-colors hover:bg-teal-50/40 dark:hover:bg-slate-800/60"
                  >
                    <td className="max-w-md px-4 py-3">
                      <p className="font-semibold text-stone-900 dark:text-slate-100">
                        {plan.name}
                      </p>
                      {plan.description && (
                        <p
                          className="mt-0.5 line-clamp-1 text-xs text-stone-500 dark:text-slate-400"
                          title={plan.description}
                        >
                          {plan.description}
                        </p>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-stone-700 dark:text-slate-300">
                      {pluralize(plan.minDurationMonths, "month")}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-700 dark:text-slate-300">
                      {formatInterval(plan.intervalWeeks)}
                    </td>
                    <td className="px-4 py-3">
                      <DeliveryWeek days={plan.defaultDays} />
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        isSearching={isSearching}
                        onClear={handleClearSearch}
                        onCreate={handleCreate}
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS */}
        <div
          className={`space-y-3 bg-stone-50 p-3 transition-opacity md:hidden dark:bg-slate-950 ${isRefetching ? "opacity-60" : "opacity-100"
            }`}
        >
          {isInitialLoading ? (
            // eslint-disable-next-line no-undef
            <SkeletonCards />
          ) : plans.length > 0 ? (
            plans.map((plan) => (
              <article
                key={plan.id}
                className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <h2 className="font-semibold text-stone-900 dark:text-slate-100">{plan.name}</h2>
                  {plan.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-stone-500 dark:text-slate-400">
                      {plan.description}
                    </p>
                  )}
                </div>

                <dl className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 text-[13px] dark:border-slate-800">
                  <div>
                    <dt className="text-xs text-stone-400 dark:text-slate-400">
                      Minimum commitment
                    </dt>
                    <dd className="mt-0.5 font-medium text-stone-800 dark:text-slate-200">
                      {pluralize(plan.minDurationMonths, "month")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-stone-400 dark:text-slate-400">Frequency</dt>
                    <dd className="mt-0.5 font-medium text-stone-800 dark:text-slate-200">
                      {formatInterval(plan.intervalWeeks)}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="mb-1.5 text-xs text-stone-400 dark:text-slate-400">
                      Delivery days
                    </dt>
                    <dd>
                      <DeliveryWeek days={plan.defaultDays} />
                    </dd>
                  </div>
                </dl>
              </article>
            ))
          ) : (
            !loading && (
              <div className="rounded-2xl border border-stone-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <EmptyState
                  isSearching={isSearching}
                  onClear={handleClearSearch}
                  onCreate={handleCreate}
                />
              </div>
            )
          )}
        </div>

        {/* PAGINATION */}
        {totalRecords > 0 && (
          <nav
            aria-label="Pagination"
            className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 px-4 py-2.5 dark:border-slate-800"
          >
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-medium text-stone-700 dark:text-slate-200">{rangeStart}</span>–
              <span className="font-medium text-stone-700 dark:text-slate-200">{rangeEnd}</span> of{" "}
              <span className="font-medium text-stone-700 dark:text-slate-200">{totalRecords}</span>{" "}
              plans
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="cursor-pointer rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Previous
              </button>

              <div className="hidden items-center gap-1 sm:flex">
                {getPageNumbers(page, totalPages).map((p, i) =>
                  p === "…" ? (
                    <span
                      key={`gap-${i}`}
                      className="px-2 text-xs text-stone-400 dark:text-slate-500"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      disabled={loading}
                      aria-label={`Page ${p}`}
                      aria-current={p === page ? "page" : undefined}
                      className={`h-8 min-w-8 cursor-pointer rounded-lg px-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${p === page
                          ? "bg-teal-600 text-white shadow-sm"
                          : "text-stone-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <span className="px-2 text-xs font-medium text-stone-600 sm:hidden dark:text-slate-300">
                {page} / {Math.max(totalPages, 1)}
              </span>

              <button
                type="button"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-600 transition hover:bg-stone-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <tr key={i} className="animate-pulse">
      <td className="px-4 py-3.5">
        <div className="h-4 w-36 rounded bg-stone-200 dark:bg-slate-700" />
        <div className="mt-1.5 h-3 w-56 rounded bg-stone-100 dark:bg-slate-800" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-20 rounded bg-stone-200 dark:bg-slate-700" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-24 rounded bg-stone-200 dark:bg-slate-700" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((__, d) => (
            <div key={d} className="h-5 w-5 rounded-full bg-stone-200 dark:bg-slate-700" />
          ))}
        </div>
      </td>
    </tr>
  ));

const SkeletonCards = () =>
  Array.from({ length: 3 }).map((_, i) => (
    <div
      key={i}
      className="animate-pulse space-y-3 rounded-2xl border border-stone-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="h-4 w-36 rounded bg-stone-200 dark:bg-slate-700" />
      <div className="h-3 w-48 rounded bg-stone-100 dark:bg-slate-800" />
      <div className="grid grid-cols-2 gap-2 border-t border-stone-100 pt-3 dark:border-slate-800">
        <div className="h-8 rounded bg-stone-100 dark:bg-slate-800" />
        <div className="h-8 rounded bg-stone-100 dark:bg-slate-800" />
      </div>
    </div>
  ));

const EmptyState = ({ isSearching, onClear, onCreate }) => (
  <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-400 dark:bg-slate-800 dark:text-slate-500">
      <CalendarIcon className="h-5 w-5" />
    </div>
    <h3 className="mt-3 text-sm font-semibold text-stone-900 dark:text-slate-100">
      {isSearching ? "No matching plans found" : "No subscription plans yet"}
    </h3>
    <p className="mt-1 max-w-xs text-xs text-stone-500 dark:text-slate-400">
      {isSearching
        ? "Try adjusting your search term or clear the filter to see all plans."
        : "Create your first delivery schedule so customers can start subscribing."}
    </p>
    <div className="mt-4">
      {isSearching ? (
        <button
          type="button"
          onClick={onClear}
          className="cursor-pointer rounded-lg border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Clear search
        </button>
      ) : (
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-teal-700"
        >
          <PlusIcon />
          Create subscription
        </button>
      )}
    </div>
  </div>
);

export default SubscriptionPlanListing;

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  TrendingUp,
  ShoppingBag,
  Building2,
  Store,
  ClipboardList,
  RefreshCw,
  X,
  IndianRupee,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Clock3,
  Phone,
  Hash,
} from "lucide-react";
import salesJobStore from "@/zustand/Store/salesJobStore";

const TYPE_META = {
  CORPORATE: {
    icon: Building2,
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    accent: "#2563EB",
    avatar: "bg-blue-50 text-blue-700",
  },
  RETAIL: {
    icon: Store,
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    accent: "#059669",
    avatar: "bg-emerald-50 text-emerald-700",
  },
  ADHOC: {
    icon: ClipboardList,
    badge: "border-orange-200 bg-orange-50 text-orange-700",
    accent: "#EA580C",
    avatar: "bg-orange-50 text-orange-700",
  },
  SUBSCRIPTION: {
    icon: RefreshCw,
    badge: "border-violet-200 bg-violet-50 text-violet-700",
    accent: "#7C3AED",
    avatar: "bg-violet-50 text-violet-700",
  },
};

const DEFAULT_META = {
  icon: ShoppingBag,
  badge: "border-slate-200 bg-slate-50 text-slate-600",
  accent: "#94A3B8",
  avatar: "bg-slate-100 text-slate-500",
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const DATE_FILTERS = [
  { value: "ALL", label: "All Dates" },
  { value: "TODAY", label: "Today" },
  { value: "YESTERDAY", label: "Yesterday" },
  { value: "THIS_WEEK", label: "This Week" },
  { value: "THIS_MONTH", label: "This Month" },
];

const SALE_TYPES = [
  { value: "ALL", label: "All Sale Types" },
  { value: "RETAIL", label: "Retail" },
  { value: "CORPORATE", label: "Corporate" },
  { value: "ADHOC", label: "Adhoc" },
  { value: "SUBSCRIPTION", label: "Subscription" },
];

const typeMeta = (type) => TYPE_META[type] ?? DEFAULT_META;

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (date) => {
  if (!date) return "Not available";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Not available";
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (date) => {
  if (!date) return "";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name) => {
  if (!name) return "?";

  const parts = String(name).trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const displayValue = (value) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return <span className="text-slate-300">Not available</span>;
  }

  return value;
};

const getSearchText = (sale) => {
  const details = sale?.details ?? {};

  return [
    sale?.id,
    sale?.refId,
    sale?.saleType,
    sale?.saleValue,
    sale?.saleDate,
    sale?.occurredAt,
    details?.reference,
    details?.customerName,
    details?.customerPhone,
    details?.itemCount,
    details?.soldBy,
  ]
    .filter((value) => value !== null && value !== undefined)
    .join(" ")
    .toLowerCase();
};

const Sales = () => {
  const [search, setSearch] = useState("");
  const [saleType, setSaleType] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");

  // Custom date range
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedSale, setSelectedSale] = useState(null);

  const [sort, setSort] = useState({
    key: null,
    direction: "desc",
  });

  const {
    salesJobList = [],
    salesJobData,
    salesJobLoading,
    getSalesJobListing,
  } = salesJobStore();

  const hasCustomRange = Boolean(customFrom) && Boolean(customTo);

  const isCustomRangeInvalid =
    Boolean(customFrom) &&
    Boolean(customTo) &&
    new Date(customFrom) > new Date(customTo);

  const fetchSales = async () => {
    if (isCustomRangeInvalid) return;

    try {
      await getSalesJobListing({
        page,
        limit,

        ...(saleType !== "ALL" && {
          saleType,
        }),

        ...(hasCustomRange
          ? {
            dateFilter: "custom",
            fromDate: customFrom,
            toDate: customTo,
          }
          : dateFilter !== "ALL"
            ? {
              dateFilter: dateFilter.toLowerCase(),
            }
            : {}),
      });
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  useEffect(() => {
    if ((customFrom && !customTo) || (!customFrom && customTo)) {
      return;
    }

    fetchSales();
  }, [page, limit, saleType, dateFilter, customFrom, customTo]);
  
  const filteredSales = useMemo(() => {
    let rows = [...salesJobList];

    /*
     * Search is intentionally client-side because the current API
     * does not accept a search parameter.
     *
     * This searches the currently loaded API page.
     */
    if (search.trim()) {
      const query = search.trim().toLowerCase();

      rows = rows.filter((sale) => getSearchText(sale).includes(query));
    }

    if (sort.key) {
      rows.sort((a, b) => {
        let aValue;
        let bValue;

        if (sort.key === "date") {
          aValue = new Date(a.occurredAt ?? a.saleDate ?? 0).getTime();

          bValue = new Date(b.occurredAt ?? b.saleDate ?? 0).getTime();
        }

        if (sort.key === "value") {
          aValue = Number(a.saleValue) || 0;
          bValue = Number(b.saleValue) || 0;
        }

        if (sort.direction === "asc") {
          return aValue - bValue;
        }

        return bValue - aValue;
      });
    }

    return rows;
  }, [salesJobList, search, sort]);

  const toggleSort = (key) => {
    setSort((previous) => {
      if (previous.key !== key) {
        return {
          key,
          direction: "desc",
        };
      }

      if (previous.direction === "desc") {
        return {
          key,
          direction: "asc",
        };
      }

      return {
        key: null,
        direction: "desc",
      };
    });
  };

  const clearCustomDateRange = () => {
    setCustomFrom("");
    setCustomTo("");
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setSaleType("ALL");
    setDateFilter("ALL");
    setCustomFrom("");
    setCustomTo("");
    setPage(1);
  };

  const hasActiveFilters =
    Boolean(search) ||
    saleType !== "ALL" ||
    dateFilter !== "ALL" ||
    Boolean(customFrom) ||
    Boolean(customTo);

  const summary = salesJobData?.summary ?? {};
  const meta = salesJobData?.meta ?? {};
  const pagination = salesJobData?.pagination ?? {};

  const totalRevenue = Number(summary.totalRevenue) || 0;
  const totalTransactions = Number(pagination.totalCount) || 0;
  const totalPages = Math.max(Number(pagination.totalPages) || 1, 1);

  const currentPageCount = filteredSales.length;

  const rangeStart = currentPageCount > 0 ? (page - 1) * limit + 1 : 0;

  const rangeEnd =
    currentPageCount > 0 ? (page - 1) * limit + currentPageCount : 0;

  const periodCards = [
    {
      key: "today",
      label: "Today",
      data: meta.today,
    },
    {
      key: "yesterday",
      label: "Yesterday",
      data: meta.yesterday,
    },
    {
      key: "this_week",
      label: "This Week",
      data: meta.this_week,
    },
    {
      key: "this_month",
      label: "This Month",
      data: meta.this_month,
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 p-4 lg:p-5">
      {/* HEADER */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <TrendingUp size={19} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Sales
            </h1>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Track and monitor sales across all channels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchSales}
            disabled={salesJobLoading}
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={salesJobLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <CalendarDays size={16} />
            Sales Report
          </button>
        </div>
      </div>

      {/* MAIN SUMMARY */}
      <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-[1.3fr_1fr]">
        {/* TOTAL REVENUE */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60 p-5 shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                  Total Sales
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {salesJobLoading
                    ? "Loading..."
                    : formatCurrency(totalRevenue)}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Total revenue for the current filter
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <IndianRupee size={20} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-600 tabular-nums">
                <TrendingUp size={12} />
                {totalTransactions}
              </span>

              <span>recorded transactions</span>
            </div>
          </div>

          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-100/50" />
          <div className="absolute -bottom-14 right-20 h-28 w-28 rounded-full bg-blue-100/40" />
        </div>

        {/* TRANSACTIONS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Transactions
              </p>

              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                {salesJobLoading ? "..." : totalTransactions}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Total recorded sales
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <ShoppingBag size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* PERIOD SUMMARY */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {periodCards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900 tabular-nums">
                  {salesJobLoading
                    ? "..."
                    : formatCurrency(card.data?.totalRevenue)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-100 p-2 text-slate-500">
                <IndianRupee size={15} />
              </div>
            </div>

            <p className="mt-2 text-xs text-slate-500">
              {salesJobLoading
                ? "Loading..."
                : `${card.data?.totalCount ?? 0} transactions`}
            </p>
          </div>
        ))}
      </div>

      {/* FILTERS + TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* FILTER BAR */}
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            {/* SEARCH + CUSTOM DATE RANGE */}
            <div className="flex w-full flex-col gap-2 sm:flex-row xl:max-w-3xl">
              {/* SEARCH */}
              <div className="relative w-full sm:max-w-md">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search loaded results..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* CUSTOM FROM DATE */}
              <div className="relative w-full sm:w-auto">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={customFrom}
                  max={customTo || undefined}
                  onChange={(e) => {
                    setCustomFrom(e.target.value);
                    setDateFilter("ALL");
                    setPage(1);
                  }}
                  className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 sm:w-40"
                />
              </div>

              <span className="hidden items-center text-xs text-slate-400 sm:flex">
                to
              </span>

              {/* CUSTOM TO DATE */}
              <div className="relative w-full sm:w-auto">
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || undefined}
                  onChange={(e) => {
                    setCustomTo(e.target.value);
                    setDateFilter("ALL");
                    setPage(1);
                  }}
                  className="h-10 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 sm:w-40"
                />
              </div>

              {/* CLEAR CUSTOM RANGE */}
              {(customFrom || customTo) && (
                <button
                  type="button"
                  onClick={clearCustomDateRange}
                  title="Clear date range"
                  className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* FILTERS */}
            <div className="flex flex-col gap-2 sm:flex-row">
              {/* DATE PRESET */}
              <div className="relative">
                <CalendarDays
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={dateFilter}
                  onChange={(e) => {
                    const nextFilter = e.target.value;

                    setDateFilter(nextFilter);
                    setCustomFrom("");
                    setCustomTo("");
                    setPage(1);
                  }}
                  className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 sm:w-44"
                >
                  {DATE_FILTERS.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* SALE TYPE */}
              <div className="relative">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={saleType}
                  onChange={(e) => {
                    setSaleType(e.target.value);
                    setPage(1);
                  }}
                  className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-600 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 sm:w-44"
                >
                  {SALE_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLEAR ALL */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <X size={15} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* CUSTOM RANGE VALIDATION */}
          {isCustomRangeInvalid && (
            <p className="mt-2 text-xs font-medium text-red-500">
              "From" date cannot be after "To" date.
            </p>
          )}

          {/* CUSTOM RANGE INCOMPLETE */}
          {!isCustomRangeInvalid &&
            ((customFrom && !customTo) || (!customFrom && customTo)) && (
              <p className="mt-2 text-xs text-slate-400">
                Pick both a "from" and "to" date to apply the custom range.
              </p>
            )}

          {/* SEARCH INFO */}
          {search && (
            <p className="mt-2 text-xs text-slate-400">
              Search applies to the currently loaded page.
            </p>
          )}
        </div>

        {/* TABLE */}
        <div className="max-h-[640px] overflow-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-100 bg-slate-50/95 backdrop-blur">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <button
                    type="button"
                    onClick={() => toggleSort("date")}
                    className="flex cursor-pointer items-center gap-1 hover:text-slate-600"
                  >
                    Sale Date
                    <SortIcon column="date" sort={sort} />
                  </button>
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Sale Type
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Customer
                </th>

                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Items
                </th>

                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <button
                    type="button"
                    onClick={() => toggleSort("value")}
                    className="ml-auto flex cursor-pointer items-center gap-1 hover:text-slate-600"
                  >
                    Sale Value
                    <SortIcon column="value" sort={sort} />
                  </button>
                </th>

                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  View
                </th>
              </tr>
            </thead>

            <tbody>
              {salesJobLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="px-5 py-4">
                      <Skeleton width="w-20" />
                      <Skeleton width="w-12" className="mt-2" />
                    </td>

                    <td className="px-5 py-4">
                      <Skeleton width="w-24" />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-100" />

                        <div>
                          <Skeleton width="w-28" />
                          <Skeleton width="w-20" className="mt-1.5" />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <Skeleton width="w-8" />
                    </td>

                    <td className="px-5 py-4">
                      <div className="ml-auto">
                        <Skeleton width="w-20" />
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center">
                        <Skeleton width="w-8" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const meta = typeMeta(sale.saleType);
                  const Icon = meta.icon;

                  const customerName = sale?.details?.customerName;

                  const customerPhone = sale?.details?.customerPhone;

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => setSelectedSale(sale)}
                      className="group cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                      style={{
                        borderLeft: `3px solid ${meta.accent}`,
                      }}
                    >
                      {/* DATE */}
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {formatDate(sale.occurredAt ?? sale.saleDate)}
                        </p>

                        {sale.occurredAt && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                            <Clock3 size={11} />
                            {formatTime(sale.occurredAt)}
                          </p>
                        )}
                      </td>

                      {/* TYPE */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.badge}`}
                        >
                          <Icon size={12} />
                          {sale.saleType || "Unknown"}
                        </span>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${meta.avatar}`}
                          >
                            {getInitials(customerName)}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate font-medium text-slate-700">
                              {displayValue(customerName)}
                            </p>

                            {customerPhone && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                                <Phone size={10} />
                                {customerPhone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* ITEMS */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 tabular-nums">
                          {sale.details?.itemCount ?? 0}
                        </span>
                      </td>

                      {/* VALUE */}
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-slate-800 tabular-nums">
                          {formatCurrency(sale.saleValue)}
                        </span>
                      </td>

                      {/* VIEW */}
                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedSale(sale);
                          }}
                          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                          title="View sale"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                        <ShoppingBag size={22} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        {hasActiveFilters
                          ? "No matching sales"
                          : "No sales yet"}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {hasActiveFilters
                          ? "Try a different search term or clear your filters."
                          : "Sales will show up here once transactions come in."}
                      </p>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-4 inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700 tabular-nums">
                {rangeStart}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700 tabular-nums">
                {rangeEnd}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700 tabular-nums">
                {totalTransactions}
              </span>{" "}
              sales
            </p>

            <div className="hidden items-center gap-1.5 sm:flex">
              <label htmlFor="page-size" className="text-xs text-slate-400">
                Rows
              </label>

              <select
                id="page-size"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 cursor-pointer rounded-md border border-slate-200 bg-white px-1.5 text-xs font-medium text-slate-600 outline-none focus:border-blue-400"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <PaginationButton
              onClick={() => setPage(1)}
              disabled={page === 1 || salesJobLoading}
            >
              <ChevronsLeft size={15} />
            </PaginationButton>

            <PaginationButton
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || salesJobLoading}
            >
              <ChevronLeft size={15} />
            </PaginationButton>

            <div className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white tabular-nums">
              {page}
            </div>

            <PaginationButton
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page >= totalPages || salesJobLoading}
            >
              <ChevronRight size={15} />
            </PaginationButton>

            <PaginationButton
              onClick={() => setPage(totalPages)}
              disabled={page >= totalPages || salesJobLoading}
            >
              <ChevronsRight size={15} />
            </PaginationButton>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
};

const SortIcon = ({ column, sort }) => {
  if (sort.key !== column) {
    return <ArrowUpDown size={13} className="text-slate-300" />;
  }

  return sort.direction === "asc" ? (
    <ArrowUp size={13} className="text-blue-600" />
  ) : (
    <ArrowDown size={13} className="text-blue-600" />
  );
};

const Skeleton = ({ width = "w-16", className = "" }) => (
  <div
    className={`h-3.5 animate-pulse rounded bg-slate-100 ${width} ${className}`}
  />
);

const PaginationButton = ({ onClick, disabled, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

const SaleDetailModal = ({ sale, onClose }) => {
  const meta = typeMeta(sale.saleType);
  const Icon = meta.icon;
  const details = sale?.details ?? {};

  const excludedKeys = [
    "reference",
    "customerName",
    "customerPhone",
    "itemCount",
  ];

  const additionalDetails = Object.entries(details).filter(
    ([key]) => !excludedKeys.includes(key),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${meta.badge}`}
            >
              <Icon size={12} />
              {sale.saleType || "Unknown"}
            </span>

            <h2 className="text-sm font-semibold text-slate-800">
              Sale Details
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
          {/* PRIMARY DETAILS */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {/* <DetailItem
              label="Reference"
              value={
                details.reference ?? sale.refId
              }
              icon={<Hash size={12} />}
              mono
            /> */}

            <DetailItem
              label="Sale Value"
              value={formatCurrency(sale.saleValue)}
              valueClass="font-bold text-slate-800"
            />

            <DetailItem
              label="Sale Date"
              value={formatDate(sale.occurredAt ?? sale.saleDate)}
            />

            <DetailItem
              label="Sale Time"
              value={formatTime(sale.occurredAt) || "Not available"}
            />

            <DetailItem label="Customer" value={details.customerName} />

            <DetailItem label="Phone" value={details.customerPhone} />

            <DetailItem label="Items" value={details.itemCount} />
          </div>

          {additionalDetails.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Additional Details
              </p>

              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                {additionalDetails.map(([key, value]) => (
                  <DetailItem
                    key={key}
                    label={formatLabel(key)}
                    value={formatDetailValue(value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  icon,
  mono = false,
  valueClass = "text-slate-700",
}) => (
  <div className="min-w-0">
    <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {icon}
      {label}
    </dt>

    <dd
      className={`mt-1 break-words text-sm ${valueClass} ${mono ? "font-mono text-xs font-semibold" : ""
        }`}
    >
      {displayValue(value)}
    </dd>
  </div>
);

const formatLabel = (key) =>
  String(key)
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());

const formatDetailValue = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};

export default Sales;

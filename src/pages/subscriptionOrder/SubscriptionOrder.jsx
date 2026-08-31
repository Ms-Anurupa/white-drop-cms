/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  Clock3,
  Package,
  User,
  CreditCard,
  Truck,
  Repeat,
  Undo2,
  X,
} from "lucide-react";
import subscriptionStore from "../../zustand/Store/subscriptionStore";
import { resolveFirebaseUrl } from "../../utils/resolveUrl";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const DATE_FILTERS = [
  { key: "all", label: "All subscriptions" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

const STATUS_STYLES = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  PENDING: "bg-amber-50 text-amber-700",
  PAUSED: "bg-blue-50 text-blue-700",
  EXPIRED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-50 text-red-700",
};

const STATUS_DOTS = {
  ACTIVE: "bg-emerald-500",
  PENDING: "bg-amber-500",
  PAUSED: "bg-blue-500",
  EXPIRED: "bg-gray-400",
  CANCELLED: "bg-red-500",
};

const PAYMENT_STATUS_STYLES = {
  COMPLETE: "bg-emerald-50 text-emerald-700",
  POSTPAID: "bg-purple-50 text-purple-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
  FAILED_AUTH: "bg-red-50 text-red-700",
};

const PAYMENT_STATUS_DOTS = {
  COMPLETE: "bg-emerald-500",
  POSTPAID: "bg-purple-500",
  PENDING: "bg-amber-500",
  FAILED: "bg-red-500",
  FAILED_AUTH: "bg-red-500",
};

const toYMD = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(date.getDate()).padStart(2, "0")}`;

const getQuickRangeDates = (filter) => {
  const now = new Date();

  if (filter === "today") {
    const ymd = toYMD(now);

    return {
      from: ymd,
      to: ymd,
    };
  }

  if (filter === "week") {
    const weekAgo = new Date(now);

    // Inclusive 7-day range
    weekAgo.setDate(now.getDate() - 6);

    return {
      from: toYMD(weekAgo),
      to: toYMD(now),
    };
  }

  if (filter === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      from: toYMD(monthStart),
      to: toYMD(now),
    };
  }

  return {
    from: "",
    to: "",
  };
};

const formatShortDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const ScrollbarStyle = () => (
  <style>{`
    .subscription-scroll {
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #f1f5f9;
    }

    .subscription-scroll::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }

    .subscription-scroll::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 999px;
    }

    .subscription-scroll::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 999px;
    }

    .subscription-scroll::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }

    .subscription-scroll::-webkit-scrollbar-corner {
      background: transparent;
    }
  `}</style>
);

const StatusPill = ({ status, styles, dots }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap ${
        styles?.[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          dots?.[status] || "bg-gray-400"
        }`}
      />

      {status || "UNKNOWN"}
    </span>
  );
};

const PageButton = ({ children, onClick, disabled, label }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

const SubscriptionOrder = () => {
  const getSubscriptionListing = subscriptionStore(
    (state) => state.getSubscriptionListing,
  );
  const subscriptionLists = subscriptionStore(
    (state) => state.subscriptionLists,
  );
  const subscriptionLoading = subscriptionStore(
    (state) => state.subscriptionLoading,
  );
  const pagination = subscriptionStore((state) => state.subscriptionPagination);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const subscriptions = subscriptionLists || [];
  const meta = pagination?.meta || {};
  const totalItems = meta?.totalItems ?? 0;
  const totalPages = meta?.totalPages ?? pagination?.totalPages ?? 1;
  const currentPage = meta?.currentPage ?? pagination?.currentPage;
  const itemsPerPage = meta?.itemsPerPage ?? pagination?.itemsPerPage;
  const dateCounts = meta?.dateCounts || {};

  const getDateCount = (key) => {
    if (key === "all") {
      return dateCounts?.all ?? totalItems;
    }
    if (key === "today") {
      return dateCounts?.today ?? 0;
    }
    if (key === "week") {
      return dateCounts?.thisWeek ?? dateCounts?.week ?? 0;
    }
    if (key === "month") {
      return dateCounts?.thisMonth ?? dateCounts?.month ?? 0;
    }

    return 0;
  };

  const getActiveDateRange = () => {
    if (dateFilter !== "all") {
      return getQuickRangeDates(dateFilter);
    }

    return {
      from: fromDate,
      to: toDate,
    };
  };

  useEffect(() => {
    const { from, to } = getActiveDateRange();

    if ((from && !to) || (!from && to)) {
      return;
    }

    const timer = setTimeout(async () => {
      try {
        await getSubscriptionListing({
          page: 1,
          limit: pageSize,
          search,
          status,
          paymentStatus,
          paymentMode,
          fromDate: from,
          toDate: to,
        });

        setPage(1);
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [
    search,
    status,
    paymentStatus,
    paymentMode,
    fromDate,
    toDate,
    dateFilter,
    pageSize,
  ]);

  useEffect(() => {
    if (page === 1) return;

    const { from, to } = getActiveDateRange();

    if ((from && !to) || (!from && to)) {
      return;
    }

    const loadPage = async () => {
      try {
        await getSubscriptionListing({
          page,
          limit: pageSize,
          search,
          status,
          paymentStatus,
          paymentMode,
          fromDate: from,
          toDate: to,
        });
      } catch (error) {
        console.error("Failed to load subscription page:", error);
      }
    };

    loadPage();
  }, [page]);

  const handleDateFilter = (key) => {
    setDateFilter(key);
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleFromDateChange = (value) => {
    setFromDate(value);
    setDateFilter("all");
    setPage(1);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    setDateFilter("all");
    setPage(1);
  };

  const clearDates = () => {
    setFromDate("");
    setToDate("");
    setDateFilter("all");
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
    setPaymentMode("");
    setFromDate("");
    setToDate("");
    setDateFilter("all");
    setPage(1);
  };

  const hasFilters =
    search ||
    status ||
    paymentStatus ||
    paymentMode ||
    fromDate ||
    toDate ||
    dateFilter !== "all";

  const handleRefresh = async () => {
    const { from, to } = getActiveDateRange();

    try {
      await getSubscriptionListing({
        page,
        limit: pageSize,
        search,
        status,
        paymentStatus,
        paymentMode,
        fromDate: from,
        toDate: to,
      });
    } catch (error) {
      console.error("Failed to refresh subscriptions:", error);
    }
  };

  const stats = useMemo(() => {
    return {
      active: subscriptions.filter((item) => item?.status === "ACTIVE").length,

      pending: subscriptions.filter((item) => item?.status === "PENDING")
        .length,

      paused: subscriptions.filter((item) => item?.status === "PAUSED").length,

      expired: subscriptions.filter((item) => item?.status === "EXPIRED")
        .length,
    };
  }, [subscriptions]);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex h-screen flex-col gap-2 overflow-hidden bg-gray-50 px-4 py-3">
      <ScrollbarStyle />
      {/* header */}
      <div className="flex shrink-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="flex items-center gap-2">
            <Repeat size={17} className="text-blue-600" />

            <h1 className="text-lg font-semibold tracking-tight text-gray-900">
              Subscription Orders
            </h1>
          </div>

          <span className="text-xs font-medium text-blue-600">
            Total: {totalItems}
          </span>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={subscriptionLoading}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={subscriptionLoading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        <div className="flex w-full items-center gap-2 lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-72 lg:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search subscription, customer, phone..."
              className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>
      {/* filter bar */}
      <div className="subscription-scroll flex shrink-0 items-center gap-2 overflow-x-auto rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm">
        {/* Date Pills */}
        <div className="flex shrink-0 items-center gap-1.5">
          {DATE_FILTERS.map((filter) => {
            const active = dateFilter === filter.key;

            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => handleDateFilter(filter.key)}
                className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-medium transition ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {filter.key !== "all" && <CalendarDays size={12} />}

                {filter.label}

                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {getDateCount(filter.key)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden h-6 w-px shrink-0 bg-gray-100 xl:block" />

        {/* Custom Date Range */}
        <div className="flex shrink-0 items-center gap-1.5">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            className="h-8 cursor-pointer rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          />

          <span className="text-xs text-gray-300">→</span>

          <input
            type="date"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            className="h-8 cursor-pointer rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          />

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={clearDates}
              title="Clear dates"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="hidden h-6 w-px shrink-0 bg-gray-100 xl:block" />

        {/* Status Filters */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* Subscription Status */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="h-8 min-w-[125px] cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-2.5 pr-7 text-xs text-gray-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All status</option>
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="EXPIRED">Expired</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Payment Status */}

          <div className="relative">
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="h-8 min-w-[125px] cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-2.5 pr-7 text-xs text-gray-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All payment</option>
              <option value="COMPLETE">Complete</option>
              <option value="PENDING">Pending</option>
              <option value="POSTPAID">Postpaid</option>
              <option value="FAILED">Failed</option>
              <option value="FAILED_AUTH">Failed Auth</option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>

          {/* Payment Mode */}
          <div className="relative">
            <select
              value={paymentMode}
              onChange={(e) => {
                setPaymentMode(e.target.value);
                setPage(1);
              }}
              className="h-8 min-w-[115px] cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-2.5 pr-7 text-xs text-gray-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All modes</option>
              <option value="COD">COD</option>
              <option value="PG">Payment Gateway</option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Reset */}
        {hasFilters && (
          <button
            type="button"
            onClick={resetFilters}
            className="ml-auto flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <Undo2 size={13} />
            Reset
          </button>
        )}
      </div>

      {/* ==========================================
          SMALL SUMMARY STRIP
      ========================================== */}

      <div className="flex shrink-0 items-center gap-4 px-1 py-0.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

          <span className="text-[11px] text-gray-500">Active</span>

          <span className="text-[11px] font-semibold text-gray-700">
            {stats.active}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="text-[11px] text-gray-500">Pending</span>
          <span className="text-[11px] font-semibold text-gray-700">
            {stats.pending}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

          <span className="text-[11px] text-gray-500">Paused</span>

          <span className="text-[11px] font-semibold text-gray-700">
            {stats.paused}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
          <span className="text-[11px] text-gray-500">Expired</span>
          <span className="text-[11px] font-semibold text-gray-700">
            {stats.expired}
          </span>
        </div>

        <span className="ml-auto text-[11px] text-gray-400">
          Showing {subscriptions.length} of {totalItems}
        </span>
      </div>

      {/* ==========================================
          TABLE
      ========================================== */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-[#dfe1eb]">
        <div className="subscription-scroll min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[1350px] table-fixed text-xs">
            <thead className="sticky top-0 z-10 bg-[#274de4] ">
              <tr className="border-b border-gray-300 ">
                <th className="w-12 px-2 py-2 text-left text-[11px] font-semibold whitespace-nowrap text-white">
                  Sl No.
                </th>
                <th className="w-40 px-2 py-2 text-left text-[11px] font-semibold whitespace-nowrap text-white">
                  Subscription
                </th>
                <th className="w-44 px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Customer
                </th>
                <th className="w-48 px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Product
                </th>
                <th className="w-48 px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Plan
                </th>
                <th className="w-48 px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Delivery
                </th>
                <th className="w-28 px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Amount
                </th>
                <th className="w-32 px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Payment
                </th>
                <th className="w-28 px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 bg-white">
              {/* LOADING */}
              {subscriptionLoading ? (
                Array.from({
                  length: pageSize > 25 ? 8 : 7,
                }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({
                      length: 9,
                    }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-2 py-3">
                        <div
                          className={`h-3 animate-pulse rounded bg-gray-100 ${
                            cellIndex === 0
                              ? "w-6"
                              : cellIndex === 1
                                ? "w-32"
                                : "w-24"
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : subscriptions.length === 0 ? (
                /* EMPTY */
                <tr>
                  <td colSpan={9} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                        <Repeat size={25} className="text-gray-300" />
                      </div>

                      <p className="mt-1 text-sm font-medium text-gray-500">
                        No subscriptions found
                      </p>

                      <p className="text-xs text-gray-400">
                        Try adjusting your search or filters
                      </p>

                      {hasFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                /* DATA */
                subscriptions.map((item, index) => {
                  const rowStatus = item?.status;

                  return (
                    <tr
                      key={item?.id || item?.subId || index}
                      className="transition hover:bg-slate-50"
                    >
                      {/* SL NO */}
                      <td className="px-2 py-2 text-gray-400">
                        {startIndex + index + 1}
                      </td>

                      {/* SUBSCRIPTION */}
                      <td className="px-2 py-2">
                        <p className="truncate font-semibold text-blue-900">
                          {item?.subId || "-"}
                        </p>

                        <div className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-400">
                          <CalendarDays size={10} />

                          {formatShortDate(item?.startDate)}
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td className="px-2 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <User size={12} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-800">
                              {item?.user?.customer_name || "Unknown"}
                            </p>

                            <p className="truncate text-[10px] text-gray-400">
                              {item?.user?.phone_num || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PRODUCT */}
                      <td className="px-2 py-2">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                            {item?.product?.product_images?.[0] ? (
                              <img
                                src={resolveFirebaseUrl({
                                  folderName: "productImages",
                                  fileName: item.product.product_images[0],
                                })}
                                alt={item?.product?.product_name || "Product"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={13} className="text-gray-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-gray-900">
                              {item?.product?.product_name || "-"}
                            </p>

                            <p className="truncate text-[10px] text-gray-500">
                              {item?.variant?.quantity
                                ? `${item.variant.quantity} ${
                                    item.variant.unit || ""
                                  }`
                                : "-"}

                              {item?.variant?.package
                                ? ` · ${item.variant.package}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* PLAN */}
                      <td className="px-2 py-2">
                        <p className="truncate font-medium text-gray-900">
                          {item?.plan?.name || "-"}
                        </p>

                        <p className="mt-0.5 truncate text-[10px] text-gray-500">
                          {item?.durationMonths || 0} month
                          {Number(item?.durationMonths) > 1 ? "s" : ""}
                          {" · "}
                          {item?.totalDeliveries || 0} deliveries
                        </p>

                        {item?.plan?.description && (
                          <p className="mt-0.5 truncate text-[10px] text-gray-400">
                            {item.plan.description}
                          </p>
                        )}
                      </td>

                      {/* DELIVERY */}
                      <td className="px-2 py-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 truncate font-medium text-gray-700">
                            <Clock3
                              size={11}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="truncate">
                              {item?.deliverySlot?.name || "-"}
                            </span>
                          </div>

                          {(item?.deliverySlot?.from ||
                            item?.deliverySlot?.to) && (
                            <p className="text-[10px] text-gray-400">
                              {item?.deliverySlot?.from || ""}

                              {item?.deliverySlot?.to
                                ? ` - ${item.deliverySlot.to}`
                                : ""}
                            </p>
                          )}

                          <div className="flex items-center gap-1.5">
                            <Truck
                              size={11}
                              className="shrink-0 text-gray-400"
                            />

                            <span className="truncate text-[10px] text-gray-400">
                              {Array.isArray(item?.selectedDays)
                                ? item.selectedDays
                                    .map(
                                      (day) =>
                                        ({
                                          MONDAY: "Mon",
                                          TUESDAY: "Tue",
                                          WEDNESDAY: "Wed",
                                          THURSDAY: "Thu",
                                          FRIDAY: "Fri",
                                          SATURDAY: "Sat",
                                          SUNDAY: "Sun",
                                        })[day] || day,
                                    )
                                    .join(" · ")
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* AMOUNT */}
                      <td className="px-2 py-2">
                        <p className="font-semibold text-green-900">
                          {formatCurrency(item?.totalAmount)}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-500">
                          Qty {item?.qtyPerDelivery || 0} / delivery
                        </p>

                        <p className="text-[10px] text-gray-400">
                          {item?.deliveriesRemaining || 0} remaining
                        </p>
                      </td>

                      {/* PAYMENT */}
                      <td className="px-2 py-2">
                        <StatusPill
                          status={item?.paymentStatus}
                          styles={PAYMENT_STATUS_STYLES}
                          dots={PAYMENT_STATUS_DOTS}
                        />

                        <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-400">
                          <CreditCard size={10} />

                          <span className="truncate">
                            {item?.paymentMode === "PG"
                              ? "Payment Gateway"
                              : item?.paymentMode || "-"}
                          </span>
                        </div>

                        {item?.paymentInfo?.paymentMethod && (
                          <p className="mt-0.5 truncate text-[10px] text-gray-400">
                            {item.paymentInfo.paymentMethod}
                          </p>
                        )}
                      </td>

                      {/* STATUS */}
                      <td className="px-2 py-2">
                        <StatusPill
                          status={rowStatus}
                          styles={STATUS_STYLES}
                          dots={STATUS_DOTS}
                        />

                        <p className="mt-1 text-[10px] text-gray-400">
                          Created {formatShortDate(item?.createdAt)}
                        </p>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ========================================
            PAGINATION
        ======================================== */}

        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/70 px-3 py-2">
          {/* Left */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500">
              Page{" "}
              <span className="font-semibold text-gray-700">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{totalPages}</span>
            </span>

            <span className="hidden text-[11px] text-gray-400 sm:block">
              {totalItems} subscriptions
            </span>

            {/* Page size */}
            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-[11px] text-gray-400">Rows</span>

              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-7 cursor-pointer rounded-md border border-gray-200 bg-white px-1.5 text-[11px] text-gray-600 outline-none focus:border-blue-400"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <PageButton
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={!hasPreviousPage || subscriptionLoading}
              label="Previous page"
            >
              <ChevronLeft size={14} />
            </PageButton>

            <span className="text-[11px] text-gray-500">{currentPage}</span>

            <PageButton
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={!hasNextPage || subscriptionLoading}
              label="Next page"
            >
              <ChevronRight size={14} />
            </PageButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionOrder;

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  RefreshCw,
  X,
  CalendarDays,
  PackageSearch,
  UserRound,
  Phone,
  IndianRupee,
  Clock3,
} from "lucide-react";
import adhocOrderStore from "@/zustand/Store/adhocOrderStore";
import Loader from "@/components/Loader";

const AdhocOrders = () => {
  const getAdHocSaleListing = adhocOrderStore(
    (state) => state.getAdHocSaleListing,
  );
  const orders = adhocOrderStore((state) => state.orders) || [];
  const meta = adhocOrderStore((state) => state.meta) || {};
  const storeLoading = adhocOrderStore((state) => state.loading);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      await getAdHocSaleListing({
        search,
        page,
        limit,
        dateFilter,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error("Failed to fetch adhoc orders:", error);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  }, [
    getAdHocSaleListing,
    search,
    page,
    limit,
    dateFilter,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const isLoading = loading || storeLoading;
  const totalCount = Number(meta?.totalCount ?? 0);
  const offset = Number(meta?.offset ?? (page - 1) * limit);
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const startItem = totalCount === 0 ? 0 : offset + 1;
  const endItem =
    totalCount === 0 ? 0 : Math.min(offset + orders.length, totalCount);
  const hasPrevious = page > 1;
  const hasNext = Boolean(meta?.hasMore) || page < totalPages;

  const formatCurrency = (value) => {
    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return "₹0";
    }

    return `₹${amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getItemCount = (order) => {
    if (!Array.isArray(order?.details)) {
      return 0;
    }

    return order.details.reduce(
      (total, item) => total + Number(item?.qty || 0),
      0,
    );
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");

    setDateFilter("");
    setStartDate("");
    setEndDate("");

    setPage(1);
  };

  const handleDateFilterChange = (value) => {
    setDateFilter(value);

    setStartDate("");
    setEndDate("");

    setPage(1);
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);

    setDateFilter("");

    setPage(1);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);

    setDateFilter("");

    setPage(1);
  };

  const handleLimitChange = (value) => {
    setLimit(Number(value));
    setPage(1);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  if (!initialLoadDone) {
    return <Loader text="Loading Adhoc order history lists..." />;
  }

  return (
    <div className="flex h-screen flex-col gap-2 overflow-hidden bg-gray-50 px-4 py-3 dark:bg-slate-950">
      {/* HEADER */}
      <div className="flex shrink-0 flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-baseline gap-3">
          <div className="flex items-center gap-2">
            <PackageSearch size={17} className="text-blue-600" />

            <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
              Adhoc Orders
            </h1>
          </div>

          <span className="text-xs font-medium text-blue-600">
            Total: {totalCount}
          </span>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="flex w-full items-center gap-2 lg:w-auto">
          <div className="relative w-full sm:w-72 lg:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search seller, phone..."
              className="h-8 w-full rounded-lg border border-gray-200 bg-white pl-8 pr-3 text-xs text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleDateFilterChange("")}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
              !dateFilter
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            All
          </button>

          <button
            type="button"
            onClick={() => handleDateFilterChange("today")}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
              dateFilter === "today"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            <CalendarDays size={12} />
            Today
          </button>

          <button
            type="button"
            onClick={() => handleDateFilterChange("yesterday")}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
              dateFilter === "yesterday"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            <Clock3 size={12} />
            Yesterday
          </button>

          <button
            type="button"
            onClick={() => handleDateFilterChange("thisWeek")}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
              dateFilter === "thisWeek"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            This Week
          </button>

          <button
            type="button"
            onClick={() => handleDateFilterChange("thisMonth")}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition ${
              dateFilter === "thisMonth"
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            This Month
          </button>
        </div>

        <div className="hidden h-6 w-px bg-gray-100 xl:block dark:bg-slate-800" />

        {/* CUSTOM DATE */}
        <div className="flex shrink-0 items-center gap-1.5">
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="h-8 cursor-pointer rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          />

          <span className="text-xs text-gray-300">→</span>

          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="h-8 cursor-pointer rounded-lg border border-gray-200 bg-white px-2 text-xs text-gray-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          />
        </div>

        {(search || dateFilter || startDate || endDate) && (
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X size={13} />
            Clear Filters
          </button>
        )}
      </div>

      {/* SUMMARY */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 px-1 py-0.5">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />

          <span className="text-[11px] text-gray-500 dark:text-slate-400">
            Today
          </span>

          <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-200">
            {meta?.today ?? 0}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

          <span className="text-[11px] text-gray-500 dark:text-slate-400">
            Yesterday
          </span>

          <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-200">
            {meta?.yesterday ?? 0}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

          <span className="text-[11px] text-gray-500 dark:text-slate-400">
            This Week
          </span>

          <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-200">
            {meta?.thisWeek ?? 0}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

          <span className="text-[11px] text-gray-500 dark:text-slate-400">
            This Month
          </span>

          <span className="text-[11px] font-semibold text-gray-700 dark:text-slate-200">
            {meta?.thisMonth ?? 0}
          </span>
        </div>

        <span className="ml-auto text-[11px] text-gray-400">
          Showing {orders.length} of {totalCount}
        </span>
      </div>

      {/* TABLE */}
      <div
        className={`overflow-hidden rounded-xl border border-gray-100 bg-[#dfe1eb] dark:border-slate-800 ${
          orders.length > 0 ? "max-h-[calc(100vh-245px)]" : ""
        }`}
      >
        <div className="overflow-auto">
          <table className="w-full min-w-[1050px] table-fixed text-xs">
            <thead className="sticky top-0 z-10 bg-[#274de4]">
              <tr className="border-b border-gray-300">
                <th className="w-14 whitespace-nowrap px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Sl No.
                </th>

                <th className="w-44 whitespace-nowrap px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Sale Date
                </th>

                <th className="w-52 whitespace-nowrap px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Seller
                </th>

                <th className="w-40 whitespace-nowrap px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Phone
                </th>

                <th className="w-24 whitespace-nowrap px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Items
                </th>

                <th className="w-32 whitespace-nowrap px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Sale Value
                </th>

                <th className="w-32 whitespace-nowrap px-2 py-2 text-left text-[11px] font-semibold text-white">
                  Status
                </th>

                <th className="w-24 whitespace-nowrap px-2 py-2 text-center text-[11px] font-semibold text-white">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {/* LOADING */}
              {isLoading ? (
                Array.from({ length: 7 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-2 py-3">
                        <div
                          className={`h-3 animate-pulse rounded bg-gray-100 dark:bg-slate-800 ${
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
              ) : orders.length === 0 ? (
                /* EMPTY */
                <tr>
                  <td colSpan={8} className="px-6 py-16">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800">
                        <PackageSearch
                          size={25}
                          className="text-gray-300 dark:text-slate-500"
                        />
                      </div>

                      <p className="mt-1 text-sm font-medium text-gray-500 dark:text-slate-400">
                        No adhoc orders found
                      </p>

                      <p className="text-xs text-gray-400 dark:text-slate-500">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order?.id || index}
                    className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    {/* SL NO */}
                    <td className="px-2 py-2 text-gray-400 dark:text-slate-500">
                      {offset + index + 1}
                    </td>

                    {/* SALE DATE */}
                    <td className="px-2 py-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays
                            size={11}
                            className="shrink-0 text-gray-400"
                          />

                          <p className="truncate font-medium text-gray-800 dark:text-slate-200">
                            {formatDate(order?.soldOn)}
                          </p>
                        </div>

                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-400">
                          <Clock3 size={10} />
                          {formatTime(order?.soldOn)}
                        </div>
                      </div>
                    </td>

                    {/* SELLER */}
                    <td className="px-2 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                          <UserRound size={12} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-800 dark:text-slate-200">
                            {order?.soldBy || "-"}
                          </p>

                          <p className="truncate text-[10px] text-gray-400 dark:text-slate-500">
                            Ad hoc sale
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1.5 text-gray-700 dark:text-slate-300">
                        <Phone size={11} className="text-gray-400" />

                        <span className="truncate">
                          {order?.phoneNo || "-"}
                        </span>
                      </div>
                    </td>

                    {/* ITEMS */}
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-blue-50 px-1.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                          {getItemCount(order)}
                        </span>

                        <span className="text-[10px] text-gray-400">qty</span>
                      </div>
                    </td>

                    {/* SALE VALUE */}
                    <td className="px-2 py-2">
                      <p className="font-semibold text-green-900 dark:text-emerald-400">
                        {formatCurrency(order?.saleValue)}
                      </p>

                      <p className="mt-0.5 text-[10px] text-gray-400 dark:text-slate-500">
                        {order?.details?.length || 0} product
                        {order?.details?.length === 1 ? "" : "s"}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Completed
                      </span>

                      <p className="mt-1 truncate text-[10px] text-gray-400 dark:text-slate-500">
                        Created {formatDate(order?.createdAt)}
                      </p>
                    </td>

                    {/* ACTION */}
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        title="View order"
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-blue-900 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex shrink-0 items-center justify-between border-t border-gray-100 bg-gray-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                {startItem}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                {endItem}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700 dark:text-slate-200">
                {totalCount}
              </span>
            </span>

            <div className="hidden items-center gap-1.5 sm:flex">
              <span className="text-[11px] text-gray-400">Rows</span>

              <select
                value={limit}
                onChange={(e) => handleLimitChange(e.target.value)}
                className="h-7 cursor-pointer rounded-md border border-gray-200 bg-white px-1.5 text-[11px] text-gray-600 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!hasPrevious || isLoading}
              onClick={() => setPage(1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronsLeft size={14} />
            </button>

            <button
              type="button"
              disabled={!hasPrevious || isLoading}
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-blue-600 px-2 text-[11px] font-medium text-white">
              {page}
            </span>

            <button
              type="button"
              disabled={!hasNext || isLoading}
              onClick={() => setPage((prev) => prev + 1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronRight size={14} />
            </button>

            <button
              type="button"
              disabled={!hasNext || isLoading}
              onClick={() => setPage(totalPages > 0 ? totalPages : page)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW ORDER MODAL */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Adhoc Order Details
                </h2>

                {/* <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                  Order ID: {selectedOrder?.id || "-"}
                </p> */}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* CONTENT */}
            <div className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-slate-800">
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                    <UserRound size={14} />
                    Seller
                  </div>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedOrder?.soldBy || "-"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-slate-800">
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                    <Phone size={14} />
                    Phone
                  </div>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedOrder?.phoneNo || "-"}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-slate-800">
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                    <CalendarDays size={14} />
                    Sold On
                  </div>

                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatDate(selectedOrder?.soldOn)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
                    {formatTime(selectedOrder?.soldOn)}
                  </p>
                </div>

                <div className="rounded-lg border border-gray-200 p-4 dark:border-slate-800">
                  <div className="mb-2 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                    <IndianRupee size={14} />
                    Sale Value
                  </div>

                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(selectedOrder?.saleValue)}
                  </p>
                </div>
              </div>

              {/* SALE ITEMS */}
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Sale Items
                  </h3>

                  <span className="text-xs text-gray-500 dark:text-slate-400">
                    {selectedOrder?.details?.length || 0} products
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-800">
                  <table className="w-full min-w-[450px] text-left">
                    <thead className="bg-gray-50 dark:bg-slate-950">
                      <tr>
                        <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 dark:text-slate-400">
                          Sl No.
                        </th>

                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">
                          Qty
                        </th>

                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">
                          Rate
                        </th>

                        <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-500 dark:text-slate-400">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                      {selectedOrder?.details?.map((item, index) => (
                        <tr
                          key={`${item?.productId}-${item?.variantId}-${index}`}
                        >
                          <td className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-3 py-3 text-right text-sm font-medium text-gray-800 dark:text-slate-200">
                            {item?.qty ?? 0}
                          </td>

                          <td className="px-3 py-3 text-right text-sm text-gray-700 dark:text-slate-300">
                            {formatCurrency(item?.rate)}
                          </td>

                          <td className="px-3 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(
                              Number(item?.qty || 0) * Number(item?.rate || 0),
                            )}
                          </td>
                        </tr>
                      ))}

                      {(!selectedOrder?.details ||
                        selectedOrder.details.length === 0) && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400"
                          >
                            No item details available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* FOOTER INFO */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    Created At
                  </p>

                  <p className="mt-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    {formatDate(selectedOrder?.createdAt)}{" "}
                    {formatTime(selectedOrder?.createdAt)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    Updated At
                  </p>

                  <p className="mt-1 text-xs font-medium text-gray-700 dark:text-slate-300">
                    {formatDate(selectedOrder?.updatedAt)}{" "}
                    {formatTime(selectedOrder?.updatedAt)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-slate-950">
                  <p className="text-xs text-gray-500 dark:text-slate-500">
                    Status
                  </p>

                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Completed
                  </span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end border-t border-gray-200 px-5 py-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdhocOrders;

/* eslint-disable no-unused-vars */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  PackageSearch,
  Building2,
  Plus,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import orderDataStore from "../../zustand/Store/orderDataStore";
import { useNavigate } from "react-router-dom";
import { getProductUrl } from "../../utils/resolveProductUrl";
import Loader from "../../components/Loader";
import DateFilter from "../../components/DateFilter";
import { SplitButton, SplitButtonItem } from "../../components/SplitButton";

const PAGE_SIZE_OPTIONS = [8, 15, 25, 50];

// Keep this in sync with the `deliveryStatus` enum in schema.prisma
const ORDER_STATUSES = [
  "PLACED",
  "PROCESSING",
  "INTRANSIT",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

const STATUS_STYLES = {
  PLACED: "bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300",
  DELIVERED:
    "bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300",
  INTRANSIT: "bg-blue-50 text-blue-700 border-blue-200 hover:border-blue-300",
  PROCESSING:
    "bg-amber-50 text-amber-700 border-amber-200 hover:border-amber-300",
  CANCELLED: "bg-red-50 text-red-700 border-red-200 hover:border-red-300",
  FAILED: "bg-red-50 text-red-700 border-red-200 hover:border-red-300",
};

const STATUS_DOT = {
  PLACED: "bg-gray-400",
  DELIVERED: "bg-emerald-500",
  INTRANSIT: "bg-blue-500",
  PROCESSING: "bg-amber-500",
  CANCELLED: "bg-red-500",
  FAILED: "bg-red-500",
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Order = () => {
  const getOrderListing = orderDataStore((state) => state.getOrderListing);
  const exportOrderDetails = orderDataStore(
    (state) => state.exportOrderDetails,
  );
  const updateOrderStatus = orderDataStore((state) => state.updateOrderStatus);
  const orders = orderDataStore((state) => state.orders);
  const orderTotal = orderDataStore((state) => state.orderTotal);
  const loading = orderDataStore((state) => state.loading);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [dateFilter, setDateFilter] = useState("all");
  const [hoveredOrder, setHoveredOrder] = useState(null); // { order, anchor }
  const [popoverPos, setPopoverPos] = useState(null); // { top, left } — set once measured
  const popoverRef = useRef(null);
  const [toDate, setToDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [updatingId, setUpdatingId] = useState(null); // orderId currently being updated

  const navigate = useNavigate();

  const showAddressPopover = (e, order) => {
    const anchor = e.currentTarget.getBoundingClientRect();
    setPopoverPos(null); // reset so it doesn't flash the previous row's position
    setHoveredOrder({ order, anchor });
  };

  const hideAddressPopover = () => {
    setHoveredOrder(null);
    setPopoverPos(null);
  };

  // Position the popover only after it has rendered, using its real measured
  // size — this is what makes the above/below flip and edge-clamping accurate,
  // rather than guessing at a fixed height.
  useLayoutEffect(() => {
    if (!hoveredOrder || !popoverRef.current) return;

    const { anchor } = hoveredOrder;
    const { width, height } = popoverRef.current.getBoundingClientRect();
    const margin = 12;
    const gap = 8;

    let left = anchor.left;
    if (left + width + margin > window.innerWidth) {
      left = window.innerWidth - width - margin;
    }
    left = Math.max(left, margin);

    const spaceBelow = window.innerHeight - anchor.bottom;
    const spaceAbove = anchor.top;

    let top;
    if (spaceBelow >= height + gap + margin || spaceBelow >= spaceAbove) {
      // enough room below (or more room below than above) — show under the row
      top = anchor.bottom + gap;
      top = Math.min(top, window.innerHeight - margin - height);
    } else {
      // not enough room below — flip above the row
      top = anchor.top - height - gap;
    }
    top = Math.max(top, margin);

    setPopoverPos({ top, left });
  }, [hoveredOrder]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Wait until both dates are selected
      if ((fromDate && !toDate) || (!fromDate && toDate)) {
        return;
      }

      setPage(1);

      getOrderListing({
        status,
        search,
        page: 1,
        pageSize,
        fromDate,
        toDate,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [getOrderListing, search, status, pageSize, fromDate, toDate]);

  useEffect(() => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) {
      return;
    }

    getOrderListing({
      status,
      search,
      page,
      pageSize,
      fromDate,
      toDate,
    });
  }, [page]);

  const handleFromDateChange = (value) => {
    setFromDate(value);
  };
  const handleToDateChange = (value) => {
    setToDate(value);
  };
  const clearDates = () => {
    setFromDate("");
    setToDate("");
  };

  const matchesDateFilter = (order, filter) => {
    if (filter === "all") return true;

    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (filter === "today") {
      return orderDate.toDateString() === now.toDateString();
    }

    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return orderDate >= weekAgo;
    }

    if (filter === "month") {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => matchesDateFilter(order, dateFilter));
  }, [orders, dateFilter]);

  const dateCounts = useMemo(
    () => ({
      all: orders.length,
      today: orders.filter((o) => matchesDateFilter(o, "today")).length,
      week: orders.filter((o) => matchesDateFilter(o, "week")).length,
      month: orders.filter((o) => matchesDateFilter(o, "month")).length,
    }),
    [orders],
  );

  const DATE_FILTERS = [
    { key: "today", label: "Today" },
    { key: "week", label: "This week" },
    { key: "month", label: "This month" },
  ];

  const totalItems = Number(orderTotal?.totalItems ?? 0);
  const totalPages = Math.max(Number(orderTotal?.totalPages));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = orders;

  const handleExport = async () => {
    try {
      const file = await exportOrderDetails();
      const url = window.URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = "orders.xlsx";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Order data exported successfully");
    } catch {
      toast.error("Failed to export order details");
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    if (!newStatus || newStatus === order.orderStatus) return;

    setUpdatingId(order.id);

    try {

      await updateOrderStatus({
        id: order.id,
        status: newStatus,
      });

      toast.success(`Order ${order.orderId} marked as ${newStatus}`);

      await getOrderListing({
        status,
        search,
        page,
        pageSize,
        fromDate,
        toDate,
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update order status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 1;
    const addRange = (from, to) => {
      for (let i = from; i <= to; i++) pages.push(i);
    };

    if (totalPages <= 7) {
      addRange(1, totalPages);
      return pages;
    }

    pages.push(1);
    const left = Math.max(2, currentPage - windowSize);
    const right = Math.min(totalPages - 1, currentPage + windowSize);

    if (left > 2) pages.push("ellipsis-left");
    addRange(left, right);
    if (right < totalPages - 1) pages.push("ellipsis-right");
    pages.push(totalPages);

    return pages;
  };

  if (loading) return <Loader text="Loading order history lists..." />;

  return (
    <div className="p-6 sm:px-2 lg:p-6 space-y-6 bg-gray-50">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Track orders, delivery &amp; status:</span>
            <span className="text-blue-600 font-medium">
              Total Order Count: {orderTotal?.totalItems}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap sm:justify-between gap-3 items-stretch sm:items-end ">
          {/* Left cluster: Search + From/To — grows/shrinks together, Export never moves because of it */}

          {/* Export — pinned to the row's end via justify-between + shrink-0,
      so it never shifts regardless of what the left cluster does */}
          <button
            onClick={handleExport}
            className="h-10 px-4 flex items-center gap-2 rounded-lg shrink-0
    bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <DateFilter
        filters={DATE_FILTERS.map((f) => ({ ...f, count: dateCounts[f.key] }))}
        activeFilter={dateFilter}
        onFilterChange={(key) => {
          setDateFilter(key);
          setPage(1);
        }}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onClear={clearDates}
      />
      {/* ── TABLE CARD — no inner scroll, the page itself scrolls ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* MOBILE VIEW */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {paginated.length === 0 ? (
            <EmptyState />
          ) : (
            paginated.map((o, idx) => (
              <div key={o.orderId} className="p-4 hover:bg-slate-50">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 shrink-0">
                        #{start + idx + 1}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate">
                        {o.orderId}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(o.createdAt)}
                    </p>
                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-gray-900">
                        ₹{o.orderTotal}
                      </span>
                      <StatusSelect
                        order={o}
                        onChange={handleStatusChange}
                        disabled={updatingId === o.id}
                        className="w-36"
                      />
                    </div>
                  </div>
                  <img
                    src={getProductUrl(
                      o?.orderItems?.[0]?.product?.product_images?.[0],
                    )}
                    alt="Product"
                    className="w-14 h-14 rounded-lg object-cover shrink-0 border border-gray-100"
                  />
                </div>

                <div className="mt-3 text-xs text-gray-500 leading-relaxed">
                  <p className="font-medium text-gray-700">
                    {o.user?.customer_name}
                  </p>
                  <p>{o.user?.phone_num}</p>
                  <p>
                    {[o.shippingAddress?.apartment, o.shippingAddress?.locality]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(`/dashboard/orders/orderDetails/${o.id}`)
                  }
                  className="mt-3 w-full py-2 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 inline-flex items-center justify-center gap-1.5"
                >
                  <Eye size={13} />
                  View details
                </button>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block">
          <table className="w-full table-fixed text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="w-14 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Sl No.
                </th>

                <th className="w-40 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Order ID
                </th>

                <th className="w-20 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Image
                </th>

                <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Total
                </th>

                <th className="w-56 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Customer
                </th>

                <th className="w-36 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Status
                </th>

                <th className="w-44 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Created At
                </th>

                <th className="w-24 px-3 py-3 text-left text-xs font-semibold text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                paginated.map((o, idx) => (
                  <tr key={o.orderId} className="hover:bg-slate-50 transition">
                    <td className="w-16 px-4 py-3.5 text-gray-400">
                      {start + idx + 1}
                    </td>

                    <td className="w-36 px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {o.orderId}
                    </td>

                    <td className="px-4 py-3.5">
                      <img
                        src={getProductUrl(
                          o?.orderItems?.[0]?.product?.product_images?.[0],
                        )}
                        alt="Product"
                        className="w-11 h-11 rounded-lg object-cover border border-gray-100"
                      />
                    </td>

                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      ₹{o.orderTotal}
                    </td>

                    <td
                      className="px-4 py-3.5 text-gray-600 max-w-64 cursor-default"
                      onMouseEnter={(e) => showAddressPopover(e, o)}
                      onMouseLeave={hideAddressPopover}
                    >
                      <p className="font-medium text-gray-800 truncate">
                        {o.user?.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {o.user?.phone_num}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {[
                          o.shippingAddress?.apartment,
                          o.shippingAddress?.locality,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <StatusSelect
                        order={o}
                        onChange={handleStatusChange}
                        disabled={updatingId === o.id}
                        className="w-36"
                      />
                    </td>

                    <td className="px-4 py-3.5 text-gray-500 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/orders/orderDetails/${o.id}`)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 cursor-pointer text-xs font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="border-t border-gray-100 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              {filteredOrders.length === 0
                ? "No results"
                : `Showing ${start + 1}–${Math.min(
                  start + pageSize,
                  filteredOrders.length,
                )} of ${filteredOrders.length}`}
            </span>

            <label className="flex items-center gap-1.5">
              <span className="hidden md:inline">Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="cursor-pointer text-xs border border-gray-200 rounded-md px-1.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <PageButton
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              label="First page"
            >
              <ChevronsLeft size={14} />
            </PageButton>

            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              label="Previous page"
            >
              <ChevronLeft size={14} />
            </PageButton>

            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map((p, i) =>
                typeof p === "number" ? (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`min-w-8 h-8 px-1 cursor-pointer rounded-md text-xs font-medium transition ${p === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span
                    key={`${p}-${i}`}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 text-xs"
                  >
                    …
                  </span>
                ),
              )}
            </div>

            <PageButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              label="Next page"
            >
              <ChevronRight size={14} />
            </PageButton>

            <PageButton
              onClick={() => setPage(totalPages)}
              disabled={currentPage >= totalPages}
              label="Last page"
            >
              <ChevronsRight size={14} />
            </PageButton>
          </div>
        </div>
      </div>

      {/* CUSTOMER ADDRESS POPOVER — fixed positioned so it escapes any overflow/scroll
          container, and positioned only after measuring its real rendered size */}
      {hoveredOrder && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-72 bg-white border border-gray-100 rounded-xl shadow-lg p-4 pointer-events-none transition-opacity duration-100"
          style={
            popoverPos
              ? { top: popoverPos.top, left: popoverPos.left, opacity: 1 }
              : { top: 0, left: 0, opacity: 0 }
          }
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Delivery address
          </p>
          <p className="text-sm font-medium text-gray-900">
            {hoveredOrder.order.user?.customer_name}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {hoveredOrder.order.user?.phone_num}
          </p>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {[
              hoveredOrder.order.shippingAddress?.apartment,
              hoveredOrder.order.shippingAddress?.locality,
              hoveredOrder.order.shippingAddress?.landmark,
              hoveredOrder.order.shippingAddress?.city,
              hoveredOrder.order.shippingAddress?.state,
              hoveredOrder.order.shippingAddress?.pincode,
            ]
              .filter(Boolean)
              .join(", ") || "No address details available"}
          </p>
        </div>
      )}
    </div>
  );
};

const PageButton = ({ children, onClick, disabled, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="w-8 h-8 cursor-pointer rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
  >
    {children}
  </button>
);

// Editable status control — a native <select> dressed up as a bordered pill
// so it reads as "tap to change" rather than plain text, while staying a
// real <select> for accessibility and mobile-friendly native pickers.
// Fixed width keeps table rows from reflowing as the label text changes.
const StatusSelect = ({ order, onChange, disabled, className = "w-36" }) => {
  const availableStatuses = ORDER_STATUSES;

  return (
    <SplitButton
      variant="outline"
      disabled={disabled}
      className={className}
      onClick={() => { }}
      menuContent={
        <>
          {availableStatuses.map((status) => (
            <SplitButtonItem
              key={status}
              onClick={() => onChange(order, status)}
            >
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[status] || "bg-gray-400"
                      }`}
                  />

                  <span className="capitalize">
                    {status.replaceAll("_", " ").toLowerCase()}
                  </span>
                </div>

                {order.orderStatus === status && (
                  <span className="text-blue-600">✓</span>
                )}
              </div>
            </SplitButtonItem>
          ))}
        </>
      }
    >
      <div className="flex items-center gap-2">
        {disabled ? (
          <Loader2 size={11} className="animate-spin text-gray-500" />
        ) : (
          <span
            className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[order.orderStatus] || "bg-gray-400"
              }`}
          />
        )}

        <span>
          {order.orderStatus
            ?.replaceAll("_", " ")
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>
    </SplitButton>
  );
};

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
    <PackageSearch size={32} className="text-gray-300" />
    <p className="text-sm font-medium text-gray-500">No orders found</p>
    <p className="text-xs text-gray-400">
      Try adjusting your search or filters
    </p>
  </div>
);

export default Order;

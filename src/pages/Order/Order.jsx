import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Eye,
  PackageSearch,
} from "lucide-react";
import { toast } from "react-toastify";
import orderDataStore from "../../zustand/Store/orderDataStore";
import { useNavigate } from "react-router-dom";
import { getProductUrl } from "../../utils/resolveProductUrl";

const PAGE_SIZE_OPTIONS = [8, 15, 25, 50];

const STATUS_STYLES = {
  DELIVERED: "bg-emerald-50 text-emerald-700",
  INTRANSIT: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  CANCELLED: "bg-red-50 text-red-700",
  FAILED: "bg-red-50 text-red-700",
};

const STATUS_DOT = {
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
  const orders = orderDataStore((state) => state.orders);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [dateFilter, setDateFilter] = useState("all");
  const [addressPopover, setAddressPopover] = useState(null);

  const navigate = useNavigate();

  const showAddressPopover = (e, order) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const popoverWidth = 288; // matches w-72
    const margin = 12;

    let left = rect.left;
    if (left + popoverWidth + margin > window.innerWidth) {
      left = window.innerWidth - popoverWidth - margin;
    }

    setAddressPopover({
      order,
      top: rect.bottom + 8,
      left: Math.max(left, margin),
    });
  };

  const hideAddressPopover = () => setAddressPopover(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      getOrderListing(search, status);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [getOrderListing, search, status]);

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
    { key: "all", label: "All orders", countLabel: "Total orders" },
    { key: "today", label: "Today", countLabel: "Today's orders" },
    { key: "week", label: "This week", countLabel: "This week's orders" },
    { key: "month", label: "This month", countLabel: "This month's orders" },
  ];

  const totalPages = Math.max(Math.ceil(filteredOrders.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = filteredOrders.slice(start, start + pageSize);

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

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 bg-gray-50 min-h-full">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Track orders, delivery &amp; status</span>
            <span className="text-blue-600 font-medium">
              {DATE_FILTERS.find((f) => f.key === dateFilter)?.countLabel}:{" "}
              {dateCounts[dateFilter]}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch sm:items-center w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search orders…"
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2.5 cursor-pointer text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">All statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="INTRANSIT">In transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Export */}

          <button
            onClick={handleExport}
            className="w-full flex flex-1 gap-2 sm:w-auto px-3.5 py-2 text-sm font-medium bg-emerald-600
             text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* ── DATE RANGE FILTER — segmented pills with live counts ── */}
      <div className="flex flex-wrap gap-2">
        {DATE_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setDateFilter(f.key);
              setPage(1);
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border transition cursor-pointer ${
              dateFilter === f.key
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f.label}
            <span
              className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                dateFilter === f.key
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {dateCounts[f.key]}
            </span>
          </button>
        ))}
      </div>

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
                      <StatusPill status={o.orderStatus} />
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
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {[
                  "Sl No.",
                  "Order ID",
                  "Image",
                  "Total",
                  "Customer",
                  "Status",
                  "Created at",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
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
                    <td className="px-4 py-3.5 text-gray-400">
                      {start + idx + 1}
                    </td>

                    <td className="px-4 py-3.5 font-medium text-gray-900 whitespace-nowrap">
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
                      <StatusPill status={o.orderStatus} />
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
                    className={`min-w-8 h-8 px-1 cursor-pointer rounded-md text-xs font-medium transition ${
                      p === currentPage
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

      {/* CUSTOMER ADDRESS POPOVER — fixed positioned so it escapes any overflow/scroll container */}
      {addressPopover && (
        <div
          className="fixed z-50 w-72 bg-white border border-gray-100 rounded-xl shadow-lg p-4 pointer-events-none"
          style={{ top: addressPopover.top, left: addressPopover.left }}
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Delivery address
          </p>
          <p className="text-sm font-medium text-gray-900">
            {addressPopover.order.user?.customer_name}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {addressPopover.order.user?.phone_num}
          </p>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            {[
              addressPopover.order.shippingAddress?.apartment,
              addressPopover.order.shippingAddress?.locality,
              addressPopover.order.shippingAddress?.landmark,
              addressPopover.order.shippingAddress?.city,
              addressPopover.order.shippingAddress?.state,
              addressPopover.order.shippingAddress?.pincode,
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

const StatusPill = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
      STATUS_STYLES[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        STATUS_DOT[status] || "bg-gray-400"
      }`}
    />
    {status || "UNKNOWN"}
  </span>
);

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

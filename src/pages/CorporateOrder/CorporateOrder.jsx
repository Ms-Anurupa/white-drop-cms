/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  PackageSearch,
  Building2,
  Plus,
  FileText,
  RotateCcw,
  EyeIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import corporateDataStore from "../../zustand/Store/corporateDataStore";
import Loader from "../../components/Loader";
import DateFilter from "../../components/DateFilter";
import { toast } from "react-toastify";
import { SplitButton, SplitButtonItem } from "../../components/SplitButton";

const PAGE_SIZE_OPTIONS = [8, 15, 25, 50];

const DELIVERY_STATUS_STYLES = {
  PLACED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  INTRANSIT: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const DELIVERY_STATUS_DOT = {
  PLACED: "bg-blue-500",
  PROCESSING: "bg-amber-500",
  INTRANSIT: "bg-indigo-500",
  DELIVERED: "bg-emerald-500",
  FAILED: "bg-red-500",
  CANCELLED: "bg-gray-400",
};

const PAYMENT_STATUS_STYLES = {
  COMPLETE: "bg-emerald-50 text-emerald-700",
  POSTPAID: "bg-purple-50 text-purple-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
};

const PAYMENT_STATUS_DOT = {
  COMPLETE: "bg-emerald-500",
  POSTPAID: "bg-purple-500",
  PENDING: "bg-amber-500",
  FAILED: "bg-red-500",
};

const DATE_FILTERS = [
  { key: "all", label: "All orders" },
  { key: "today", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

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

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const CorporateOrder = () => {
  const navigate = useNavigate();

  const getCorporateOrders = corporateDataStore(
    (state) => state.getCorporateOrders,
  );
  const corporateOrderLists = corporateDataStore(
    (state) => state.corporateOrderLists,
  );
  const getCorporateInvoice = corporateDataStore(
    (state) => state.getCorporateInvoice,
  );
  const loading = corporateDataStore((state) => state.loading);

  // ── search + filters (all sent to the server as search params) ──
  const [search, setSearch] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openMenu, setOpenMenu] = useState(null);

  // client-side quick chip, layered on top of whatever the server returned
  // for the current page — mirrors the Order listing page behaviour
  const [dateFilter, setDateFilter] = useState("all");

  const [hoveredOrder, setHoveredOrder] = useState(null); // { order, anchor }
  const [popoverPos, setPopoverPos] = useState(null);
  const popoverRef = useRef(null);

  const orders = corporateOrderLists || [];

  const showCompanyPopover = (e, order) => {
    const anchor = e.currentTarget.getBoundingClientRect();
    setPopoverPos(null);
    setHoveredOrder({ order, anchor });
  };

  const hideCompanyPopover = () => {
    setHoveredOrder(null);
    setPopoverPos(null);
  };

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
      top = anchor.bottom + gap;
      top = Math.min(top, window.innerHeight - margin - height);
    } else {
      top = anchor.top - height - gap;
    }
    top = Math.max(top, margin);

    setPopoverPos({ top, left });
  }, [hoveredOrder]);

  // debounced fetch whenever search / filters / pageSize change — resets to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((fromDate && !toDate) || (!fromDate && toDate)) return;

      setPage(1);

      getCorporateOrders({
        search,
        deliveryStatus,
        paymentStatus,
        fromDate,
        toDate,
        page: 1,
        limit: pageSize,
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    getCorporateOrders,
    search,
    deliveryStatus,
    paymentStatus,
    fromDate,
    toDate,
    pageSize,
  ]);

  // plain page-change fetch (no debounce, no reset)
  useEffect(() => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) return;

    getCorporateOrders({
      search,
      deliveryStatus,
      paymentStatus,
      fromDate,
      toDate,
      page,
      limit: pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleFromDateChange = (value) => setFromDate(value);
  const handleToDateChange = (value) => setToDate(value);
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

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesDateFilter(order, dateFilter)),
    [orders, dateFilter],
  );

  const dateCounts = useMemo(
    () => ({
      all: orders.length,
      today: orders.filter((o) => matchesDateFilter(o, "today")).length,
      week: orders.filter((o) => matchesDateFilter(o, "week")).length,
      month: orders.filter((o) => matchesDateFilter(o, "month")).length,
    }),
    [orders],
  );

  const hasOrders = filteredOrders.length > 0;
  const start = (page - 1) * pageSize;
  const isLastPage = orders.length < pageSize;

  const resetFilters = () => {
    setSearch("");
    setDeliveryStatus("");
    setPaymentStatus("");
    setFromDate("");
    setToDate("");
    setDateFilter("all");
    setPage(1);
  };

  //download invoice
  const handleViewInvoice = async (orderId) => {
    try {
      const res = await getCorporateInvoice(orderId);

      if (res?.signedUrl) {
        window.open(res.signedUrl, "_blank");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await getCorporateInvoice(orderId);

      if (res?.signedUrl) {
        const link = document.createElement("a");
        link.href = res.signedUrl;
        link.download = "";
        link.click();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegenerateInvoice = (orderId) => {
    // Integrate later
    console.log("Regenerate", orderId);
  };

  if (loading) return <Loader text="Loading corporate orders..." />;

  return (
    <div className="py-6 sm:px-2 lg:px-2 space-y-2 bg-gray-50">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Corporate Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>View and manage all corporate orders</span>
            <span className="text-blue-600 font-medium">
              {DATE_FILTERS.find((f) => f.key === dateFilter)?.label}:{" "}
              {dateCounts[dateFilter]}
            </span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, company, GST..."
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg bg-white border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          <button
            onClick={() =>
              navigate("/dashboard/corporate-orders/create-corporate-order")
            }
            className="h-10 px-4 flex items-center justify-center gap-2 rounded-lg shrink-0
              bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition 
              whitespace-nowrap cursor-pointer"
          >
            <Building2 size={16} />
            Create Corporate Order
            <Plus size={14} />
          </button>
        </div>
      </div>

      <DateFilter
        filters={DATE_FILTERS.map((f) => ({ ...f, count: dateCounts[f.key] }))}
        activeFilter={dateFilter}
        onFilterChange={(key) => setDateFilter(key)}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onClear={clearDates}
      />

      {/* ── STATUS FILTERS ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:items-end">
        <div className="w-full sm:w-48">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Delivery Status
          </label>
          <select
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value)}
            className="w-full cursor-pointer h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
          >
            <option value="">All</option>
            <option value="PLACED">Placed</option>
            <option value="PROCESSING">Processing</option>
            <option value="INTRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="w-full sm:w-48">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Payment Status
          </label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full cursor-pointer h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
          >
            <option value="">All</option>
            <option value="COMPLETE">Complete</option>
            <option value="PENDING">Pending</option>
            <option value="POSTPAID">Postpaid</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <button
          onClick={resetFilters}
          className="h-10 px-4 cursor-pointer rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition sm:ml-auto"
        >
          Reset filters
        </button>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* MOBILE VIEW */}
        <div className="block lg:hidden divide-y divide-gray-100">
          {!hasOrders ? (
            <EmptyState
              onCreate={() =>
                navigate("/dashboard/corporate-orders/create-corporate-order")
              }
            />
          ) : (
            filteredOrders.map((o, idx) => (
              <div key={o.id} className="p-4 hover:bg-slate-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 shrink-0">
                        #{start + idx + 1}
                      </span>
                      <h3 className="font-medium text-gray-900 truncate">
                        {o.orderId}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Building2 size={12} className="shrink-0" />
                      <span className="truncate">
                        {o.corpoAcc?.businessName}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <span className="font-semibold text-sm text-gray-900 shrink-0">
                    {formatCurrency(o.orderDetails?.orderTotal)}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-500 leading-relaxed">
                  <p className="font-medium text-gray-700">
                    {o.orderDetails?.productName}
                  </p>
                  <p className="line-clamp-1">{o.orderDetails?.description}</p>
                  <p className="mt-1">
                    {o.orderDetails?.qty} {o.orderDetails?.unit} ·{" "}
                    {formatCurrency(o.orderDetails?.pricePerUnit)} / unit
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusPill
                    status={o.deliveryStatus}
                    styles={DELIVERY_STATUS_STYLES}
                    dots={DELIVERY_STATUS_DOT}
                  />
                  <StatusPill
                    status={o.paymentStatus}
                    styles={PAYMENT_STATUS_STYLES}
                    dots={PAYMENT_STATUS_DOT}
                  />
                </div>
                <SplitButton
                  variant="primary"
                  onClick={() => handleViewInvoice(o.id)}
                  menuContent={
                    <>
                      <SplitButtonItem
                        onClick={() => handleRegenerateInvoice(o.id)}
                      >
                        <span className="mr-2">
                          <RotateCcw />
                        </span>{" "}
                        Regenerate
                      </SplitButtonItem>

                      <SplitButtonItem
                        onClick={() => handleDownloadInvoice(o.id)}
                      >
                        <span className="mr-2">
                          <Download />
                        </span>{" "}
                        Download
                      </SplitButtonItem>
                    </>
                  }
                >
                  <span className="mr-3">
                    <EyeIcon />
                  </span>{" "}
                  View
                </SplitButton>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block">
          <div className="w-full max-w-full overflow-x-auto">
            <table className="text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="w-10 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Sl No.
                  </th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Order ID
                  </th>
                  <th className="w-30 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Company
                  </th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Product
                  </th>
                  <th className="w-14 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Quantity
                  </th>
                  <th className="w-16 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Price/unit
                  </th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Total
                  </th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Delivery
                  </th>
                  <th className="w-24 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Payment
                  </th>
                  <th className="w-26 px-2 py-3 text-left text-xs font-semibold text-gray-500">
                    Created
                  </th>
                  <th className="w-14 px-2 py-3 text-center text-xs font-semibold text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {!hasOrders ? (
                  <tr>
                    <td colSpan={11}>
                      <EmptyState
                        onCreate={() =>
                          navigate(
                            "/dashboard/corporate-orders/create-corporate-order",
                          )
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((o, idx) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 text-gray-400">
                        {start + idx + 1}
                      </td>

                      <td className="px-4 py-3.5 font-medium text-gray-900 ">
                        {o.orderId}
                      </td>

                      <td
                        className="px-4 py-3.5 text-gray-700 cursor-default"
                        onMouseEnter={(e) => showCompanyPopover(e, o)}
                        onMouseLeave={hideCompanyPopover}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Building2
                            size={13}
                            className="text-gray-400 shrink-0"
                          />
                          <span className="truncate font-medium">
                            {o.corpoAcc?.businessName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          GST: {o.corpoAcc?.gstNo || "-"}
                        </p>
                      </td>

                      <td className="px-2 py-3.5 min-w-0">
                        <p className="font-medium text-gray-900">
                          {o.orderDetails?.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {o.orderDetails?.description}
                        </p>
                      </td>

                      <td className="px-2 py-3.5 text-gray-600 whitespace-nowrap">
                        {o.orderDetails?.qty} {o.orderDetails?.unit}
                      </td>

                      <td className="px-2 py-3.5 text-gray-600 whitespace-nowrap">
                        {formatCurrency(o.orderDetails?.pricePerUnit)}
                      </td>

                      <td className="px-2 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                        {formatCurrency(o.orderDetails?.orderTotal)}
                      </td>

                      <td className="px-2 py-3.5">
                        <StatusPill
                          status={o.deliveryStatus}
                          styles={DELIVERY_STATUS_STYLES}
                          dots={DELIVERY_STATUS_DOT}
                        />
                      </td>

                      <td className="px-2 py-3.5">
                        <StatusPill
                          status={o.paymentStatus}
                          styles={PAYMENT_STATUS_STYLES}
                          dots={PAYMENT_STATUS_DOT}
                        />
                      </td>

                      <td className="px-2 py-3.5 text-gray-500">
                        {formatDate(o.createdAt)}
                      </td>

                      <td className="px-2 py-3.5 text-center">
                        <SplitButton
                          variant="primary"
                          onClick={() => handleViewInvoice(o.id)}
                          menuContent={
                            <>
                              <SplitButtonItem
                                onClick={() => handleRegenerateInvoice(o.id)}
                              >
                                <span className="mr-2">
                                  <RotateCcw />
                                </span>{" "}
                                Regenerate
                              </SplitButtonItem>

                              <SplitButtonItem
                                onClick={() => handleDownloadInvoice(o.id)}
                              >
                                <span className="mr-2">
                                  <Download />
                                </span>{" "}
                                Download
                              </SplitButtonItem>
                            </>
                          }
                        >
                          <span className="mr-3">
                            <EyeIcon />
                          </span>{" "}
                          View
                        </SplitButton>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="border-t border-gray-100 px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              {filteredOrders.length === 0
                ? "No results"
                : `Showing ${start + 1}–${start + filteredOrders.length}`}
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Page {page}</span>

            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              label="Previous page"
            >
              <ChevronLeft size={14} />
            </PageButton>

            <PageButton
              onClick={() => setPage((p) => p + 1)}
              disabled={isLastPage}
              label="Next page"
            >
              <ChevronRight size={14} />
            </PageButton>
          </div>
        </div>
      </div>

      {/* COMPANY DETAILS POPOVER */}
      {hoveredOrder && (
        <div
          ref={popoverRef}
          className="fixed z-50 w-80 bg-white border border-gray-100 rounded-xl shadow-lg p-4 pointer-events-none transition-opacity duration-100"
          style={
            popoverPos
              ? { top: popoverPos.top, left: popoverPos.left, opacity: 1 }
              : { top: 0, left: 0, opacity: 0 }
          }
        >
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Company details
          </p>
          <p className="text-sm font-medium text-gray-900">
            {hoveredOrder.order.corpoAcc?.businessName}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            GST: {hoveredOrder.order.corpoAcc?.gstNo || "-"}
          </p>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Address:{" "}
            {hoveredOrder.order.corpoAcc?.address ||
              "No address details available"}
          </p>
          {hoveredOrder.order.orderDetails?.notes && (
            <>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-3 mb-1">
                Notes
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                {hoveredOrder.order.orderDetails.notes}
              </p>
            </>
          )}
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

const StatusPill = ({ status, styles, dots }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
      styles[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${dots[status] || "bg-gray-400"}`}
    />
    {status || "UNKNOWN"}
  </span>
);

const EmptyState = ({ onCreate }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-16 text-gray-400">
    <PackageSearch size={32} className="text-gray-300" />
    <p className="text-sm font-medium text-gray-500">
      No corporate orders found
    </p>
    <p className="text-xs text-gray-400">
      Try adjusting your search or filters
    </p>
    {onCreate && (
      <button
        onClick={onCreate}
        className="mt-3 cursor-pointer inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700 transition"
      >
        <Plus size={14} />
        Create corporate order
      </button>
    )}
  </div>
);

export default CorporateOrder;

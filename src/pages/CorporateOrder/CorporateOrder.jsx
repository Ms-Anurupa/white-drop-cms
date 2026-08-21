/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  PackageSearch,
  Building2,
  Plus,
  RotateCcw,
  EyeIcon,
  RefreshCw,
  Undo2,
  Pencil,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import corporateDataStore from "../../zustand/Store/corporateDataStore";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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

// Scoped, "futuristic" scrollbar — a slim rounded track with a
// blue → indigo gradient thumb that brightens on hover. Applied via the
// `.futuristic-scroll` class on whichever element needs to scroll.
const ScrollbarStyle = () => (
  <style>{`
    .futuristic-scroll {
      scrollbar-width: thin;
      scrollbar-color: #6366f1 #eef2ff;
    }
    .futuristic-scroll::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    .futuristic-scroll::-webkit-scrollbar-track {
      background: #eef2ff;
      border-radius: 999px;
    }
    .futuristic-scroll::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #60a5fa, #6366f1);
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: padding-box;
      transition: background 0.2s ease;
    }
    .futuristic-scroll::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #3b82f6, #4f46e5);
      background-clip: padding-box;
      box-shadow: 0 0 6px rgba(99, 102, 241, 0.6);
    }
    .futuristic-scroll::-webkit-scrollbar-corner {
      background: transparent;
    }
  `}</style>
);

const CorporateOrder = () => {
  const navigate = useNavigate();

  const getCorporateOrders = corporateDataStore(
    (state) => state.getCorporateOrders,
  );
  const corporateOrderLists = corporateDataStore(
    (state) => state.corporateOrderLists,
  );
  const corporateOrderPagination = corporateDataStore(
    (state) => state.corporateOrderPagination,
  );
  const getCorporateInvoice = corporateDataStore(
    (state) => state.getCorporateInvoice,
  );

  // ── search + filters (all sent to the server as search params) ──
  const [search, setSearch] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [openMenu, setOpenMenu] = useState(null); // orderId whose invoice dropdown is open
  const [dateFilter, setDateFilter] = useState("all");
  const [hoveredOrder, setHoveredOrder] = useState(null); // { order, anchor }
  const [popoverPos, setPopoverPos] = useState(null);
  const popoverRef = useRef(null);
  const [loading, setLoading] = useState(true);
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

  // close the invoice dropdown on outside click
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e) => {
      if (!e.target.closest("[data-invoice-menu]")) setOpenMenu(null);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [openMenu]);

  // debounced fetch whenever search / filters / pageSize change — resets to page 1
  useEffect(() => {
    if ((fromDate && !toDate) || (!fromDate && toDate)) return;

    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        setPage(1);

        await getCorporateOrders({
          search,
          deliStatus: deliveryStatus,
          payStatus: paymentStatus,
          fromDate,
          toDate,
          page: 1,
          limit: pageSize,
        });
      } catch (error) {
        console.error("Failed to load corporate orders:", error);
        toast.error("Failed to load corporate orders");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, deliveryStatus, paymentStatus, fromDate, toDate, pageSize]);

  // plain page-change fetch (no debounce, no reset)
  useEffect(() => {
    if (page === 1) return;

    if ((fromDate && !toDate) || (!fromDate && toDate)) return;

    const loadPage = async () => {
      try {
        setLoading(true);

        await getCorporateOrders({
          search,
          deliStatus: deliveryStatus,
          payStatus: paymentStatus,
          fromDate,
          toDate,
          page,
          limit: pageSize,
        });
      } catch (error) {
        console.error("Failed to load corporate orders:", error);
        toast.error("Failed to load corporate orders");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
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

  const handleRefresh = async () => {
    try {
      setLoading(true);

      await getCorporateOrders({
        search,
        deliStatus: deliveryStatus,
        payStatus: paymentStatus,
        fromDate,
        toDate,
        page,
        limit: pageSize,
      });

      toast.success("Orders refreshed");
    } catch (error) {
      console.error("Failed to refresh orders:", error);
      toast.error("Failed to refresh orders");
    } finally {
      setLoading(false);
    }
  };

  //download invoice
  const handleViewInvoice = async (orderId) => {
    try {
      const data = await getCorporateInvoice(orderId);

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadInvoice = async (id, orderId) => {
    try {
      const data = await getCorporateInvoice(id);

      if (data?.signedUrl) {
        const fileResponse = await fetch(data.signedUrl);
        const pdfBlob = await fileResponse.blob();

        const url = window.URL.createObjectURL(pdfBlob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegenerateInvoice = async (orderId) => {
    const data = await getCorporateInvoice(orderId, true);
    //TODO add a toast here
  };

  if (loading) return <Loader text="Loading corporate orders..." />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 px-4 py-3 gap-2">
      <ScrollbarStyle />

      {/* ── HEADER ── */}
      <div className="shrink-0 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
            Corporate Orders
          </h1>
          <span className="text-xs text-blue-600 font-medium">
            Total: {corporateOrderPagination?.pagination?.totalCount ?? 0}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap sm:flex-nowrap gap-2 items-stretch sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search order ID, company, GST..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-white border border-gray-200
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>

          <button
            onClick={() =>
              navigate("/dashboard/corporate-orders/create-corporate-order")
            }
            className="h-8 px-3 flex items-center justify-center gap-1.5 rounded-lg shrink-0
              bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition
              whitespace-nowrap cursor-pointer"
          >
            <Building2 size={14} />
            Create Corporate Order
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* ── FILTER BAR — everything on one line on desktop ── */}
      <div className="shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm px-3 py-2 flex flex-wrap xl:flex-nowrap items-center gap-2 overflow-x-auto futuristic-scroll">
        {/* date-range pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          {DATE_FILTERS.map((f) => {
            const active = dateFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setDateFilter(f.key)}
                className={`h-8 px-3 flex items-center gap-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f.label}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {dateCounts[f.key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="hidden xl:block w-px h-6 bg-gray-100 shrink-0" />

        {/* explicit from/to range */}
        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => handleFromDateChange(e.target.value)}
            className="h-8 rounded-lg border border-gray-200 px-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white cursor-pointer"
          />
          <span className="text-gray-300 text-xs">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => handleToDateChange(e.target.value)}
            className="h-8 rounded-lg border border-gray-200 px-2 text-xs text-gray-600 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white cursor-pointer"
          />
          {(fromDate || toDate) && (
            <button
              onClick={clearDates}
              title="Clear dates"
              className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="hidden xl:block w-px h-6 bg-gray-100 shrink-0" />

        {/* status selects + actions */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 xl:ml-auto">
          <select
            value={deliveryStatus}
            onChange={(e) => setDeliveryStatus(e.target.value)}
            className="cursor-pointer h-8 rounded-lg border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
            title="Delivery status"
          >
            <option value="">All delivery</option>
            <option value="PLACED">Placed</option>
            <option value="PROCESSING">Processing</option>
            <option value="INTRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="cursor-pointer h-8 rounded-lg border border-gray-200 px-2 text-xs outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
            title="Payment status"
          >
            <option value="">All payment</option>
            <option value="COMPLETE">Complete</option>
            <option value="PENDING">Pending</option>
            <option value="POSTPAID">Postpaid</option>
            <option value="FAILED">Failed</option>
          </select>

          <button
            onClick={handleRefresh}
            className="h-8 px-2.5 cursor-pointer rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={resetFilters}
            className="h-8 px-2.5 cursor-pointer rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition flex items-center gap-1.5"
          >
            <Undo2 size={14} />
            Reset
          </button>
        </div>
      </div>

      {/* ── TABLE CARD — fills all remaining vertical space ── */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-xl border border-gray-100">
        <div className="flex-1 min-h-0 overflow-auto futuristic-scroll">
          <table className="min-w-[1300px] w-full table-fixed text-xs">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr className="border-b border-gray-300">
                <th className="w-10 px-2 py-2 text-left text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                  Sl No.
                </th>
                <th className="w-36 px-2 py-2 text-left text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                  Order ID
                </th>
                <th className="w-40 px-2 py-2 text-left text-[11px] font-semibold text-gray-500">
                  Company
                </th>
                <th className="w-24 px-2 py-2 text-left text-[11px] font-semibold text-gray-500">
                  Product
                </th>
                <th className="w-14 px-2 py-2 text-left text-[11px] font-semibold text-gray-500">
                  Qty
                </th>
                {/* <th className="w-16 px-2 py-2 text-left text-[11px] font-semibold text-gray-500">
                  Price/unit
                </th> */}
                <th className="w-20 px-2 py-2 text-left text-[11px] font-semibold text-gray-500">
                  Total
                </th>
                <th className="w-24 px-2 py-2 text-left text-[11px] font-semibold text-gray-500">
                  Delivery
                </th>
                <th className="w-24 px-2 py-2 text-left text-[11px] font-semibold text-gray-500">
                  Payment
                </th>
                <th className="w-24 px-2 py-2 text-left text-[11px] font-semibold text-gray-500">
                  Created
                </th>
                <th className="w-24 px-2 py-2 text-center text-[11px] font-semibold text-gray-500">
                  Invoice
                </th>
                <th className="w-16 px-2 py-2 text-center text-[11px] font-semibold text-gray-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-50">
              {!hasOrders ? (
                <tr>
                  <td colSpan={12}>
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
                    <td className="px-2 py-1.5 text-gray-400">
                      {start + idx + 1}
                    </td>

                    <td className="px-2 py-1.5 font-medium text-blue-900 truncate">
                      {o.orderId}
                    </td>

                    <td
                      className="px-2 py-1.5 text-gray-700 cursor-default"
                      onMouseEnter={(e) => showCompanyPopover(e, o)}
                      onMouseLeave={hideCompanyPopover}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Building2
                          size={12}
                          className="text-gray-400 shrink-0"
                        />
                        <span className="truncate font-medium">
                          {o.corpoAcc?.businessName}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">
                        GST: {o.corpoAcc?.gstNo || "-"}
                      </p>
                    </td>

                    <td className="px-2 py-1.5 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {o.orderDetails?.productName}
                      </p>
                      <p className="text-[10px] text-gray-500 truncate">
                        {o.orderDetails?.description}
                      </p>
                    </td>

                    <td className="px-2 py-1.5 text-gray-800 whitespace-nowrap">
                      {o.orderDetails?.receivedQuantity}{" "}
                      {o.orderDetails?.receivedUnit}
                    </td>

                    {/* <td className="px-2 py-1.5 text-green-600 whitespace-nowrap">
                      {formatCurrency(o.orderDetails?.pricePerUnit)}
                    </td> */}

                    <td className="px-2 py-1.5 font-semibold text-green-900 whitespace-nowrap">
                      {formatCurrency(o.orderDetails?.receivedTotalPrice)}
                    </td>

                    <td className="px-2 py-1.5">
                      <StatusPill
                        status={o.deliveryStatus}
                        styles={DELIVERY_STATUS_STYLES}
                        dots={DELIVERY_STATUS_DOT}
                      />
                    </td>

                    <td className="px-2 py-1.5">
                      <StatusPill
                        status={o.paymentStatus}
                        styles={PAYMENT_STATUS_STYLES}
                        dots={PAYMENT_STATUS_DOT}
                      />
                    </td>

                    <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap text-[11px]">
                      {formatDate(o.createdAt)}
                    </td>

                    {/* compact custom split button — replaces the old
                        oversized SplitButton component */}
                    <td className="px-2 py-1.5">
                      <div
                        className="relative inline-flex w-full justify-center"
                        data-invoice-menu
                      >
                        <div className="inline-flex rounded-md overflow-hidden shadow-sm">
                          <button
                            onClick={() => handleViewInvoice(o.id)}
                            className="h-7 pl-2 pr-2 flex items-center gap-1 bg-blue-600 text-white text-[11px] font-medium hover:bg-blue-700 transition cursor-pointer"
                            title="View invoice"
                          >
                            <EyeIcon size={12} />
                            View
                          </button>
                          <button
                            onClick={() =>
                              setOpenMenu(openMenu === o.id ? null : o.id)
                            }
                            className="h-7 w-6 flex items-center justify-center bg-blue-700 text-white hover:bg-blue-800 transition cursor-pointer border-l border-blue-500/40"
                            title="More invoice actions"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>

                        {openMenu === o.id && (
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-100 rounded-lg shadow-lg py-1 z-20 text-left">
                            <button
                              onClick={() => {
                                handleRegenerateInvoice(o.id);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <RotateCcw size={12} />
                              Regenerate
                            </button>
                            <button
                              onClick={() => {
                                handleDownloadInvoice(o.id, o.orderId);
                                setOpenMenu(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-gray-700 hover:bg-gray-50 cursor-pointer"
                            >
                              <Download size={12} />
                              Download
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

{/* actions */}
                    <td className="px-2 py-1.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/corporate-orders/view/${o.id}`)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>

                        <button
                          onClick={() =>
                            navigate(`/dashboard/corporate-orders/edit/${o.id}`)
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION — always pinned to the bottom of the card */}
        <div className="shrink-0 border-t border-gray-100 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
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
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
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

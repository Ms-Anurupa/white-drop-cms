/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  FileText,
  EyeIcon,
  Download,
  RefreshCw,
  MapPin,
  Phone,
  Package,
  IndianRupee,
  History,
  Receipt,
  CheckCircle2,
  Truck,
  Plus
} from "lucide-react";
import { toast } from "react-toastify";
import corporateDataStore from "../zustand/Store/corporateDataStore";
import Loader from "./Loader";
import AddOfflinePaymentModal from "./AddOfflinePaymentModal"; // Ensure the path is correct

// Shared Status Mappings
const DELIVERY_STATUS_STYLES = {
  PLACED: "bg-blue-50 text-blue-700 border-blue-200",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-200",
  INTRANSIT: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-gray-50 text-gray-700 border-gray-200",
};

const DELIVERY_STATUS_DOTS = {
  PLACED: "bg-blue-500",
  PROCESSING: "bg-amber-500",
  INTRANSIT: "bg-indigo-500",
  DELIVERED: "bg-emerald-500",
  FAILED: "bg-red-500",
  CANCELLED: "bg-gray-400",
};

const PAYMENT_STATUS_STYLES = {
  COMPLETE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POSTPAID: "bg-purple-50 text-purple-700 border-purple-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
};

const PAYMENT_STATUS_DOTS = {
  COMPLETE: "bg-emerald-500",
  POSTPAID: "bg-purple-500",
  PENDING: "bg-amber-500",
  FAILED: "bg-red-500",
};

// Formatters
const formatStatusLabel = (value) => {
  if (!value) return "Unknown";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatShortDate = (value, includeTime = false) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  return date.toLocaleDateString("en-IN", options);
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const ScrollbarStyle = () => (
  <style>{`
    .corporate-scroll {
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #f1f5f9;
    }
    .corporate-scroll::-webkit-scrollbar {
      width: 7px;
      height: 7px;
    }
    .corporate-scroll::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 999px;
    }
    .corporate-scroll::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 999px;
    }
    .corporate-scroll::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `}</style>
);

const StatusPill = ({ status, styles = {}, dots = {} }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap shadow-sm ${
        styles?.[status] || "border-gray-200 bg-gray-50 text-gray-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
          dots?.[status] || "bg-gray-400"
        }`}
      />
      {formatStatusLabel(status)}
    </span>
  );
};

const CorporateOrderView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const getCorporateOrderById = corporateDataStore(
    (state) => state.getCorporateOrderById,
  );
  const getCorporateInvoice = corporateDataStore(
    (state) => state.getCorporateInvoice,
  );

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [invoiceAction, setInvoiceAction] = useState(null);

  // Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await getCorporateOrderById(id);
      setOrder(response);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load corporate order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // Calculations for Payment Due
  const baseTotal =
    order?.orderDetails?.receivedTotalPrice ??
    order?.orderDetails?.grandTotal ??
    0;
    
  const isPaidOnline = order?.paymentStatus === "COMPLETE";

  const currentDue = useMemo(() => {
    if (!order) return 0;
    if (isPaidOnline) return 0;

    const logs = order.offlinePaymentLogs;
    if (logs && logs.length > 0) {
      const sortedLogs = [...logs].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      return Number(sortedLogs[0].dueAfter);
    }

    return Number(baseTotal);
  }, [order, isPaidOnline, baseTotal]);

  if (loading) {
    return <Loader text="Loading corporate order..." />;
  }

  if (!order) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <FileText size={40} className="mb-4 text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          Corporate order not found.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleViewInvoice = async () => {
    try {
      setInvoiceAction("view");
      const data = await getCorporateInvoice(id);

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Invoice not available");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoice");
    } finally {
      setInvoiceAction(null);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      setInvoiceAction("download");
      const data = await getCorporateInvoice(id);

      if (!data?.signedUrl) {
        toast.error("Invoice not available");
        return;
      }

      const response = await fetch(data.signedUrl);
      if (!response.ok) throw new Error("Failed to fetch invoice file");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${order.orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download invoice");
    } finally {
      setInvoiceAction(null);
    }
  };

  const offlinePaymentLogs = order.offlinePaymentLogs || [];
  const { corpoAcc, orderDetails } = order;

  return (
    <div className="bg-gray-50">
      <ScrollbarStyle />

      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        {/* LEFT SIDE: Back Button & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
            title="Go back"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                {order.orderId}
              </h1>
              <StatusPill
                status={order.deliveryStatus}
                styles={DELIVERY_STATUS_STYLES}
                dots={DELIVERY_STATUS_DOTS}
              />
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Internal ID: {order.id} • Created on{" "}
              {formatShortDate(order.createdAt, true)}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Add Offline Payment Button */}
        {!isPaidOnline && currentDue > 0 && (
          <button
            onClick={() => {
              setIsPaymentModalOpen(true);
            }}
            className="group flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow active:scale-95 cursor-pointer"
          >
            <Plus
              size={14}
              className="transition-transform group-hover:rotate-90"
            />
            Add Offline Payment
          </button>
        )}
      </div>

      {/* CONTENT AREA */}
      <div className="corporate-scroll flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {/* LEFT COLUMN (Wider) */}
            <div className="flex flex-col gap-4 xl:col-span-2">
              {/* ORDER ITEMS & DETAILS CARD */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Package size={16} className="text-blue-500" />
                  Product & Order Items
                </h2>

                <div className="mb-5 flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {orderDetails?.productName || "Unknown Product"}
                    </h3>
                    <p className="text-xs font-medium text-gray-500">
                      Total Ordered: {formatCurrency(orderDetails?.grandTotal)}
                    </p>
                  </div>
                </div>

                {Array.isArray(orderDetails?.items) &&
                  orderDetails.items.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-gray-100">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-gray-50/80 text-gray-500">
                          <tr>
                            <th className="px-4 py-2.5 font-medium">#</th>
                            <th className="px-4 py-2.5 font-medium">
                              Order Date
                            </th>
                            <th className="px-4 py-2.5 font-medium">Qty</th>
                            <th className="px-4 py-2.5 font-medium text-right">
                              Price/Unit
                            </th>
                            <th className="px-4 py-2.5 font-medium text-right text-gray-900">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {orderDetails.items.map((item, idx) => (
                            <tr
                              key={idx}
                              className="transition hover:bg-gray-50/50"
                            >
                              <td className="px-4 py-3 text-gray-500">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {formatShortDate(item.orderDate)}
                              </td>
                              <td className="px-4 py-3 text-gray-700">
                                {item.qty} {item.unit}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">
                                {formatCurrency(item.pricePerUnit)}
                              </td>
                              <td className="px-4 py-3 text-right font-medium text-gray-900">
                                {formatCurrency(item.itemTotalPrice)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                {/* DELIVERY NOTE */}
                {orderDetails?.deliveryNote && (
                  <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold text-amber-700">
                      <Truck size={14} /> Delivery Note
                    </div>
                    <p className="text-sm text-amber-900/80">
                      {orderDetails.deliveryNote}
                    </p>
                  </div>
                )}
              </div>

              {/* RECEIVED & DISCOUNT CARD */}
              {(orderDetails?.receivedQuantity != null ||
                orderDetails?.discountValue != null) && (
                <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                  <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    Received & Final Adjustments
                  </h2>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-lg border border-gray-50 bg-gray-50/50 p-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        Rcvd Qty
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {orderDetails?.receivedQuantity != null
                          ? `${orderDetails.receivedQuantity} ${
                              orderDetails?.receivedUnit || ""
                            }`
                          : "-"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-gray-50 bg-gray-50/50 p-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        Rcvd Price/Unit
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatCurrency(orderDetails?.receivedPricePerUnit)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-emerald-700">
                        Final Total
                      </p>
                      <p className="text-sm font-bold text-emerald-700">
                        {formatCurrency(orderDetails?.receivedTotalPrice)}
                      </p>
                    </div>

                    <div className="rounded-lg border border-red-50 bg-red-50/50 p-3">
                      <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-red-600">
                        Discount
                      </p>
                      <p className="text-sm font-bold text-red-600">
                        {formatCurrency(orderDetails?.discountValue)}
                      </p>
                      {orderDetails?.discountReason && (
                        <p className="mt-1 truncate text-[10px] text-red-500/80">
                          {orderDetails.discountReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* OFFLINE PAYMENT LOGS */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/30 p-4">
                  <div className="flex items-center gap-2">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <History size={16} className="text-blue-500" />
                      Payment/Due Logs
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {offlinePaymentLogs.length}
                    </span>
                  </div>

                  {!isPaidOnline && currentDue > 0 && (
                    <button
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="group flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-95 cursor-pointer"
                    >
                      <Receipt
                        size={14}
                        className="text-gray-400 transition-colors group-hover:text-blue-500"
                      />
                      Add Payment
                    </button>
                  )}
                </div>

                {offlinePaymentLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-gray-50/80 text-gray-500">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">
                            Date & Time
                          </th>
                          <th className="px-4 py-2.5 font-medium">Mode</th>
                          <th className="px-4 py-2.5 text-right font-medium">
                            Due Before
                          </th>
                          <th className="px-4 py-2.5 text-right font-medium text-emerald-600">
                            Amount Received
                          </th>
                          <th className="px-4 py-2.5 text-right font-medium">
                            Due After
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {offlinePaymentLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="transition hover:bg-gray-50/50"
                          >
                            <td className="px-4 py-3 text-gray-600">
                              {formatShortDate(log.createdAt, true)}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                {log.paymentMode}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-500">
                              {formatCurrency(log.dueBefore)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                              +{formatCurrency(log.paymentRec)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800">
                              {formatCurrency(log.dueAfter)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-gray-400">
                    No offline payments recorded yet.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN (Sidebar Info) */}
            <div className="flex flex-col gap-4">
              {/* COMPANY INFO */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Building2 size={16} className="text-blue-500" />
                  Company Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      Business Name
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">
                      {corpoAcc?.businessName || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      GST Number
                    </p>
                    <p className="mt-0.5 font-mono text-xs text-gray-700">
                      {corpoAcc?.gstNo || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      Contact
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                      <Phone size={13} className="text-gray-400" />
                      {corpoAcc?.contactNo || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                      Address
                    </p>
                    <div className="mt-1 flex items-start gap-2 text-xs text-gray-600">
                      <MapPin
                        size={14}
                        className="mt-0.5 shrink-0 text-gray-400"
                      />
                      <p className="leading-relaxed">
                        {corpoAcc?.address || "Address not provided"}
                      </p>
                    </div>
                    {corpoAcc?.location?.landmark && (
                      <p className="ml-5 mt-1 text-[10px] text-gray-400">
                        Landmark: {corpoAcc.location.landmark}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* PAYMENT & BILLING INFO */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <IndianRupee size={16} className="text-blue-500" />
                  Payment Summary
                </h2>

                <div className="space-y-4">
                  {/* TOTAL AMOUNT ROW */}
                  <div className="flex items-center justify-between rounded-lg bg-blue-50/50 p-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        Base Total Amount
                      </p>
                      <p className="mt-0.5 text-xl font-bold text-blue-900">
                        {formatCurrency(baseTotal)}
                      </p>
                    </div>
                    <StatusPill
                      status={order.paymentStatus}
                      styles={PAYMENT_STATUS_STYLES}
                      dots={PAYMENT_STATUS_DOTS}
                    />
                  </div>

                  {/* DYNAMIC DUE AMOUNT ROW */}
                  {!isPaidOnline && (
                    <div
                      className={`flex items-center justify-between rounded-lg border p-3 ${
                        currentDue > 0
                          ? "border-amber-100 bg-amber-50"
                          : "border-emerald-100 bg-emerald-50"
                      }`}
                    >
                      <div>
                        <p
                          className={`text-[10px] font-medium uppercase tracking-wider ${
                            currentDue > 0
                              ? "text-amber-600/80"
                              : "text-emerald-600/80"
                          }`}
                        >
                          Current Due
                        </p>
                        <p
                          className={`mt-0.5 text-lg font-bold ${
                            currentDue > 0
                              ? "text-amber-700"
                              : "text-emerald-700"
                          }`}
                        >
                          {formatCurrency(currentDue)}
                        </p>
                      </div>
                      {currentDue <= 0 && (
                        <span className="rounded bg-emerald-100/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          Fully Paid
                        </span>
                      )}
                    </div>
                  )}

                  {isPaidOnline && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-700">
                      <CheckCircle2 size={16} className="text-emerald-500" />
                      Paid via Payment Gateway
                    </div>
                  )}
                </div>
              </div>

              {/* INVOICE ACTIONS */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <FileText size={16} className="text-blue-500" />
                  Invoice Actions
                </h2>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleViewInvoice}
                    disabled={invoiceAction === "view"}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {invoiceAction === "view" ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <EyeIcon size={16} />
                    )}
                    View Invoice
                  </button>

                  <button
                    onClick={handleDownloadInvoice}
                    disabled={invoiceAction === "download"}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {invoiceAction === "download" ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Download Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER MODAL */}
      <AddOfflinePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        contextType="BULK_ORDER"
        contextData={{
          ...order,
          totalAmount: baseTotal, // Inject calculated base total so modal correctly calculates due
        }}
        onSuccess={() => {
          loadOrder(); // Re-fetch the order data on success
        }}
      />
    </div>
  );
};

export default CorporateOrderView;
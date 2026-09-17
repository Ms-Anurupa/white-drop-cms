/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Package,
  User,
  CreditCard,
  Truck,
  MapPin,
  FileText,
  IndianRupee,
  History,
  Phone,
} from "lucide-react";
import subscriptionStore from "../../zustand/Store/subscriptionStore";
import { resolveFirebaseUrl } from "../../utils/resolveUrl";
import Loader from "@/components/Loader";

// Shared Status Mappings
const STATUS_DOTS = {
  ACTIVE: "bg-emerald-500",
  PENDING: "bg-amber-500",
  PAUSED: "bg-blue-500",
  EXPIRED: "bg-gray-400",
  CANCELLED: "bg-red-500",
};

const PAYMENT_STATUS_STYLES = {
  COMPLETE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  POSTPAID: "bg-purple-50 text-purple-700 border-purple-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  FAILED: "bg-red-50 text-red-700 border-red-200",
  FAILED_AUTH: "bg-red-50 text-red-700 border-red-200",
};

const PAYMENT_STATUS_DOTS = {
  COMPLETE: "bg-emerald-500",
  POSTPAID: "bg-purple-500",
  PENDING: "bg-amber-500",
  FAILED: "bg-red-500",
  FAILED_AUTH: "bg-red-500",
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

const ViewSubscriptionDetails = () => {
  const { subId } = useParams();
  const navigate = useNavigate();
  const getSubdetailsById = subscriptionStore((state) => state.getSubdetailsById);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!subId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const details = await getSubdetailsById(subId);
        setData(details);
      } catch (error) {
        console.error("Failed to fetch subscription details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [subId]);

  if (loading) {
    return <Loader text="Loading subscription details..." />;
  }

  if (!data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50">
        <FileText size={40} className="text-gray-300 mb-4" />
        <p className="text-sm font-medium text-gray-500">Subscription not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const {
    user,
    product,
    variant,
    plan,
    deliverySlot,
    shippingAddress,
    paymentInfo,
    offlinePaymentLogs,
  } = data;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <ScrollbarStyle />

      {/* HEADER */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
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
                {data.subId || "Subscription Details"}
              </h1>
              <StatusPill
                status={data.status}
                styles={{
                  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
                  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
                  PAUSED: "bg-blue-50 text-blue-700 border-blue-200",
                  EXPIRED: "bg-gray-50 text-gray-700 border-gray-200",
                  CANCELLED: "bg-red-50 text-red-700 border-red-200",
                }}
                dots={STATUS_DOTS}
              />
            </div>
            <p className="mt-0.5 text-xs text-gray-500">
              Internal ID: {data.id} • Created on {formatShortDate(data.createdAt, true)}
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="subscription-scroll flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            
            {/* LEFT COLUMN (Wider) */}
            <div className="flex flex-col gap-4 xl:col-span-2">
              
              {/* PRODUCT & PLAN CARD */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Package size={16} className="text-blue-500" />
                  Product & Subscription Plan
                </h2>
                
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image & Core Details */}
                  <div className="flex gap-4 md:w-1/2">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      {product?.product_images?.[0] ? (
                        <img
                          src={resolveFirebaseUrl({
                            folderName: "productImages",
                            fileName: product.product_images[0],
                          })}
                          alt={product?.product_name || "Product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package size={24} className="text-gray-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {product?.product_name || "-"}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-gray-500">
                        Variant: {variant?.quantity} {variant?.unit} ({variant?.package})
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        SKU: {variant?.sku || "-"}
                      </p>
                      <p className="mt-2 text-sm font-bold text-gray-800">
                        {formatCurrency(variant?.price)} / unit
                      </p>
                    </div>
                  </div>

                  <div className="hidden w-px bg-gray-100 md:block" />

                  {/* Plan Overview */}
                  <div className="md:w-1/2 flex flex-col justify-center">
                    <div className="mb-2 inline-flex w-max items-center gap-1.5 rounded bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      <CalendarDays size={12} />
                      {plan?.name || "Custom Plan"}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{plan?.description}</p>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                      <div>
                        <span className="text-gray-400 block mb-0.5">Start Date</span>
                        <span className="font-medium text-gray-800">{formatShortDate(data.startDate)}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Duration</span>
                        <span className="font-medium text-gray-800">{data.durationMonths} Month(s)</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Quantity/Delivery</span>
                        <span className="font-medium text-gray-800">{data.qtyPerDelivery} unit(s)</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block mb-0.5">Delivery Interval</span>
                        <span className="font-medium text-gray-800">Every {data.intervalWeeks} week(s)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DELIVERY SCHEDULE CARD */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <Truck size={16} className="text-blue-500" />
                  Delivery Schedule & Status
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border border-gray-50 bg-gray-50/50 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                      <Clock3 size={14} /> Delivery Slot
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{deliverySlot?.name || "-"}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {deliverySlot?.from} - {deliverySlot?.to}
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-50 bg-gray-50/50 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                      <CalendarDays size={14} /> Selected Days
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {data.selectedDays?.map((day) => (
                        <span key={day} className="rounded bg-white border border-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 shadow-sm">
                          {day.substring(0, 3)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-50 bg-gray-50/50 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                      <Package size={14} /> Fulfillment
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-lg font-bold text-gray-900">{data.totalDeliveries - data.deliveriesRemaining}</span>
                      <span className="text-xs text-gray-500 pb-0.5">/ {data.totalDeliveries} done</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div 
                        className="h-full bg-blue-500 rounded-full" 
                        style={{ width: `${((data.totalDeliveries - data.deliveriesRemaining) / data.totalDeliveries) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* OFFLINE PAYMENT LOGS (If any) */}
              {offlinePaymentLogs?.length > 0 && (
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                      <History size={16} className="text-blue-500" />
                      Payment/Due Logs
                    </h2>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                      {offlinePaymentLogs.length} Records
                    </span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="bg-gray-50/80 text-gray-500">
                        <tr>
                          <th className="px-4 py-2.5 font-medium">Date & Time</th>
                          <th className="px-4 py-2.5 font-medium">Mode</th>
                          <th className="px-4 py-2.5 font-medium text-right">Due Before</th>
                          <th className="px-4 py-2.5 font-medium text-right text-emerald-600">Amount Received</th>
                          <th className="px-4 py-2.5 font-medium text-right">Due After</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {offlinePaymentLogs.map((log) => (
                          <tr key={log.id} className="transition hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-gray-600">{formatShortDate(log.createdAt, true)}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600">
                                {log.paymentMode}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right text-gray-500">{formatCurrency(log.dueBefore)}</td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600">+{formatCurrency(log.paymentRec)}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-800">{formatCurrency(log.dueAfter)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN (Sidebar Info) */}
            <div className="flex flex-col gap-4">
              
              {/* CUSTOMER INFO */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <User size={16} className="text-blue-500" />
                  Customer Details
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Name</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{user?.customer_name || "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Contact</p>
                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-700">
                      <Phone size={13} className="text-gray-400" />
                      {user?.phone_num || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">Shipping Address</p>
                    <div className="mt-1 flex items-start gap-2 text-xs text-gray-600">
                      <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400" />
                      <p className="leading-relaxed">
                        {shippingAddress?.apartment && <span className="block font-medium text-gray-800">{shippingAddress.apartment}</span>}
                        {shippingAddress?.locality || "Address not provided"}
                      </p>
                    </div>
                    {shippingAddress?.addressType && (
                      <span className="ml-5 mt-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                        {shippingAddress.addressType}
                      </span>
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
                  <div className="flex items-center justify-between rounded-lg bg-blue-50/50 p-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Total Amount</p>
                      <p className="mt-0.5 text-xl font-bold text-blue-900">{formatCurrency(data.totalAmount)}</p>
                    </div>
                    <StatusPill
                      status={data.paymentStatus}
                      styles={PAYMENT_STATUS_STYLES}
                      dots={PAYMENT_STATUS_DOTS}
                    />
                  </div>

                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">Payment Mode</span>
                      <span className="font-medium text-gray-800 flex items-center gap-1.5">
                        <CreditCard size={12} className="text-gray-400"/>
                        {data.paymentMode === "PG" ? "Payment Gateway" : data.paymentMode || "-"}
                      </span>
                    </div>

                    {paymentInfo?.paymentMethod && (
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500">Method</span>
                        <span className="font-medium text-gray-800 capitalize">
                          {paymentInfo.paymentMethod}
                        </span>
                      </div>
                    )}

                    {paymentInfo?.txnID && (
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="font-mono text-gray-800 bg-gray-50 px-1 rounded">
                          {paymentInfo.txnID}
                        </span>
                      </div>
                    )}

                    {paymentInfo?.raw?.bank && (
                      <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                        <span className="text-gray-500">Bank / Provider</span>
                        <span className="font-medium text-gray-800">
                          {paymentInfo.raw.bank}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSubscriptionDetails;
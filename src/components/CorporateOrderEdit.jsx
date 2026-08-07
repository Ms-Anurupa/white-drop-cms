import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Loader2,
  Save,
  X,
  CheckCircle2,
  Circle,
  AlertCircle,
  Package,
  IndianRupee,
  FileText,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import Loader from "./Loader";
import corporateDataStore from "../zustand/Store/corporateDataStore";

const DELIVERY_STATUS_STYLES = {
  PLACED: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  PROCESSING: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  INTRANSIT: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  FAILED: "bg-red-50 text-red-700 ring-1 ring-red-100",
  CANCELLED: "bg-gray-100 text-gray-600 ring-1 ring-gray-200",
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
  COMPLETE: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  POSTPAID: "bg-purple-50 text-purple-700 ring-1 ring-purple-100",
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  FAILED: "bg-red-50 text-red-700 ring-1 ring-red-100",
};

const PAYMENT_STATUS_DOT = {
  COMPLETE: "bg-emerald-500",
  POSTPAID: "bg-purple-500",
  PENDING: "bg-amber-500",
  FAILED: "bg-red-500",
};

// Local, scoped keyframes — a soft gradient-glow pulse for the live total
// whenever qty / price changes, and a subtle shimmer for the progress bar.
const StudioStyle = () => (
  <style>{`
    @keyframes totalPulse {
      0%   { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.35); }
      70%  { box-shadow: 0 0 0 14px rgba(99, 102, 241, 0); }
      100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
    }
    .pulse-total { animation: totalPulse 0.7s ease-out; }

    @keyframes shimmer {
      0%   { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .progress-shimmer {
      background-image: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.55) 50%,
        rgba(255,255,255,0) 100%
      );
      background-size: 200% 100%;
      animation: shimmer 1.8s ease-in-out infinite;
    }

    .grid-fade {
      background-image: radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0);
      background-size: 22px 22px;
    }
  `}</style>
);

const REQUIRED_FIELDS = [
  { key: "productName", label: "Product name" },
  { key: "qty", label: "Quantity" },
  { key: "pricePerUnit", label: "Price per unit" },
];

const validateField = (name, value) => {
  switch (name) {
    case "productName":
      return value?.trim() ? "" : "Product name is required";
    case "qty":
      return value && Number(value) > 0 ? "" : "Enter a valid quantity";
    case "pricePerUnit":
      return value && Number(value) > 0 ? "" : "Enter a valid price";
    default:
      return "";
  }
};

const CorporateOrderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const getCorporateOrderById = corporateDataStore(
    (state) => state.getCorporateOrderById,
  );
  const editCorporateOrderAdmin = corporateDataStore(
    (state) => state.editCorporateOrderAdmin,
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [order, setOrder] = useState(null);

  const [corporateData, setCorporateData] = useState({
    productName: "",
    description: "",
    qty: "",
    unit: "L",
    pricePerUnit: "",
    notes: "",
    deliveryStatus: "PROCESSING",
    paymentStatus: "POSTPAID",
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [pulseTotal, setPulseTotal] = useState(false);

  const initialSnapshotRef = useRef(null);
  const prevTotalRef = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const fetchOrderDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const data = await getCorporateOrderById(id);

        if (!isMounted) return;

        if (!data) {
          toast.error("Corporate order not found.");
          navigate("/dashboard/corporate-orders");
          return;
        }

        setOrder(data);

        const orderDetails = data.orderDetails || data.orderItem || {};

        const nextData = {
          productName: orderDetails.productName || "",
          description: orderDetails.description || "",
          qty: orderDetails.qty ?? "",
          unit: orderDetails.unit || "L",
          pricePerUnit: orderDetails.pricePerUnit ?? "",
          notes: orderDetails.notes || "",
          deliveryStatus: data.deliveryStatus || "PROCESSING",
          paymentStatus: data.paymentStatus || "POSTPAID",
        };

        setCorporateData(nextData);
        initialSnapshotRef.current = JSON.stringify(nextData);
        prevTotalRef.current =
          Number(nextData.qty || 0) * Number(nextData.pricePerUnit || 0);
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load corporate order:", err);
          toast.error("Unable to load corporate order details.");
          navigate("/dashboard/corporate-orders");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchOrderDetails();

    return () => {
      isMounted = false;
    };
  }, [id, getCorporateOrderById, navigate]);

  const orderTotal = useMemo(
    () =>
      Number(corporateData.qty || 0) * Number(corporateData.pricePerUnit || 0),
    [corporateData.qty, corporateData.pricePerUnit],
  );

  // pulse the live-total card whenever the computed total actually changes
  useEffect(() => {
    if (prevTotalRef.current === orderTotal) return;
    prevTotalRef.current = orderTotal;
    setPulseTotal(true);
    const t = setTimeout(() => setPulseTotal(false), 700);
    return () => clearTimeout(t);
  }, [orderTotal]);

  const isDirty =
    initialSnapshotRef.current !== null &&
    JSON.stringify(corporateData) !== initialSnapshotRef.current;

  const requiredStatus = REQUIRED_FIELDS.map((f) => ({
    ...f,
    valid: !validateField(f.key, corporateData[f.key]),
  }));
  const completedCount = requiredStatus.filter((f) => f.valid).length;
  const progressPercent = Math.round(
    (completedCount / REQUIRED_FIELDS.length) * 100,
  );
  const allRequiredValid = completedCount === REQUIRED_FIELDS.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCorporateData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      productName: validateField("productName", corporateData.productName),
      qty: validateField("qty", corporateData.qty),
      pricePerUnit: validateField("pricePerUnit", corporateData.pricePerUnit),
    };
    setErrors(newErrors);
    setTouched({ productName: true, qty: true, pricePerUnit: true });

    const firstError = Object.values(newErrors).find(Boolean);
    if (firstError) {
      toast.error(firstError);
      return;
    }

    try {
      setSaving(true);

      const payload = {
        orderDetails: {
          productName: corporateData.productName.trim(),
          description: corporateData.description.trim(),
          qty: Number(corporateData.qty),
          unit: corporateData.unit,
          pricePerUnit: Number(corporateData.pricePerUnit),
          orderTotal:
            Number(corporateData.qty) * Number(corporateData.pricePerUnit),
          notes: corporateData.notes.trim(),
        },
        deliveryStatus: corporateData.deliveryStatus,
        paymentStatus: corporateData.paymentStatus,
      };

      await editCorporateOrderAdmin({
        payload: {
          corpOrderId: id,
          ...payload,
        },
      });

      initialSnapshotRef.current = JSON.stringify(corporateData);
      toast.success("Corporate order updated successfully");
      navigate("/dashboard/corporate-orders");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update corporate order",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader text="Loading corporate order..." />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-screen bg-slate-50 grid-fade"
    >
      <StudioStyle />

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">
        {/* ── HEADER ── */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-10 w-10 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:shadow-sm transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                  Edit Corporate Order
                </h1>
                {order?.orderId && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums">
                    {order.orderId}
                  </span>
                )}
                {isDirty && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-100 px-2.5 py-0.5 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Unsaved changes
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">
                Corporate Orders / Edit Order
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* ── MAIN COLUMN ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Company Details */}
            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/30">
                  <Building2 size={16} />
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Company Details
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Read-only account info
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Business Name
                  </label>
                  <input
                    readOnly
                    value={order?.corpoAcc?.businessName || ""}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">
                    GST Number
                  </label>
                  <input
                    readOnly
                    value={order?.corpoAcc?.gstNo || ""}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Contact Number
                  </label>
                  <input
                    readOnly
                    value={order?.corpoAcc?.contactNo || ""}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 cursor-not-allowed"
                  />
                </div>

                <div className="md:col-span-2 xl:col-span-3">
                  <label className="text-xs font-medium text-slate-500">
                    Address
                  </label>
                  <textarea
                    readOnly
                    rows={2}
                    value={order?.corpoAcc?.address || ""}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 resize-none cursor-not-allowed"
                  />
                </div>
              </div>
            </section>

            {/* Product Details */}
            <section className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                <div className="flex items-center gap-2.5">
                  <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
                    <Package size={16} />
                  </span>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Product Details
                  </h2>
                </div>
                <p className="text-[11px] text-slate-400">
                  Fields marked{" "}
                  <span className="text-red-500 font-semibold">*</span> are
                  required
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-5">
                <div className="xl:col-span-3">
                  <FieldLabel required>Product Name</FieldLabel>
                  <input
                    type="text"
                    name="productName"
                    value={corporateData.productName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass(
                      touched.productName && errors.productName,
                    )}
                    placeholder="e.g. Fresh Full Cream Milk"
                  />
                  <FieldError
                    message={touched.productName && errors.productName}
                  />
                </div>

                <div>
                  <FieldLabel required>Quantity</FieldLabel>
                  <input
                    type="number"
                    min={1}
                    name="qty"
                    value={corporateData.qty}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass(touched.qty && errors.qty)}
                  />
                  <FieldError message={touched.qty && errors.qty} />
                </div>

                <div>
                  <FieldLabel>Unit</FieldLabel>
                  <select
                    name="unit"
                    value={corporateData.unit}
                    onChange={handleChange}
                    className={inputClass(false, true)}
                  >
                    <option value="L">Litre</option>
                    <option value="Kg">Kg</option>
                    <option value="Packet">Packet</option>
                    <option value="Piece">Piece</option>
                  </select>
                </div>

                <div>
                  <FieldLabel required>Price Per Unit</FieldLabel>
                  <div className="relative">
                    <IndianRupee
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min={0}
                      name="pricePerUnit"
                      value={corporateData.pricePerUnit}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`${inputClass(
                        touched.pricePerUnit && errors.pricePerUnit,
                      )} pl-8`}
                    />
                  </div>
                  <FieldError
                    message={touched.pricePerUnit && errors.pricePerUnit}
                  />
                </div>

                <div>
                  <FieldLabel>Delivery Status</FieldLabel>
                  <select
                    name="deliveryStatus"
                    value={corporateData.deliveryStatus}
                    onChange={handleChange}
                    className={inputClass(false, true)}
                  >
                    <option value="PLACED">Placed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="INTRANSIT">In Transit</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="FAILED">Failed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <FieldLabel>Payment Status</FieldLabel>
                  <select
                    name="paymentStatus"
                    value={corporateData.paymentStatus}
                    onChange={handleChange}
                    className={inputClass(false, true)}
                  >
                    <option value="COMPLETE">Complete</option>
                    <option value="POSTPAID">Postpaid</option>
                    <option value="PENDING">Pending</option>
                    <option value="FAILED">Failed</option>
                  </select>
                </div>

                <div className="xl:col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={13} className="text-slate-400" />
                    <FieldLabel noMargin>Description</FieldLabel>
                  </div>
                  <textarea
                    rows={3}
                    name="description"
                    value={corporateData.description}
                    onChange={handleChange}
                    className={`${inputClass(false)} resize-none`}
                  />
                </div>

                <div className="xl:col-span-3">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList size={13} className="text-slate-400" />
                    <FieldLabel noMargin>Notes</FieldLabel>
                  </div>
                  <textarea
                    rows={3}
                    name="notes"
                    value={corporateData.notes}
                    onChange={handleChange}
                    className={`${inputClass(false)} resize-none`}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ── STICKY INTELLIGENT SUMMARY RAIL ── */}
          <aside className="lg:col-span-1 lg:sticky lg:top-5 space-y-5">
            {/* completion tracker */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-500" />
                  <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">
                    Order readiness
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">
                  {completedCount}/{REQUIRED_FIELDS.length}
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full relative overflow-hidden transition-all duration-500 ease-out ${
                    allRequiredValid
                      ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                      : "bg-gradient-to-r from-blue-500 to-indigo-500"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                >
                  {!allRequiredValid && (
                    <span className="absolute inset-0 progress-shimmer" />
                  )}
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {requiredStatus.map((f) => (
                  <li
                    key={f.key}
                    className="flex items-center gap-2 text-xs text-slate-600"
                  >
                    {f.valid ? (
                      <CheckCircle2
                        size={15}
                        className="text-emerald-500 shrink-0"
                      />
                    ) : (
                      <Circle size={15} className="text-slate-300 shrink-0" />
                    )}
                    <span
                      className={f.valid ? "text-slate-700" : "text-slate-400"}
                    >
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* live order total */}
            <div className="rounded-2xl p-[1px] bg-gradient-to-br from-blue-400 via-indigo-500 to-cyan-400 shadow-sm">
              <div
                className={`rounded-2xl bg-white p-5 ${pulseTotal ? "pulse-total" : ""}`}
              >
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                  Live order total
                </p>
                <p className="mt-1.5 text-3xl font-bold text-slate-900 tabular-nums">
                  ₹{orderTotal.toLocaleString("en-IN")}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {corporateData.qty || 0} {corporateData.unit} × ₹
                  {corporateData.pricePerUnit || 0}/{corporateData.unit}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <StatusChip
                    label={corporateData.deliveryStatus}
                    styles={DELIVERY_STATUS_STYLES}
                    dots={DELIVERY_STATUS_DOT}
                  />
                  <StatusChip
                    label={corporateData.paymentStatus}
                    styles={PAYMENT_STATUS_STYLES}
                    dots={PAYMENT_STATUS_DOT}
                  />
                </div>
              </div>
            </div>

            {/* actions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-2.5">
              <button
                type="submit"
                disabled={saving}
                className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition disabled:opacity-60 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Update Order
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
                className="w-full inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <X size={16} />
                Cancel
              </button>

              {!allRequiredValid && (
                <p className="flex items-start gap-1.5 text-[11px] text-amber-600 pt-1">
                  <AlertCircle size={13} className="shrink-0 mt-0.5" />
                  Complete all required fields before saving.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </form>
  );
};

// ── small presentational helpers ──

const inputClass = (hasError, isSelect = false) =>
  `w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
    hasError
      ? "border-red-300 focus:ring-red-500/20 focus:border-red-400"
      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-400"
  } ${isSelect ? "bg-white cursor-pointer" : "bg-white"}`;

const FieldLabel = ({ children, required, noMargin }) => (
  <label
    className={`block text-sm font-medium text-slate-700 ${noMargin ? "" : "mb-2"}`}
  >
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-red-500">
      <AlertCircle size={11} />
      {message}
    </p>
  ) : null;

const StatusChip = ({ label, styles, dots }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${
      styles[label] || "bg-gray-100 text-gray-700"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${dots[label] || "bg-gray-400"}`}
    />
    {label || "UNKNOWN"}
  </span>
);

export default CorporateOrderEdit;

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, FileText } from "lucide-react";
import corporateDataStore from "../zustand/Store/corporateDataStore";
import Loader from "./Loader";

const DELIVERY_STATUS_STYLES = {
  PLACED: "bg-blue-50 text-blue-700",
  PROCESSING: "bg-amber-50 text-amber-700",
  INTRANSIT: "bg-indigo-50 text-indigo-700",
  DELIVERED: "bg-emerald-50 text-emerald-700",
  FAILED: "bg-red-50 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

const PAYMENT_STATUS_STYLES = {
  COMPLETE: "bg-emerald-50 text-emerald-700",
  POSTPAID: "bg-purple-50 text-purple-700",
  PENDING: "bg-amber-50 text-amber-700",
  FAILED: "bg-red-50 text-red-700",
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
      {label}
    </span>
    <span className="text-sm font-medium text-gray-800 break-words">
      {value || "-"}
    </span>
  </div>
);

const StatusBadge = ({ status, styles }) => (
  <span
    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
      styles[status] || "bg-gray-100 text-gray-700"
    }`}
  >
    {status}
  </span>
);

const CorporateOrderView = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const getCorporateOrderById = corporateDataStore(
    (state) => state.getCorporateOrderById,
  );

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = async () => {
    try {
      setLoading(true);

      const response = await getCorporateOrderById(id);

      setOrder(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  if (loading) {
    return <Loader text="Loading corporate order..." />;
  }

  if (!order) {
    return (
      <div className="p-10 text-center">
        <button
          onClick={() => navigate(-1)}
          className="h-10 w-10 cursor-pointer rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
        </button>
        <p className="text-gray-500">Corporate order not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-6 space-y-6">
      {/* Header */}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Corporate Order Details
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              View complete order information
            </p>
          </div>
        </div>
      </div>

      {/* Order Summary */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="text-blue-600" size={20} />
          <h2 className="font-semibold text-lg text-gray-900">Order Summary</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <InfoRow label="Order ID" value={order.orderId} />

          <InfoRow label="Created At" value={formatDate(order.createdAt)} />

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Delivery Status
            </span>

            <div className="mt-2">
              <StatusBadge
                status={order.deliveryStatus}
                styles={DELIVERY_STATUS_STYLES}
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Payment Status
            </span>

            <div className="mt-2">
              <StatusBadge
                status={order.paymentStatus}
                styles={PAYMENT_STATUS_STYLES}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Company Details */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="text-blue-600" size={20} />

          <h2 className="font-semibold text-lg text-gray-900">
            Company Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <InfoRow label="Business Name" value={order.corpoAcc?.businessName} />

          <InfoRow label="GST Number" value={order.corpoAcc?.gstNo} />

          <InfoRow label="Contact Number" value={order.corpoAcc?.contactNo} />

          <InfoRow label="Address" value={order.corpoAcc?.address} />

          <InfoRow
            label="Landmark"
            value={order.corpoAcc?.location?.landmark}
          />

          <InfoRow label="Account Status" value={order.corpoAcc?.status} />
        </div>
      </div>
      {/* Product Details */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="text-blue-600" size={20} />

          <h2 className="font-semibold text-lg text-gray-900">
            Product Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <InfoRow
            label="Product Name"
            value={order.orderDetails?.productName}
          />

          <InfoRow
            label="Quantity"
            value={`${order.orderDetails?.qty} ${order.orderDetails?.unit}`}
          />

          <InfoRow
            label="Price Per Unit"
            value={formatCurrency(order.orderDetails?.pricePerUnit)}
          />

          <InfoRow
            label="Order Total"
            value={formatCurrency(order.orderDetails?.orderTotal)}
          />

          <InfoRow
            label="Description"
            value={order.orderDetails?.description}
          />
        </div>

        <div className="mt-6">
          <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Notes
          </span>

          <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm leading-6 text-gray-700">
              {order.orderDetails?.notes || "No notes added."}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice */}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <FileText className="text-blue-600" size={20} />

          <h2 className="font-semibold text-lg text-gray-900">Invoice</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.open(order.signedUrl, "_blank")}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            View Invoice
          </button>

          <button
            onClick={async () => {
              const response = await fetch(order.signedUrl);
              const blob = await response.blob();

              const url = window.URL.createObjectURL(blob);

              const a = document.createElement("a");
              a.href = url;
              a.download = `${order.orderId}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();

              window.URL.revokeObjectURL(url);
            }}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateOrderView;

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Loader2, Save, X } from "lucide-react";
import { toast } from "react-toastify";
import Loader from "./Loader";
import corporateDataStore from "../zustand/Store/corporateDataStore";

const CorporateOrderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Selector optimization: pick state actions cleanly
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

  useEffect(() => {
    let isMounted = true;

    const fetchOrderDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch data from Zustand (Ensure store action makes an API call if store is empty)
        const data = await getCorporateOrderById(id);

        if (!isMounted) return;

        if (!data) {
          toast.error("Corporate order not found.");
          navigate("/dashboard/corporate-orders");
          return;
        }

        setOrder(data);

        // Safely extract nested structures
        const orderDetails = data.orderDetails || data.orderItem || {};

        setCorporateData({
          productName: orderDetails.productName || "",
          description: orderDetails.description || "",
          qty: orderDetails.qty ?? "",
          unit: orderDetails.unit || "L",
          pricePerUnit: orderDetails.pricePerUnit ?? "",
          notes: orderDetails.notes || "",
          deliveryStatus: data.deliveryStatus || "PROCESSING",
          paymentStatus: data.paymentStatus || "POSTPAID",
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCorporateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!corporateData.productName.trim()) {
      return toast.error("Product name is required");
    }

    if (!corporateData.qty || Number(corporateData.qty) <= 0) {
      return toast.error("Enter a valid quantity");
    }

    if (
      !corporateData.pricePerUnit ||
      Number(corporateData.pricePerUnit) <= 0
    ) {
      return toast.error("Enter a valid price");
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
      className="bg-gray-50 min-h-screen p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="h-10 w-10 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Edit Corporate Order
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Update corporate order details
            </p>
          </div>
        </div>
      </div>

      {/* Company Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <Building2 size={20} className="text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Company Details
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Business Name
            </label>
            <input
              readOnly
              value={order?.corpoAcc?.businessName || ""}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">
              GST Number
            </label>
            <input
              readOnly
              value={order?.corpoAcc?.gstNo || ""}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">
              Contact Number
            </label>
            <input
              readOnly
              value={order?.corpoAcc?.contactNo || ""}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className="text-xs font-medium text-gray-500">Address</label>
            <textarea
              readOnly
              rows={3}
              value={order?.corpoAcc?.address || ""}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Product Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={corporateData.productName}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min={1}
              name="qty"
              value={corporateData.qty}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit
            </label>
            <select
              name="unit"
              value={corporateData.unit}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="L">Litre</option>
              <option value="Kg">Kg</option>
              <option value="Packet">Packet</option>
              <option value="Piece">Piece</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Per Unit
            </label>
            <input
              type="number"
              min={0}
              name="pricePerUnit"
              value={corporateData.pricePerUnit}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Order Total
            </label>
            <input
              readOnly
              value={`₹ ${(
                Number(corporateData.qty || 0) *
                Number(corporateData.pricePerUnit || 0)
              ).toLocaleString("en-IN")}`}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-green-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Delivery Status
            </label>
            <select
              name="deliveryStatus"
              value={corporateData.deliveryStatus}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              name="paymentStatus"
              value={corporateData.paymentStatus}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="COMPLETE">Complete</option>
              <option value="POSTPAID">Postpaid</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <div className="xl:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={4}
              name="description"
              value={corporateData.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="xl:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              rows={4}
              name="notes"
              value={corporateData.notes}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
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
        </div>
      </div>
    </form>
  );
};

export default CorporateOrderEdit;

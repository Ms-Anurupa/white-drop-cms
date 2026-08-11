/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Package,
  FileText,
  IndianRupee,
  StickyNote,
  ShoppingCart,
  AlertTriangle,
  Building2,
  Boxes,
} from "lucide-react";
import corporateDataStore from "../zustand/Store/corporateDataStore";
import { toast } from "react-toastify";

const units = ["L", "mL", "Kg", "g"];

const CreateCorporateOrder = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const createCorporateOrderAdmin = corporateDataStore(
    (state) => state.createCorporateOrderAdmin,
  );
  const [corporateData, setCorporateData] = useState({
    corpoAccId: "",
    productName: "",
    description: "",
    unit: "L",
    qty: "",
    pricePerUnit: "",
    orderTotal: 0,
    notes: "",
  });
  const getCorporateAccounts = corporateDataStore(
    (state) => state.getCorporateAccounts,
  );

  const corporateOrderAcc = corporateDataStore(
    (state) => state.corporateOrderAcc,
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  useEffect(() => {
    getCorporateAccounts({
      search,
      status,
      page,
      limit,
    });
  }, [getCorporateAccounts, search, status, page]);

  useEffect(() => {
    console.log(corporateOrderAcc);
  }, [corporateOrderAcc]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCorporateData((prev) => {
      const updated = {
        ...prev,
        [name]: name === "qty" || name === "pricePerUnit" ? value : value,
      };

      updated.orderTotal =
        (Number(updated.qty) || 0) * (Number(updated.pricePerUnit) || 0);

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!corporateData.corpoAccId) {
      toast.error("Please select a corporate account.");
      return;
    }

    if (!corporateData.productName.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!corporateData.description.trim()) {
      toast.error("Description is required.");
      return;
    }

    if (!corporateData.unit) {
      toast.error("Please select a unit.");
      return;
    }

    if (!corporateData.qty || Number(corporateData.qty) <= 0) {
      toast.error("Quantity must be greater than 0.");
      return;
    }

    if (!Number.isInteger(Number(corporateData.qty))) {
      toast.error("Quantity must be a whole number.");
      return;
    }

    if (
      !corporateData.pricePerUnit ||
      Number(corporateData.pricePerUnit) <= 0
    ) {
      toast.error("Price per unit must be greater than 0.");
      return;
    }

    if (!corporateData.notes.trim()) {
      toast.error("Delivery notes are required.");
      return;
    }

    setLoading(true);

    const payload = {
      corpoAccId: corporateData.corpoAccId,
      orderDetails: {
        productName: corporateData.productName,
        description: corporateData.description,
        unit: corporateData.unit,
        qty: Number(corporateData.qty),
        pricePerUnit: Number(corporateData.pricePerUnit),
        orderTotal:
          Number(corporateData.qty) * Number(corporateData.pricePerUnit),
        notes: corporateData.notes,
      },
    };
    await createCorporateOrderAdmin(payload);

    navigate(-1);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition mb-6 cursor-pointer group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Corporate Orders
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-2 pb-2 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShoppingCart size={20} className="text-blue-600" />
              </div>

              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Create Corporate Order
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Add a new corporate purchase order
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-4 space-y-2">
            {/* Warning */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
              <AlertTriangle
                size={16}
                className="text-amber-500 mt-0.5 shrink-0"
              />
              <p className="text-xs text-amber-800 leading-relaxed">
                Verify the quantity and pricing before creating the order.
              </p>
            </div>

            {/* Corporate Account / Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Corporate Account */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Corporate Account
                </label>

                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    name="corpoAccId"
                    value={corporateData.corpoAccId}
                    onChange={handleChange}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Corporate Account</option>

                    {corporateOrderAcc?.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.businessName}
                      </option>
                    ))}
                  </select>

                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Address
                </label>

                <textarea
                  placeholder="Please select the Corporate Account to see the address"
                  rows={2}
                  readOnly
                  value={
                    corporateOrderAcc?.find(
                      (acc) => acc.id === corporateData.corpoAccId,
                    )?.address || ""
                  }
                  className="w-full pl-2 pr-2 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none"
                />
              </div>
            </div>

            {/* Product Name / Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Product Name
                </label>

                <div className="relative">
                  <Package
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    required
                    placeholder="Add Product Name"
                    name="productName"
                    value={corporateData.productName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Description
                </label>

                <div className="relative">
                  <FileText
                    size={16}
                    className="absolute left-3 top-3 text-gray-400"
                  />

                  <textarea
                    required
                    rows={2}
                    placeholder="Add Product Description"
                    name="description"
                    value={corporateData.description}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
              </div>
            </div>

            {/* Unit / Qty */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Unit
                </label>

                <div className="relative">
                  <Package
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />

                  <select
                    required
                    name="unit"
                    value={corporateData.unit}
                    onChange={handleChange}
                    className="w-full appearance-none pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm outline-none bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition cursor-pointer"
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>

                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Quantity
                </label>

                <div className="relative">
                  <Boxes
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    placeholder="Enter quantity"
                    name="qty"
                    value={corporateData.qty}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Price / Total */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Price Per Unit
                </label>

                <div className="relative">
                  <IndianRupee
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="number"
                    placeholder="Enter price"
                    name="pricePerUnit"
                    value={corporateData.pricePerUnit}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                  Order Total
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-slate-50 px-3 py-2.5">
                  <IndianRupee size={16} className="text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">
                    {corporateData.orderTotal || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
                Delivery Notes
              </label>

              <div className="relative">
                <StickyNote
                  size={16}
                  className="absolute left-3 top-4 text-gray-400"
                />

                <textarea
                  required
                  placeholder="Add Delivery Notes"
                  rows={4}
                  name="notes"
                  value={corporateData.notes}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none resize-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 cursor-pointer rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-sm shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60 transition"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}

                {loading ? "Creating..." : "Create Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCorporateOrder;

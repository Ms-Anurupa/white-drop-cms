/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { X, PackagePlus, Calculator } from "lucide-react";
import { toast } from "react-toastify";
import orderDataStore from "@/zustand/Store/orderDataStore";

const AddOrderItemModal = ({ isOpen, onClose, orderId, onSuccess, unitValue, minOrderDate }) => {
  const [loading, setLoading] = useState(false);
  const addCorporateOrderItem = orderDataStore(
    (state) => state.addCorporateOrderItem
  );

  const [formData, setFormData] = useState({
    qty: "",
    unit: unitValue || "L",
    orderDate: "",
    pricePerUnit: "",
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        qty: "",
        unit: unitValue || "L", // Enforce passed unitValue
        orderDate: "",
        pricePerUnit: "",
      });
    }
  }, [isOpen, unitValue]);

  if (!isOpen) return null;

  // Calculate derived total
  const calculatedTotal =
    (parseFloat(formData.qty) || 0) * (parseFloat(formData.pricePerUnit) || 0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Prevent negative values for qty and price
    if ((name === "qty" || name === "pricePerUnit") && value !== "" && Number(value) < 0) {
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.qty || !formData.orderDate || !formData.pricePerUnit) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (parseFloat(formData.qty) <= 0) {
      toast.error("Quantity must be greater than zero.");
      return;
    }

    try {
      setLoading(true);

      // Construct payload to match Zod schema
      const payload = {
        id: orderId,
        newItem: {
          qty: parseFloat(formData.qty),
          unit: formData.unit,
          // Convert the date string (YYYY-MM-DD) to ISO string for the backend
          orderDate: new Date(formData.orderDate).toISOString(),
          pricePerUnit: parseFloat(formData.pricePerUnit),
          itemTotalPrice: calculatedTotal,
        },
      };

      // Use the Zustand store method instead of fetch
      await addCorporateOrderItem(payload);

      toast.success("New item added successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-2xl bg-white shadow-xl duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2 text-gray-800">
            <PackagePlus size={20} className="text-blue-500" />
            <h2 className="text-base font-semibold">Add New Item Line</h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Order Date (Changed to type="date") */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                Order Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="orderDate"
                min={minOrderDate ? minOrderDate.split("T")[0] : undefined}
                value={formData.orderDate}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Quantity */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="qty"
                  min="0.1"
                  step="0.1"
                  value={formData.qty}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. 45"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Unit (Made Read-Only) */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-gray-700">
                  Unit <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="unit"
                  value={formData.unit}
                  readOnly
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Price Per Unit */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">
                Price Per Unit (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="pricePerUnit"
                min="0"
                step="0.01"
                value={formData.pricePerUnit}
                onChange={handleInputChange}
                required
                placeholder="e.g. 70"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Auto-calculated Total */}
            <div className="mt-2 flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 p-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <Calculator size={16} />
                <span className="text-xs font-medium uppercase tracking-wider">
                  Item Total Price
                </span>
              </div>
              <span className="text-base font-bold text-emerald-700">
                ₹{calculatedTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Adding..." : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderItemModal;
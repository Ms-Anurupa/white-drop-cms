import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import OfflineSelectionBlock from "@/components/OflineOrderSubSelections/OfflineSelectionBlock";
import offlineOrderStore from "@/zustand/Store/offlineOrderStore";
import { ArrowLeft } from "lucide-react";

const AddOfflineOrder = () => {
  const navigate = useNavigate();
  const { createOfflineOrder } = offlineOrderStore();
  
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectionChange = useCallback((data) => {
    setFormData(data);
  }, []);

  const handleSubmit = async () => {
    // 1. Validation before sending to the backend
    if (!formData?.userUid || !formData?.addressId) {
      toast.error("Please select a customer and an address.");
      return;
    }
    if (!formData?.deliveryDate || !formData?.deliverySlotId) {
      toast.error("Please select a delivery date and slot.");
      return;
    }
    if (!formData?.cart || formData.cart.length === 0) {
      toast.error("Please add at least one item to the cart.");
      return;
    }

    try {
      setLoading(true);
      
      // Calculate total on the frontend just to pass it to the payload
      const orderTotal = formData.cart.reduce(
        (sum, c) => sum + c.item.price * c.qty, 
        0
      );

      const payload = {
        userUid: formData.userUid,
        addressId: formData.addressId,
        deliverySlotId: formData.deliverySlotId,
        deliveryDate: new Date(formData.deliveryDate).toISOString(),
        orderTotal: orderTotal,
        cart: formData.cart
      };

      const res = await createOfflineOrder(payload);
      
      if (res.success) {
        toast.success("Offline Order created successfully!");
        navigate("/dashboard/orders"); // Send them back to the main orders list
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-full">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* HEADER */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Create Offline Order
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Build the cart and assign delivery slots for offline customers.
          </p>
        </div>

        {/* THE MODULAR SELECTION BLOCK */}
        <OfflineSelectionBlock 
          mode="order" 
          onChange={handleSelectionChange}
        />

        {/* SUBMIT ACTION ROW */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSubmit}
            disabled={loading || !formData?.cart?.length}
            className="px-8 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
          >
            {loading ? (
              "Processing..."
            ) : (
              "Place Offline Order"
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddOfflineOrder;
import { Hammer } from "lucide-react";

const AddOfflineOrder = () => {
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-full">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* HEADER */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
            Create Offline Order
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Build the cart and assign delivery slots for offline customers.
          </p>
        </div>

        {/* PLACEHOLDER CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <Hammer className="text-blue-600" size={32} />
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Order Creation Coming Soon</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            This module is currently under construction. You will be able to search for a customer, select products, manage the cart, and assign delivery dates here.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AddOfflineOrder;
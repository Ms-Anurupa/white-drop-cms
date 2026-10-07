import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import OfflineAddressForm from "./OfflineAddressForm"; 

const AddCustomerAddress = () => {
  const navigate = useNavigate();
  const { userUid } = useParams();

  return (
    // 1. Outermost container (background color and viewport height)
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-full">
      
      {/* 2. CENTERING WRAPPER: Limits max width and centers it horizontally */}
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-white rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm cursor-pointer"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Add Customer Address</h1>
            <p className="text-sm text-gray-500 mt-1">Pinpoint a new delivery location for this customer.</p>
          </div>
        </div>

        {/* FORM CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full p-6 sm:p-8">
           <OfflineAddressForm 
              userUid={userUid} 
              showSkip={false} 
              onSuccess={() => navigate(-1)} 
           />
        </div>

      </div>
    </div>
  );
};

export default AddCustomerAddress;
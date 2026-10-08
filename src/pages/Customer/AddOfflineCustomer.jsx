import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { User, Phone, MapPin, CheckCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import Loader from "../../components/Loader";
import OfflineAddressForm from "@/components/OfflineAddressForm";
import offlineOrderStore from "@/zustand/Store/offlineOrderStore";

const AddOfflineCustomer = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const createOfflineCustomer = offlineOrderStore((state) => state.createOfflineCustomer);
  const selectedCustomer = offlineOrderStore((state) => state.selectedCustomer);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await createOfflineCustomer({ customer_name: name, phone_num: phone });
      if (res.success) setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create customer.");
    } finally {
      setLoading(false);
    }
  };

  const proceedToOrder = () => navigate("/dashboard/orders/create-offline");

  if (loading) return <Loader text="Creating customer..." />;

  return (
    // 1. We keep the gray background but remove the arbitrary space-y-6 here
    <div className="px-4 py-6 sm:px-6 lg:px-8 bg-gray-50 min-h-full">
      
      {/* 2. THE CENTERING WRAPPER: Limits max width and centers it horizontally */}
      <div className="max-w-5xl mx-auto w-full space-y-6">
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
        {/* HEADER */}
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">Add Offline Customer</h1>
          <p className="text-sm text-gray-500 mt-1">Create a shadow account for call-in orders.</p>
        </div>

        {/* STEPPER */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={`flex items-center gap-1.5 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}>
            <CheckCircle2 size={18} /> Basic Info
          </span>
          <ChevronRight size={16} className="text-gray-300" />
          <span className={`flex items-center gap-1.5 ${step >= 2 ? "text-blue-600" : "text-gray-400"}`}>
            <MapPin size={18} /> Delivery Address
          </span>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
          
          {step === 1 && (
            // 3. CENTERED FORM CONTENT: Added `mx-auto` here so it sits in the middle of the white card
            <form onSubmit={handleCreateUser} className="p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9876543210"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-50">
                <button type="submit" className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer">
                  Create & Continue
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="p-6 sm:p-8">
              <OfflineAddressForm 
                userUid={selectedCustomer?.userUid} 
                showSkip={true}
                onSkip={proceedToOrder}
                onSuccess={proceedToOrder} 
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddOfflineCustomer;
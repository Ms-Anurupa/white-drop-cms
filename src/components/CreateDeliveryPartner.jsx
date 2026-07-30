import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, User, Phone } from "lucide-react";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";


export default function CreateDeliveryPartner() {
  const navigate = useNavigate();
  const creating = deliveryPartnerStore((s) => s.creating);
  const createError = deliveryPartnerStore((s) => s.createError);
  const createDeliveryAccount = deliveryPartnerStore(
    (s) => s.createDeliveryAccount,
  );

  const [phoneNo, setPhoneNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNo.trim()) return;

    const result = await createDeliveryAccount({
      phoneNo: phoneNo.trim(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    });

    if (result.success) {
      navigate("/dashboard/deliveryPartners");
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition mb-6 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back to Delivery Partners
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">
          Add Delivery Partner
        </h1>
        <p className="text-x4 text-gray-500 mt-1 mb-6">
          Create a new rider account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-x4 text-red-500 mb-3">
              Double check before submitting this number becomes the partner's
              login ID.
            </p>
            <label className="text-x6 font-medium text-gray-700 mb-1 block">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                required
                value={phoneNo}
                onChange={(e) => setPhoneNo(e.target.value)}
                placeholder="+919876543210"
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-x6 font-medium text-gray-700 mb-1 block">
                First Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Rahul"
                  className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-x6 font-medium text-gray-700 mb-1 block">
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Sharma"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition"
              />
            </div>
          </div>

          {createError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {createError}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
            >
              {creating && <Loader2 size={16} className="animate-spin" />}
              {creating ? "Creating..." : "Create Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

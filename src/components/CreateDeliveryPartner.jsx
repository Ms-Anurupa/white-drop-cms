import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  User,
  Phone,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
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
    <div className="min-h-screen bg-gray-50/50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition mb-6 cursor-pointer group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Delivery Partners
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <UserPlus size={20} className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">
                  Add Delivery Partner
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Create a new rider account
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-6 space-y-5">
            {/* Warning banner */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
              <AlertTriangle
                size={16}
                className="text-amber-500 mt-0.5 shrink-0"
              />
              <p className="text-xs text-amber-800 leading-relaxed">
                Double-check the phone number before submitting — it becomes the
                partner's login ID and can't be changed easily afterward.
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1.5 block">
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
              <p className="text-[11px] text-gray-400 mt-1.5">
                Must include country code (E.164 format), e.g. +91XXXXXXXXXX
              </p>
            </div>

            {/* Name fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
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
                <label className="text-xs font-medium text-gray-700 mb-1.5 block">
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
              <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3.5 py-2.5">
                {createError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-50 mt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-sm shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {creating && <Loader2 size={16} className="animate-spin" />}
                {creating ? "Creating..." : "Create Partner"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

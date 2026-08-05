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

const CreateCorporateAccount = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const createCorporateAccount = corporateDataStore(
    (state) => state.createCorporateAccount,
  );
  const [corporateData, setCorporateData] = useState({
    accountId: "",
    businessName: "",
    gstNo: "",
    address: "",
    contactNo: "",
    location: {
      lat: "",
      lng: "",
      landmark: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setCorporateData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;

    setCorporateData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: name === "lat" || name === "lng" ? value : value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!corporateData.accountId.trim()) {
      toast.error("Account ID is required.");
      return;
    }

    if (!corporateData.businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }

    if (!corporateData.gstNo.trim()) {
      toast.error("GST number is required.");
      return;
    }

    if (!corporateData.address.trim()) {
      toast.error("Address is required.");
      return;
    }

    if (!corporateData.contactNo.trim()) {
      toast.error("Contact number is required.");
      return;
    }

    setLoading(true);

    const payload = {
      accountId: corporateData.accountId,
      businessName: corporateData.businessName,
      gstNo: corporateData.gstNo,
      address: corporateData.address,
      contactNo: corporateData.contactNo,
      location: {
        lat: Number(corporateData.location.lat),
        lng: Number(corporateData.location.lng),
        landmark: corporateData.location.landmark,
      },
    };
    await createCorporateAccount(payload);

    navigate(-1);

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition mb-6 cursor-pointer group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Back to Corporate accounts list
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
                  Create Corporate Account
                </h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  Add a new corporate account
                </p>
              </div>
            </div>
          </div>

          <div className="px-4">
            {/* Warning */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
              <AlertTriangle
                size={16}
                className="text-amber-500 mt-0.5 shrink-0"
              />
              <p className="text-xs text-amber-800 leading-relaxed">
                Please verify all corporate account information before creating
                the account.
              </p>
            </div>

            {/* Account ID & Business Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Account ID
                </label>

                <input
                  name="accountId"
                  value={corporateData.accountId}
                  onChange={handleChange}
                  placeholder="Enter Account ID"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Business Name
                </label>

                <div className="relative">
                  <Building2
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    name="businessName"
                    value={corporateData.businessName}
                    onChange={handleChange}
                    placeholder="Enter Business Name"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                  />
                </div>
              </div>
            </div>

            {/* GST & Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  GST Number
                </label>

                <input
                  name="gstNo"
                  value={corporateData.gstNo}
                  onChange={handleChange}
                  placeholder="Enter GST Number"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Contact Number
                </label>

                <input
                  name="contactNo"
                  value={corporateData.contactNo}
                  onChange={handleChange}
                  placeholder="Enter Contact Number"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Address
              </label>

              <textarea
                rows={3}
                name="address"
                value={corporateData.address}
                onChange={handleChange}
                placeholder="Enter Complete Address"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Latitude
                </label>

                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={corporateData.location.lat}
                  onChange={handleLocationChange}
                  placeholder="22.5726"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Longitude
                </label>

                <input
                  type="number"
                  step="any"
                  name="lng"
                  value={corporateData.location.lng}
                  onChange={handleLocationChange}
                  placeholder="88.3639"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Landmark
                </label>

                <input
                  name="landmark"
                  value={corporateData.location.landmark}
                  onChange={handleLocationChange}
                  placeholder="Nearby Landmark"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium shadow-sm shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60 transition cursor-pointer"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Creating..." : "Create Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCorporateAccount;

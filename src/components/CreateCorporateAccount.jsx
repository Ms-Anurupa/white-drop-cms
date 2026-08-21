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
    businessName: "",
    gstNo: "",
    contactNo: "",
    addressDetails: {
      houseNo: "",
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
    },
    location: {
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
        [name]: value,
      },
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setCorporateData((prev) => ({
      ...prev,
      addressDetails: {
        ...prev.addressDetails,
        [name]: value,
      },
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const {
    businessName,
    gstNo,
    contactNo,
    addressDetails,
    location,
  } = corporateData;

  const {
    houseNo,
    street,
    area,
    city,
    state,
    pincode,
  } = addressDetails;

  // Business Name
  if (!businessName.trim()) {
    toast.error("Business name is required.");
    return;
  }

  // GST Number
  if (!gstNo.trim()) {
    toast.error("GST number is required.");
    return;
  }

  // Contact Number
  if (!contactNo.trim()) {
    toast.error("Contact number is required.");
    return;
  }

  // House / Flat No.
  if (!houseNo.trim()) {
    toast.error("House / Flat number is required.");
    return;
  }

  // Street / Road
  if (!street.trim()) {
    toast.error("Street / Road is required.");
    return;
  }

  // Area / Locality
  if (!area.trim()) {
    toast.error("Area / Locality is required.");
    return;
  }

  // City
  if (!city.trim()) {
    toast.error("City is required.");
    return;
  }

  // State
  if (!state.trim()) {
    toast.error("State is required.");
    return;
  }

  // Pincode
  if (!pincode.trim()) {
    toast.error("Pincode is required.");
    return;
  }

  // Landmark
  if (!location.landmark.trim()) {
    toast.error("Landmark is required.");
    return;
  }

  const address = [
    houseNo,
    street,
    area,
    city,
    state,
    pincode,
  ]
    .map((value) => value.trim())
    .join(", ");

  setLoading(true);

  try {
    const payload = {
      businessName: businessName.trim(),
      gstNo: gstNo.trim(),
      contactNo: contactNo.trim(),
      address,
      location: {
        landmark: location.landmark.trim(),
      },
    };

    await createCorporateAccount(payload);

    navigate(-1);
  } catch (error) {
    console.error("Failed to create corporate account:", error);
    toast.error("Failed to create corporate account.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50/50 p-6">
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

          <div className="p-4">
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
            {/* Address */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700">
                    House / Flat No.
                  </label>

                  <input
                    name="houseNo"
                    value={corporateData.addressDetails.houseNo}
                    onChange={handleAddressChange}
                    placeholder="Flat 3A"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700">
                    Street / Road
                  </label>

                  <input
                    name="street"
                    value={corporateData.addressDetails.street}
                    onChange={handleAddressChange}
                    placeholder="MG Road"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-gray-700">
                  Area / Locality
                </label>

                <input
                  name="area"
                  value={corporateData.addressDetails.area}
                  onChange={handleAddressChange}
                  placeholder="Salt Lake Sector V"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700">
                    City
                  </label>

                  <input
                    name="city"
                    value={corporateData.addressDetails.city}
                    onChange={handleAddressChange}
                    placeholder="Kolkata"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700">
                    State
                  </label>

                  <input
                    name="state"
                    value={corporateData.addressDetails.state}
                    onChange={handleAddressChange}
                    placeholder="West Bengal"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-700">
                    Pincode
                  </label>

                  <input
                    name="pincode"
                    value={corporateData.addressDetails.pincode}
                    onChange={handleAddressChange}
                    placeholder="700091"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Landmark */}
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-700">
                Landmark
              </label>

              <input
                name="landmark"
                value={corporateData.location.landmark}
                onChange={handleLocationChange}
                placeholder="Near City Centre Mall"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
              />
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
                onClick={handleSubmit}
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

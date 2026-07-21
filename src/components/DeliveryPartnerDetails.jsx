import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Mail, MapPin, BadgeCheck } from "lucide-react";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";
import { useEffect } from "react";

const DeliveryPartnerDetails = () => {
  const { deliveryPersonId } = useParams();
  const navigate = useNavigate();

  const getDeliveryPersonById = deliveryPartnerStore(
    (state) => state.getDeliveryPersonById,
  );
  const partnerDetails = deliveryPartnerStore((state) => state.partnerDetails);

  useEffect(() => {
    if (deliveryPersonId) {
      getDeliveryPersonById(deliveryPersonId);
    }
  }, [deliveryPersonId, getDeliveryPersonById]);

  useEffect(() => {
    console.log("partnerDetails", partnerDetails);
  }, [partnerDetails]);

  if (!partnerDetails) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <p className="text-gray-500">Delivery partnerDetails not found.</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-2 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-black"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-2 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-700">
            {partnerDetails?.photo ? (
              <img
                src={partnerDetails?.photo}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              `${partnerDetails?.firstName?.[0] ?? ""}${partnerDetails.lastName?.[0] ?? ""}`
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {partnerDetails?.firstName || "N/A"}{" "}
              {partnerDetails?.lastName || ""}
              <BadgeCheck size={20} className="text-blue-500" />
            </h2>

            <p className="text-gray-500">{partnerDetails.deliveryPersonId}</p>
          </div>
        </div>

        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            partnerDetails?.active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {partnerDetails?.active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Contact Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-5">
            Contact Information
          </h3>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Phone size={18} className="text-blue-600" />
              </div>

              <div>
                <p className="text-xs text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-800">
                  {partnerDetails?.phoneNum || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Mail size={18} className="text-purple-600" />
              </div>

              <div>
                <p className="text-xs text-gray-500">Details</p>
                <p className="font-medium text-gray-800">
                  {partnerDetails?.details || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <MapPin size={18} className="text-red-500" />
              </div>

              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-medium text-gray-800">N/A</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500">Joined On</p>
              <p className="font-semibold text-gray-800">
                {partnerDetails?.createdAt
                  ? new Date(partnerDetails.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
        {/* Vehicle */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 mb-3">
            Vehicle Information
          </p>

          {partnerDetails?.vehicleImage ? (
            <img
              src={partnerDetails.vehicleImage}
              alt="Vehicle"
              className="w-full h-40 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          <p className="mt-3 text-sm">
            <span className="font-semibold">Vehicle No:</span>{" "}
            {partnerDetails?.vehicleNumber || "N/A"}
          </p>
        </div>

        {/* Aadhaar */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 mb-3">Aadhaar</p>

          {partnerDetails?.aadharImage ? (
            <img
              src={partnerDetails.aadharImage}
              alt="Aadhaar"
              className="w-full h-40 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          <p className="mt-3 text-sm">
            <span className="font-semibold">Aadhaar No:</span>{" "}
            {partnerDetails?.aadhar || "N/A"}
          </p>
        </div>

        {/* PAN */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 mb-3">PAN</p>

          {partnerDetails?.panImage ? (
            <img
              src={partnerDetails.panImage}
              alt="PAN"
              className="w-full h-40 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          <p className="mt-3 text-sm">
            <span className="font-semibold">PAN No:</span>{" "}
            {partnerDetails?.pan || "N/A"}
          </p>
        </div>

        {/* Driving License */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500 mb-3">
            Driving License
          </p>

          {partnerDetails?.dlImage ? (
            <img
              src={partnerDetails.dlImage}
              alt="Driving License"
              className="w-full h-40 object-cover rounded-lg border"
            />
          ) : (
            <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          <p className="mt-3 text-sm">
            <span className="font-semibold">DL No:</span>{" "}
            {partnerDetails?.drivingLicense || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerDetails;

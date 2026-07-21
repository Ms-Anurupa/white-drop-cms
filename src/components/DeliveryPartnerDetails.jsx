import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  BadgeCheck,
  ImageOff,
  Calendar,
} from "lucide-react";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";
import { useEffect, useState } from "react";
import noDoc from "../assets/images/nodoc.svg";

const DeliveryPartnerDetails = () => {
  const [previewImage, setPreviewImage] = useState(null);
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
    <div className="p-2 space-y-2 max-w-7xl mx-auto">
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
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-xl font-semibold text-blue-700 overflow-hidden">
            {partnerDetails?.photo ? (
              <img
                src={
                  partnerDetails?.photo ||
                  "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=6B7280&size=256"
                }
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://ui-avatars.com/api/?name=User&background=E5E7EB&color=6B7280&size=256";
                }}
              />
            ) : (
              `${partnerDetails?.firstName?.[0] ?? ""}${partnerDetails.lastName?.[0] ?? ""}`
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {partnerDetails?.firstName || "Not Provided"}{" "}
              {partnerDetails?.lastName || ""}
              <BadgeCheck size={20} className="text-blue-500" />
            </h2>
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

      {/* Contact Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-5">
          Contact Information
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Phone size={18} className="text-blue-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-800">
                {partnerDetails?.phoneNum || "Not Provided"}
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
                {partnerDetails?.details || "Not Provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <MapPin size={18} className="text-red-500" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="font-medium text-gray-800">Not Provided</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Calendar size={18} className="text-green-600" />
            </div>

            <div>
              <p className="text-xs text-gray-500">Joined On</p>
              <p className="font-semibold text-gray-800">
                {partnerDetails?.createdAt
                  ? new Date(partnerDetails.createdAt).toLocaleDateString()
                  : "Not Provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-5">Documents</h3>

        <div className="divide-y divide-gray-100">
          {/* Vehicle */}
          <div className="py-5 first:pt-0 last:pb-0 flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                partnerDetails?.vehicleImage &&
                setPreviewImage({
                  src: partnerDetails.vehicleImage,
                  label: "Vehicle",
                })
              }
              disabled={!partnerDetails?.vehicleImage}
              className={`w-20 h-16 shrink-0 rounded-lg border overflow-hidden ${
                partnerDetails?.vehicleImage
                  ? "border-gray-200 cursor-zoom-in"
                  : "border-dashed border-gray-200"
              }`}
            >
              {partnerDetails?.vehicleImage ? (
                <img
                  src={partnerDetails.vehicleImage}
                  alt="Vehicle"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = noDoc;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageOff size={20} />
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">
                Vehicle Information
              </p>
              <p className="text-sm text-gray-400 mt-0.5 truncate">
                {partnerDetails?.vehicleNumber || "Not provided"}
              </p>
            </div>
          </div>

          {/* Aadhaar */}
          <div className="py-5 first:pt-0 last:pb-0 flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                partnerDetails?.aadharImage &&
                setPreviewImage({
                  src: partnerDetails.aadharImage,
                  label: "Aadhaar",
                })
              }
              disabled={!partnerDetails?.aadharImage}
              className={`w-20 h-16 shrink-0 rounded-lg border overflow-hidden ${
                partnerDetails?.aadharImage
                  ? "border-gray-200 cursor-zoom-in"
                  : "border-dashed border-gray-200"
              }`}
            >
              {partnerDetails?.aadharImage ? (
                <img
                  src={partnerDetails.aadharImage}
                  alt="Aadhaar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = noDoc;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageOff size={20} />
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">Aadhaar</p>
              <p className="text-sm text-gray-400 mt-0.5 truncate">
                {partnerDetails?.aadhar || "Not provided"}
              </p>
            </div>
          </div>

          {/* PAN */}
          <div className="py-5 first:pt-0 last:pb-0 flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                partnerDetails?.panImage &&
                setPreviewImage({ src: partnerDetails.panImage, label: "PAN" })
              }
              disabled={!partnerDetails?.panImage}
              className={`w-20 h-16 shrink-0 rounded-lg border overflow-hidden ${
                partnerDetails?.panImage
                  ? "border-gray-200 cursor-zoom-in"
                  : "border-dashed border-gray-200"
              }`}
            >
              {partnerDetails?.panImage ? (
                <img
                  src={partnerDetails.panImage}
                  alt="PAN"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = noDoc;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageOff size={20} />
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">PAN</p>
              <p className="text-sm text-gray-400 mt-0.5 truncate">
                {partnerDetails?.pan || "Not provided"}
              </p>
            </div>
          </div>

          {/* Driving License */}
          <div className="py-5 first:pt-0 last:pb-0 flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                partnerDetails?.dlImage &&
                setPreviewImage({
                  src: partnerDetails.dlImage,
                  label: "Driving License",
                })
              }
              disabled={!partnerDetails?.dlImage}
              className={`w-20 h-16 shrink-0 rounded-lg border overflow-hidden ${
                partnerDetails?.dlImage
                  ? "border-gray-200 cursor-zoom-in"
                  : "border-dashed border-gray-200"
              }`}
            >
              {partnerDetails?.dlImage ? (
                <img
                  src={partnerDetails.dlImage}
                  alt="Driving License"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = noDoc;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageOff size={20} />
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">
                Driving License
              </p>
              <p className="text-sm text-gray-400 mt-0.5 truncate">
                {partnerDetails?.drivingLicense || "Not provided"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage.src}
            alt={previewImage.label}
            className="max-h-[80vh] w-auto rounded-lg shadow-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerDetails;

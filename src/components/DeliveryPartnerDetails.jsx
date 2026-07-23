/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  BadgeCheck,
  Calendar,
  BookUser,
  Bike,
  Pencil,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";
import { useEffect, useMemo, useRef, useState } from "react";
import noDoc from "../assets/images/nodoc.svg";
import Loader from "./Loader";
import useSignedImageObject from "../hooks/useSignedImageObject";

const DeliveryPartnerDetails = () => {
  const { deliveryPersonId } = useParams();
  const navigate = useNavigate();

  const getDeliveryPersonById = deliveryPartnerStore(
    (state) => state.getDeliveryPersonById,
  );
  const partnerDetails = deliveryPartnerStore((state) => state.partnerDetails);
  const editDeliveryPersonById = deliveryPartnerStore(
    (state) => state.editDeliveryPersonById,
  );
  const verifyDeliveryPersonDocs = deliveryPartnerStore(
    (state) => state.verifyDeliveryPersonDocs,
  );
  const loading = deliveryPartnerStore((state) => state.loading);

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatedData, setUpdatedData] = useState(null);
  const [previews, setPreviews] = useState({});
  const [previewImage, setPreviewImage] = useState({
    images: [],
    index: 0,
    label: "",
  });

  // touch-swipe tracking for the slider
  const touchStartX = useRef(null);

  useEffect(() => {
    if (deliveryPersonId) getDeliveryPersonById(deliveryPersonId);
  }, [deliveryPersonId, getDeliveryPersonById]);

  useEffect(() => {
    if (partnerDetails) {
      setUpdatedData(partnerDetails);
      setPreviews({
        photo: partnerDetails.photo || "",
        vehicleImage: partnerDetails.vehicleImage || "",
        aadharImage: partnerDetails.aadharImage || "",
        panImage: partnerDetails.panImage || "",
        dlImage: partnerDetails.dlImage || "",
      });
      setIsDirty(false);
    }
  }, [partnerDetails]);

  // Revoke blob URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((value) => {
        if (Array.isArray(value)) {
          value.forEach((url) => {
            if (url.startsWith("blob:")) URL.revokeObjectURL(url);
          });
        } else if (typeof value === "string" && value.startsWith("blob:")) {
          URL.revokeObjectURL(value);
        }
      });
    };
  }, []);

  const goPrev = () =>
    setPreviewImage((prev) =>
      prev
        ? {
            ...prev,
            index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
          }
        : prev,
    );

  const goNext = () =>
    setPreviewImage((prev) =>
      prev
        ? {
            ...prev,
            index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
          }
        : prev,
    );

  useEffect(() => {
    const handleKey = (e) => {
      if (!previewImage?.images?.length) return;

      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "Escape")
        setPreviewImage({ images: [], index: 0, label: "" });
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [previewImage]);

  const handleChange = (field, value) => {
    setUpdatedData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  // Shared handler for profile photo + document image uploads (multi-file)
  const handleImageChange = (field, e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setUpdatedData((prev) => ({
      ...prev,
      [field]: files,
    }));

    setPreviews((prev) => ({
      ...prev,
      [field]: files.map((file) => URL.createObjectURL(file)),
    }));

    setIsDirty(true);
  };

  const handleCancel = () => {
    setUpdatedData(partnerDetails);
    setPreviews({
      photo: partnerDetails?.photo || "",
      vehicleImage: partnerDetails?.vehicleImage || "",
      aadharImage: partnerDetails?.aadharImage || "",
      panImage: partnerDetails?.panImage || "",
      dlImage: partnerDetails?.dlImage || "",
    });
    setIsDirty(false);
    setIsEditing(false);
  };

  const isBlobUrl = (v) => typeof v === "string" && v.startsWith("blob:");

  const stripBlobs = (value) => {
    if (Array.isArray(value)) {
      const remote = value.filter((v) => v && !isBlobUrl(v));
      return remote.length ? remote : "";
    }
    return value && !isBlobUrl(value) ? value : "";
  };

  const imageObject = useMemo(
    () => ({
      photo: stripBlobs(previews.photo),
      vehicleImage: stripBlobs(previews.vehicleImage),
      aadharImage: stripBlobs(previews.aadharImage),
      panImage: stripBlobs(previews.panImage),
      dlImage: stripBlobs(previews.dlImage),
    }),
    [
      previews.photo,
      previews.vehicleImage,
      previews.aadharImage,
      previews.panImage,
      previews.dlImage,
    ],
  );

  const signedImages = useSignedImageObject(imageObject, "delPersonDocs");

  const getDisplayValue = (field) => {
    const localBlobs = toImageArrayRaw(previews[field]).filter(isBlobUrl);
    return localBlobs.length ? localBlobs : signedImages[field];
  };

  function toImageArrayRaw(value) {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value) return [value];
    return [];
  }

  const handleSave = async () => {
    const formData = new FormData();

    formData.append(
      "payload",
      JSON.stringify({
        deliveryPersonId,
        firstName: updatedData.firstName || "",
        lastName: updatedData.lastName || "",
        details: updatedData.details || "",
        vehicleNumber: updatedData.vehicleNumber || "",
        aadharNo: updatedData.aadharNo || "",
        panNo: updatedData.panNo || "",
        dlNo: updatedData.dlNo || "",
      }),
    );

    const fileFields = [
      "photo",
      "vehicleImage",
      "aadharImage",
      "panImage",
      "dlImage",
    ];

    fileFields.forEach((field) => {
      const value = updatedData[field];

      if (!value) return;

      // Multiple files
      if (Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            formData.append(`${field}`, file);
          }
        });
        return;
      }

      // Single file
      if (value instanceof File) {
        formData.append(field, value);
      }
    });

    try {
      setSaving(true);
      await editDeliveryPersonById(formData);
      setIsDirty(false);
      setIsEditing(false);
      await getDeliveryPersonById(deliveryPersonId);
    } finally {
      setSaving(false);
    }
  };

  // Helper: normalize a signed image entry (string | string[] | undefined) into an array
  const toImageArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value) return [value];
    return [];
  };

  // Opens the slider modal for a given field, always starting at the first image
  const openPreview = (label, signedValue) => {
    const images = toImageArray(signedValue);
    if (!images.length) return;
    setPreviewImage({ images, index: 0, label });
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 40;

    if (deltaX > SWIPE_THRESHOLD) {
      goPrev();
    } else if (deltaX < -SWIPE_THRESHOLD) {
      goNext();
    }
    touchStartX.current = null;
  };

  const handleVerifyDocument = async (verified) => {
    try {
      const payload = {
        deliveryPersonId: deliveryPersonId,
        verified: verified,
      };
      await verifyDeliveryPersonDocs(payload);

      await getDeliveryPersonById(deliveryPersonId);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader text="Loading delivery partner details..." />;

  if (!partnerDetails) {
    return (
      <div className="p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-5 text-sm text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <p className="text-slate-400 text-sm">Delivery partner not found.</p>
      </div>
    );
  }

  const inputClass = (editable, extra = "") =>
    `w-full rounded-md border px-2.5 py-1.5 text-sm transition ${
      editable
        ? "border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-500"
        : "border-transparent bg-transparent text-slate-700 px-0 py-0.5"
    } ${extra}`;

  const fmtDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Not provided";

  // Thumbnail for a doc field always shows the FIRST image, even when multiple were uploaded
  const firstImage = (signedValue) => {
    const arr = toImageArray(signedValue);
    return arr[0] || noDoc;
  };

  return (
    <div className="">
      {/* action bar */}
      <div className="max-w-7xl mx-auto p-2 flex items-center justify-between">
        {/* Left - Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Right - Action Buttons */}
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition"
            >
              <Pencil size={15} />
              Edit Details
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
              >
                <X size={15} />
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={!isDirty || saving}
                className="flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 transition"
              >
                <Check size={15} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-2 md:p-2 space-y-2">
        {/* Profile header */}
        <div className="bg-white rounded-xl border border-slate-200/70 p-2">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            {/* Left Section */}
            <div className="flex items-center gap-5 flex-1">
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    openPreview("Profile Photo", getDisplayValue("photo"))
                  }
                  className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-slate-100 bg-teal-50 flex items-center justify-center"
                >
                  {partnerDetails?.photo ? (
                    <img
                      src={firstImage(getDisplayValue("photo"))}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-semibold text-teal-700">
                      {partnerDetails?.firstName?.[0] ?? ""}
                      {partnerDetails?.lastName?.[0] ?? ""}
                    </span>
                  )}
                </button>

                {isEditing && (
                  <>
                    <input
                      id="profile-upload"
                      hidden
                      multiple
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange("photo", e)}
                    />

                    <label
                      htmlFor="profile-upload"
                      className="absolute -bottom-1 -right-1 cursor-pointer rounded-full bg-slate-900 p-1.5 text-white shadow hover:bg-slate-800"
                    >
                      <Pencil size={11} />
                    </label>
                  </>
                )}
              </div>

              <div className="flex-1">
                {isEditing ? (
                  <div className="flex gap-2">
                    <input
                      value={updatedData?.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                      placeholder="First name"
                      className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
                    />

                    <input
                      value={updatedData?.lastName || ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      placeholder="Last name"
                      className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold focus:ring-2 focus:ring-teal-100 focus:border-teal-500 outline-none"
                    />
                  </div>
                ) : (
                  <h2 className="text-xl font-semibold text-slate-800">
                    {updatedData?.firstName} {updatedData?.lastName}
                  </h2>
                )}

                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Phone size={14} />
                    {updatedData?.phoneNo || "—"}
                  </span>

                  <span className="text-slate-300">•</span>

                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Joined {fmtDate(updatedData?.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex justify-end">
              {isEditing ? (
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">
                      Account Status
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        updatedData?.active ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {updatedData?.active ? "Active" : "Inactive"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChange("active", !updatedData?.active)}
                    className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                      updatedData?.active ? "bg-green-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                        updatedData?.active ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ) : (
                <div
                  className={`flex items-center gap-2 rounded-xl px-4 py-3 ${
                    partnerDetails?.active
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <BadgeCheck
                    size={18}
                    className={
                      partnerDetails?.active ? "text-green-600" : "text-red-600"
                    }
                  />

                  <div>
                    <p
                      className={`font-semibold ${
                        partnerDetails?.active
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {partnerDetails?.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contact information */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm py-2 px-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Contact Information
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Personal and vehicle details
              </p>
            </div>

            <div className="h-12 w-12 rounded-2xl bg-cyan-50 flex items-center justify-center">
              <BookUser className="text-cyan-600" size={22} />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Phone */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Phone className="text-blue-600" size={18} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Phone Number
                  </p>
                  <p className="text-sm text-slate-500">
                    Registered mobile number
                  </p>
                </div>
              </div>

              <span
                className={
                  "h-11 rounded-xl border-slate-300 bg-white font-medium"
                }
              >
                {updatedData?.phoneNo || "Not Provided"}
              </span>
            </div>

            {/* Vehicle */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center">
                  <Bike className="text-red-500" size={18} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Vehicle Number
                  </p>
                  <p className="text-sm text-slate-500">Registered vehicle</p>
                </div>
              </div>

              <input
                disabled={!isEditing}
                value={updatedData?.vehicleNumber || "Not Provided"}
                onChange={(e) => handleChange("vehicleNumber", e.target.value)}
                className={inputClass(
                  isEditing,
                  "h-11 rounded-xl border-slate-300 bg-white uppercase font-medium",
                )}
              />
            </div>

            {/* Details */}
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                  <BookUser className="text-purple-600" size={18} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Additional Details
                  </p>
                  <p className="text-sm text-slate-500">
                    Description or remarks
                  </p>
                </div>
              </div>

              <textarea
                rows={5}
                disabled={!isEditing}
                value={updatedData?.details || "Not Provided"}
                onChange={(e) => handleChange("details", e.target.value)}
                className={`resize-none ${inputClass(
                  isEditing,
                  "rounded-xl border-slate-300 bg-white",
                )}`}
              />
            </div>
          </div>
        </div>

        {/* ================= DOCUMENTS ================= */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm py-2 px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-2">
              {/* Left */}
              <div>
                <h2 className="text-xl font-bold text-slate-800">Documents</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Uploaded identity and vehicle documents
                </p>
              </div>

              {/* Right */}
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="text-right">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Verification Status
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      partnerDetails?.documentsVerified
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {partnerDetails?.documentsVerified
                      ? "Approved"
                      : "Rejected"}
                  </p>
                </div>

                <select
                  value={partnerDetails?.documentsVerified ? "true" : "false"}
                  onChange={(e) =>
                    handleVerifyDocument(e.target.value === "true")
                  }
                  className="rounded-lg border cursor-pointer border-slate-300 bg-white px-3 py-2 text-sm font-medium focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                >
                  <option value="true">Approved</option>
                  <option value="false">Rejected</option>
                </select>
              </div>
            </div>

            {isEditing && (
              <span className="text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-full">
                Click the image to upload new document(s) — you can select
                multiple files
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ================= Vehicle ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Vehicle
                  </h3>
                  <p className="text-sm text-slate-500">
                    Vehicle Registration Document
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="relative group">
                  <img
                    src={firstImage(getDisplayValue("vehicleImage"))}
                    alt="Vehicle"
                    className="w-36 h-24 rounded-xl border object-cover bg-slate-100 cursor-pointer"
                    onClick={() =>
                      openPreview("Vehicle", getDisplayValue("vehicleImage"))
                    }
                  />

                  {toImageArray(getDisplayValue("vehicleImage")).length > 1 && (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5">
                      +
                      {toImageArray(getDisplayValue("vehicleImage")).length - 1}
                    </span>
                  )}

                  {isEditing && (
                    <>
                      <input
                        id="vehicle-upload"
                        hidden
                        multiple
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange("vehicleImage", e)}
                      />

                      <label
                        htmlFor="vehicle-upload"
                        className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Pencil size={15} />
                      </label>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Vehicle Number
                  </label>

                  {isEditing ? (
                    <input
                      value={updatedData?.vehicleNumber || ""}
                      onChange={(e) =>
                        handleChange("vehicleNumber", e.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 font-medium">
                      {updatedData?.vehicleNumber || "Not Available"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= Aadhaar ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Aadhaar Card
                  </h3>
                  <p className="text-sm text-slate-500">
                    Government Identity Proof
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="relative group">
                  <img
                    src={firstImage(getDisplayValue("aadharImage"))}
                    alt="Aadhaar"
                    className="w-36 h-24 rounded-xl border object-cover bg-slate-100 cursor-pointer"
                    onClick={() =>
                      openPreview(
                        "Aadhaar Card",
                        getDisplayValue("aadharImage"),
                      )
                    }
                  />

                  {toImageArray(getDisplayValue("aadharImage")).length > 1 && (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5">
                      +{toImageArray(getDisplayValue("aadharImage")).length - 1}
                    </span>
                  )}

                  {isEditing && (
                    <>
                      <input
                        id="aadhar-upload"
                        hidden
                        multiple
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange("aadharImage", e)}
                      />

                      <label
                        htmlFor="aadhar-upload"
                        className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer"
                      >
                        <Pencil size={15} />
                      </label>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Aadhaar Number
                  </label>

                  {isEditing ? (
                    <input
                      value={updatedData?.aadharNo || ""}
                      onChange={(e) => handleChange("aadharNo", e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-200"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 font-medium">
                      {updatedData?.aadharNo || "Not Available"}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* ================= PAN CARD ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    PAN Card
                  </h3>
                  <p className="text-sm text-slate-500">
                    Permanent Account Number
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="relative group">
                  <img
                    src={firstImage(getDisplayValue("panImage"))}
                    alt="PAN Card"
                    className="w-36 h-24 rounded-xl border object-cover bg-slate-100 cursor-pointer"
                    onClick={() =>
                      openPreview("PAN Card", getDisplayValue("panImage"))
                    }
                  />

                  {toImageArray(getDisplayValue("panImage")).length > 1 && (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5">
                      +{toImageArray(getDisplayValue("panImage")).length - 1}
                    </span>
                  )}

                  {isEditing && (
                    <>
                      <input
                        id="pan-upload"
                        hidden
                        multiple
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange("panImage", e)}
                      />

                      <label
                        htmlFor="pan-upload"
                        className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer hover:bg-slate-800 transition"
                      >
                        <Pencil size={15} />
                      </label>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    PAN Number
                  </label>

                  {isEditing ? (
                    <input
                      value={updatedData?.panNo || ""}
                      onChange={(e) => handleChange("panNo", e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium">
                      {updatedData?.panNo || "Not Available"}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ================= DRIVING LICENCE ================= */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    Driving Licence
                  </h3>
                  <p className="text-sm text-slate-500">
                    Driver's Licence Document
                  </p>
                </div>
              </div>

              <div className="flex gap-5">
                <div className="relative group">
                  <img
                    src={firstImage(getDisplayValue("dlImage"))}
                    alt="Driving Licence"
                    className="w-36 h-24 rounded-xl border object-cover bg-slate-100 cursor-pointer"
                    onClick={() =>
                      openPreview("Driving Licence", getDisplayValue("dlImage"))
                    }
                  />

                  {toImageArray(getDisplayValue("dlImage")).length > 1 && (
                    <span className="absolute top-1.5 right-1.5 rounded-full bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5">
                      +{toImageArray(getDisplayValue("dlImage")).length - 1}
                    </span>
                  )}

                  {isEditing && (
                    <>
                      <input
                        id="dl-upload"
                        hidden
                        multiple
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange("dlImage", e)}
                      />

                      <label
                        htmlFor="dl-upload"
                        className="absolute bottom-2 right-2 h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center cursor-pointer hover:bg-slate-800 transition"
                      >
                        <Pencil size={15} />
                      </label>
                    </>
                  )}
                </div>

                <div className="flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Licence Number
                  </label>

                  {isEditing ? (
                    <input
                      value={updatedData?.dlNo || ""}
                      onChange={(e) => handleChange("dlNo", e.target.value)}
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-500"
                    />
                  ) : (
                    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium">
                      {updatedData?.dlNo || "Not Available"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= IMAGE PREVIEW MODAL (sliding carousel) ================= */}
      {previewImage?.images?.length > 0 && (
        <div
          className="fixed inset-0 z-10 bg-black/85 backdrop-blur-sm flex items-center
           justify-center p-4 sm:p-8"
          onClick={() => setPreviewImage({ images: [], index: 0, label: "" })}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setPreviewImage({ images: [], index: 0, label: "" })}
            className="absolute cursor-pointer top-5 right-5 sm:top-8 sm:right-8 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X size={22} />
          </button>

          {/* Modal Content */}
          <div
            className="relative max-w-6xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Card */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  {previewImage.label}
                </h3>

                {previewImage.images.length > 1 && (
                  <span className="text-xs font-medium text-slate-400">
                    {previewImage.index + 1} / {previewImage.images.length}
                  </span>
                )}
              </div>

              {/* Sliding track */}
              <div
                className="relative bg-slate-100 overflow-hidden max-h-[80vh]"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-300 ease-out"
                  style={{
                    transform: `translateX(-${previewImage.index * 100}%)`,
                  }}
                >
                  {previewImage.images.map((src, i) => (
                    <div
                      key={i}
                      className="w-full shrink-0 flex items-center justify-center p-6"
                    >
                      <img
                        src={src || noDoc}
                        alt={`${previewImage.label} ${i + 1}`}
                        className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-xl select-none"
                        draggable={false}
                      />
                    </div>
                  ))}
                </div>

                {previewImage.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="absolute left-5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition"
                      onClick={goPrev}
                    >
                      <ChevronLeft size={28} />
                    </button>

                    <button
                      type="button"
                      className="absolute right-5 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 transition"
                      onClick={goNext}
                    >
                      <ChevronRight size={28} />
                    </button>

                    {/* Dot indicators — click to jump straight to an image */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-black/60 px-3 py-2">
                      {previewImage.images.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() =>
                            setPreviewImage((prev) => ({ ...prev, index: i }))
                          }
                          className={`h-2 rounded-full transition-all ${
                            i === previewImage.index
                              ? "w-6 bg-white"
                              : "w-2 bg-white/50 hover:bg-white/80"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 px-6 py-4 text-center">
                <p className="text-sm text-slate-500">
                  {previewImage.images.length > 1
                    ? "Swipe, use the arrows, or click a dot to browse. Click outside or press Esc to close."
                    : "Click outside the image or press the close button to dismiss."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartnerDetails;

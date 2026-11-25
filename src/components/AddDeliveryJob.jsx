/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  MapPin,
  Save,
  Truck,
} from "lucide-react";
import deliveryJobStore from "../zustand/Store/deliveryJobStore";
import { resolveFirebaseUrl } from "../utils/resolveUrl";

const AddDeliveryJob = () => {
  const navigate = useNavigate();
  const getDeliverySlots = deliveryJobStore((state) => state.getDeliverySlots);
  const deliverySlots = deliveryJobStore((state) => state.deliverySlots);
  const createDeliveryJob = deliveryJobStore(
    (state) => state.createDeliveryJob,
  );
  const [deliveryJobData, setDeliveryJobData] = useState({
    jobName: "",
    area: "",
    deliveryDate: "",
    deliverySlot: "",
    description: "",
  });
  const [isSlotOpen, setIsSlotOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getDeliverySlots();
  }, [getDeliverySlots]);

  useEffect(() => {
    console.log("deliverySlots", deliverySlots);
  }, [deliverySlots]);

  const updateField = (field, value) => {
    setDeliveryJobData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const generateJobName = (area, date, slot) => {
    if (!area) return "";

    let jobName = area.trim();

    if (date) {
      const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      );

      jobName += ` - ${formattedDate}`;
    }
    if (slot) {
      jobName += ` - ${slot.name} (${slot.from} - ${slot.to})`;
    }
    return jobName;
  };

  useEffect(() => {
    const selectedSlot = deliverySlots.find(
      (slot) => slot.id === deliveryJobData.deliverySlot,
    );

    const generatedName = generateJobName(
      deliveryJobData.area,
      deliveryJobData.deliveryDate,
      selectedSlot,
    );

    setDeliveryJobData((prev) => ({
      ...prev,
      jobName: generatedName,
    }));
  }, [
    deliveryJobData.area,
    deliveryJobData.deliveryDate,
    deliveryJobData.deliverySlot,
    deliverySlots,
  ]);

  const getToday = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const validate = () => {
    const newErrors = {};

    if (!deliveryJobData.jobName.trim()) {
      newErrors.jobName = "Job / group name is required.";
    } else if (deliveryJobData.jobName.trim().length < 3) {
      newErrors.jobName = "Job / group name must be at least 3 characters.";
    }

    if (!deliveryJobData.area) {
      newErrors.area = "Please select an area.";
    }

    if (!deliveryJobData.deliveryDate) {
      newErrors.deliveryDate = "Please select a delivery date.";
    }

    if (!deliveryJobData.deliverySlot) {
      newErrors.deliverySlot = "Please select a delivery slot.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        name: deliveryJobData.jobName.trim(),
        area: deliveryJobData.area,
        deliveryDate: deliveryJobData.deliveryDate,
        deliverySlotId: deliveryJobData.deliverySlot,
        description: deliveryJobData.description.trim(),
      };

      console.log("Create Delivery Job:", payload);

      await createDeliveryJob(payload);

      await new Promise((resolve) => setTimeout(resolve, 700));

      navigate("/dashboard/delivery-job");
    } catch (error) {
      console.error("Failed to create delivery job:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedSlot = deliverySlots.find(
    (slot) => slot.id === deliveryJobData.deliverySlot,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-4 py-4 md:px-6 md:py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => navigate("/dashboard/delivery-job")}
              className="w-10 h-10 cursor-pointer rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shrink-0 shadow-sm"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 items-center justify-center">
                  <Truck size={16} className="text-blue-600 dark:text-blue-400" />
                </div>

                <h1 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-slate-100 truncate">
                  Create Delivery Job
                </h1>
              </div>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create a delivery group for an area and delivery slot.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 shadow-sm">
            <ClipboardList size={14} />
            Delivery Management
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-5 items-start">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {/* FORM HEADER */}
              <div className="px-5 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0">
                    <ClipboardList size={17} className="text-blue-600 dark:text-blue-400" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      Delivery Job Details
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Enter the basic information for this delivery group.
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM CONTENT */}
              <div className="px-6 py-4">
                <div className="mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Job / Group Name
                    <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-2">
                      Auto generated
                    </span>
                  </label>

                  <input
                    type="text"
                    value={deliveryJobData.jobName}
                    readOnly
                    placeholder="Select area, date and delivery slot"
                    className="w-full h-11 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3.5 text-sm 
                    font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none cursor-not-allowed"
                  />

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                    The job name is automatically generated from the area, date
                    and delivery slot.
                  </p>
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Delivery Area
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                    />

                    <input
                      type="text"
                      placeholder="Enter the delivery area"
                      value={deliveryJobData.area}
                      onChange={(e) => updateField("area", e.target.value)}
                      className={`w-full h-11 rounded-lg border pl-9 pr-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all ${
                        errors.area
                          ? "border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/50"
                          : "border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
                      }`}
                    />
                  </div>

                  {errors.area && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">{errors.area}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                  {/* DATE */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Delivery Date
                      <span className="text-red-500 ml-1">*</span>
                    </label>

                    <div className="relative">
                      <CalendarDays
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                      />

                      <input
                        type="date"
                        min={getToday()}
                        value={deliveryJobData.deliveryDate}
                        onChange={(e) =>
                          updateField("deliveryDate", e.target.value)
                        }
                        className={`w-full h-11 rounded-lg border pl-9 pr-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 dark:[color-scheme:dark] outline-none transition-all ${
                          errors.deliveryDate
                            ? "border-red-300 dark:border-red-700 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-950/50"
                            : "border-slate-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50"
                        }`}
                      />
                    </div>

                    {errors.deliveryDate && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">
                        {errors.deliveryDate}
                      </p>
                    )}
                  </div>

                  {/* SLOT */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Delivery Slot
                      <span className="text-red-500 ml-1">*</span>
                    </label>

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSlotOpen((prev) => !prev)}
                        className={`w-full h-11 rounded-lg border px-3 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 flex items-center justify-between outline-none transition-all ${
                          errors.deliverySlot
                            ? "border-red-300 dark:border-red-700"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {selectedSlot ? (
                            <>
                              <img
                                src={resolveFirebaseUrl({
                                  folderName: "public",
                                  fileName: selectedSlot.icon,
                                })}
                                alt={selectedSlot.name}
                                className="w-6 h-6 object-contain shrink-0"
                              />

                              <span className="truncate">
                                {selectedSlot.name} — {selectedSlot.from} to{" "}
                                {selectedSlot.to}
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock3
                                size={16}
                                className="text-slate-400 dark:text-slate-500 shrink-0"
                              />
                              <span className="text-slate-400 dark:text-slate-500">
                                Select delivery slot
                              </span>
                            </>
                          )}
                        </div>

                        <ChevronDown
                          size={16}
                          className={`text-slate-400 dark:text-slate-500 shrink-0 transition-transform ${
                            isSlotOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isSlotOpen && (
                        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden">
                          {deliverySlots.map((slot) => (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => {
                                updateField("deliverySlot", slot.id);
                                setIsSlotOpen(false);
                              }}
                              className={`w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${
                                deliveryJobData.deliverySlot === slot.id
                                  ? "bg-blue-50 dark:bg-blue-950/60"
                                  : ""
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                <img
                                  src={resolveFirebaseUrl({
                                    folderName: "public",
                                    fileName: slot.icon,
                                  })}
                                  alt={slot.name}
                                  className="w-6 h-6 object-contain"
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                                  {slot.name}
                                </p>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  {slot.from} — {slot.to}
                                </p>
                              </div>

                              {deliveryJobData.deliverySlot === slot.id && (
                                <div className="ml-auto w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {errors.deliverySlot && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1.5">
                        {errors.deliverySlot}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                    <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-2">
                      Optional
                    </span>
                  </label>

                  <div className="relative">
                    <FileText
                      size={16}
                      className="absolute left-3 top-3 text-slate-400 dark:text-slate-500"
                    />

                    <textarea
                      rows={4}
                      maxLength={500}
                      value={deliveryJobData.description}
                      onChange={(e) =>
                        updateField("description", e.target.value)
                      }
                      placeholder="Add any internal delivery description about this delivery group..."
                      className="w-full resize-none rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all"
                    />
                  </div>

                  <div className="flex justify-end mt-1">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {deliveryJobData.description.length}/500
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 px-5 md:px-6 py-4 bg-slate-50/70 dark:bg-slate-800/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                    You can assign delivery partners after the job is created.
                  </p>

                  <div className="flex items-center justify-end gap-2 order-1 sm:order-2">
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard/delivery-job")}
                      disabled={isSaving}
                      className="h-10 px-4 cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="h-10 px-4 cursor-pointer min-w-[155px] inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all disabled:bg-blue-300 dark:disabled:bg-blue-800/60 dark:disabled:text-blue-200/70 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save size={16} />
                          Create Delivery Job
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-5">
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* SUMMARY HEADER */}
                <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Job Summary
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Review the delivery group.
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center">
                      <ClipboardList size={15} className="text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* SUMMARY BODY */}
                <div className="p-5">
                  {/* GROUP NAME */}
                  <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">
                      Delivery Group
                    </p>

                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1.5 break-words">
                      {deliveryJobData.jobName || "Untitled delivery job"}
                    </p>
                  </div>

                  {/* DETAILS */}
                  <div className="py-4 space-y-4">
                    <SummaryItem
                      Icon={MapPin}
                      label="Area"
                      value={deliveryJobData.area || "Not selected"}
                    />

                    <SummaryItem
                      Icon={CalendarDays}
                      label="Delivery Date"
                      value={
                        deliveryJobData.deliveryDate
                          ? new Date(
                              `${deliveryJobData.deliveryDate}T00:00:00`,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Not selected"
                      }
                    />

                    <SummaryItem
                      Icon={Clock3}
                      label="Delivery Slot"
                      value={
                        selectedSlot
                          ? `${selectedSlot.name} · ${selectedSlot.from} — ${selectedSlot.to}`
                          : "Not selected"
                      }
                    />
                  </div>

                  {/* NEXT STEP */}
                  <div className="mt-5 rounded-lg bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 p-3.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                      Next step
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      After creating this job, you'll be able to view the job
                      and assign a delivery partner.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ===============================================================
   SUMMARY ITEM
================================================================ */
const SummaryItem = ({ Icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-slate-500 dark:text-slate-400" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{label}</p>

        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5 break-words">
          {value}
        </p>
      </div>
    </div>
  );
};

export default AddDeliveryJob;

/* eslint-disable react-hooks/set-state-in-effect */
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Package,
  Search,
  Truck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import deliveryJobStore from "../zustand/Store/deliveryJobStore";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";
import deliveryPartnerAssignStore from "../zustand/Store/deliveryPartnerAssignStore";
import { toast } from "react-toastify";
import { resolveFirebaseUrl } from "../utils/resolveUrl";

const PARTNER_STATUS_STYLES = {
  AVAILABLE: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
    label: "Available",
  },
  BUSY: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
    label: "Busy",
  },
  OFFLINE: {
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    dot: "bg-slate-400",
    label: "Offline",
  },
};

const getPartnerStatusStyle = (status) =>
  PARTNER_STATUS_STYLES[status] || PARTNER_STATUS_STYLES.OFFLINE;

const getPartnerId = (partner) => {
  return partner?.deliveryPersonId;
};

const getPartnerName = (partner) => {
  if (!partner) return "Unknown Partner";

  const firstName = partner.firstName || "";

  const lastName = partner.lastName || "";

  return `${firstName} ${lastName}`.trim() || "Delivery Partner";
};

const getPartnerPhone = (partner) => {
  return partner?.phoneNo || "";
};

const getVehicleNumber = (partner) => {
  return partner?.vehicleNumber || "";
};

const getInitials = (partner) => {
  if (!partner) return "DP";

  const firstName = partner.firstName || "";

  const lastName = partner.lastName || "";

  const first = firstName?.[0] || "";
  const last = lastName?.[0] || "";

  return (first + last).toUpperCase() || "DP";
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const AssignDeliveryPartner = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const getDeliveryJobs = deliveryPartnerAssignStore(
    (state) => state.getDeliveryJobs,
  );
  const assignDeliveryJob = deliveryJobStore(
    (state) => state.assignDeliveryJob,
  );
  const deliveryJobs = deliveryPartnerAssignStore(
    (state) => state.deliveryJobs,
  );
  const getDeliveryPersons = deliveryPartnerStore(
    (state) => state.getDeliveryPersons,
  );
  const deliveryPartners = deliveryPartnerStore((state) => state.partners);
  const [search, setSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (!id) return;

    getDeliveryJobs(id);
  }, [id, getDeliveryJobs]);

  useEffect(() => {
    getDeliveryPersons({
      page: 1,
      limit: 1000,
      search: "",
      fromDate: "",
      toDate: "",
    });
  }, [getDeliveryPersons]);

  const deliveryJob = useMemo(() => {
    if (!deliveryJobs) return null;

    return deliveryJobs?.deliveryJob || null;
  }, [deliveryJobs]);

  const currentPartner = deliveryJob?.deliveryPartner || null;
  const isAlreadyAssigned = Boolean(deliveryJob?.deliveryPartnerId);

  useEffect(() => {
    if (!currentPartner) return;

    setSelectedPartner(currentPartner);
  }, [currentPartner]);

  const filteredPartners = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (deliveryPartners || []).filter((partner) => {
      if (!q) return true;

      const name = getPartnerName(partner).toLowerCase();

      const phone = getPartnerPhone(partner).toLowerCase();

      const vehicle = getVehicleNumber(partner).toLowerCase();

      return name.includes(q) || phone.includes(q) || vehicle.includes(q);
    });
  }, [deliveryPartners, search]);

  const availablePartners = useMemo(() => {
    return (deliveryPartners || []).filter(
      (partner) => partner.status === "AVAILABLE",
    ).length;
  }, [deliveryPartners]);

  const handleAssign = async () => {
    if (!selectedPartner || !id) return;

    const partnerId = getPartnerId(selectedPartner);

    // if (!partnerId) {
    //   toast.error(
    //     "Delivery partner ID is missing",
    //     selectedPartner,
    //   );
    //   return;
    // }

    try {
      setIsAssigning(true);

      const payload = {
        deliveryJobId: id,
        deliveryPartnerId: partnerId,
      };
      //   console.log("payload", payload);

      await assignDeliveryJob(payload);

      navigate(`/dashboard/delivery-job`);
    } catch {
      toast.error("Failed to assign delivery partner");
    } finally {
      setIsAssigning(false);
    }
  };

  // =========================================================
  // LOADING / NOT FOUND
  // =========================================================

  if (!deliveryJob) {
    return (
      <div className="min-h-full bg-slate-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm py-20 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Truck size={25} />
            </div>

            <h2 className="text-base font-semibold text-slate-900">
              Delivery job not found
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              The delivery job may have been removed or is no longer available.
            </p>

            <button
              type="button"
              onClick={() => navigate("/dashboard/delivery-job")}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Back to Delivery Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full bg-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/delivery-job")}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Delivery Jobs
          </button>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-[#3B5CCC] px-6 sm:px-8 py-6 mb-4">
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 800 200"
            aria-hidden="true"
          >
            <path
              d="M -20 160 C 150 40, 300 220, 450 90 S 700 40, 860 100"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="6 8"
            />
          </svg>

          <div className="relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 text-white flex items-center justify-center">
                  <Truck size={22} />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      {isAlreadyAssigned
                        ? "Reassign Delivery Partner"
                        : "Assign Delivery Partner"}
                    </h1>

                    {deliveryJob.deliveryPartnerId ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-200 bg-emerald-400/10 border border-emerald-300/20 px-2 py-1 rounded-full">
                        <CheckCircle2 size={12} />
                        Currently Assigned
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-200 bg-amber-400/10 border border-amber-300/20 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                        Awaiting Assignment
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-blue-100 mt-1">
                    {isAlreadyAssigned
                      ? "Change the delivery partner assigned to this delivery job"
                      : "Select a delivery partner for this delivery job"}
                  </p>
                </div>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-3 min-w-[220px]">
                <p className="text-[10px] uppercase tracking-wider text-blue-100">
                  Delivery Job
                </p>

                <p className="text-sm font-semibold text-white mt-1 truncate">
                  {deliveryJob.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Job Summary
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                Delivery details for this assignment
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Package size={15} />
              {deliveryJob.orders?.length || 0} Orders
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* AREA */}

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-slate-500" />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Area
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
                  {deliveryJob.area || "—"}
                </p>
              </div>
            </div>

            {/* DATE */}

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <CalendarDays size={18} className="text-slate-500" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Delivery Date
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {formatDate(deliveryJob.deliveryDate)}
                </p>
              </div>
            </div>

            {/* SLOT */}

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden">
                {deliveryJob.slot?.icon ? (
                  <img
                    src={resolveFirebaseUrl({
                      folderName: "public",
                      fileName: deliveryJob.slot.icon,
                    })}
                    alt={deliveryJob.slot.name}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <Clock3 size={18} className="text-blue-600" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Delivery Slot
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">
                  {deliveryJob.slot?.name || "—"}
                </p>

                {deliveryJob.slot?.from && deliveryJob.slot?.to && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {deliveryJob.slot.from} - {deliveryJob.slot.to}
                  </p>
                )}
              </div>
            </div>

            {/* ORDERS */}

            <div className="flex items-center gap-3 rounded-xl bg-slate-50 border border-slate-100 p-3.5">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <Package size={18} className="text-slate-500" />
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wide text-slate-400">
                  Orders
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {deliveryJob.orders?.length || 0} Orders
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">
                      Delivery Partners
                    </h2>

                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      {deliveryPartners?.length || 0}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    {availablePartners} partners currently available
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search partners..."
                    className="
                      w-full
                      pl-9 pr-3 py-2.5
                      text-sm
                      rounded-xl
                      border border-slate-200
                      bg-slate-50
                      focus:bg-white
                      focus:border-blue-400
                      focus:ring-2
                      focus:ring-blue-100
                      outline-none
                      transition-all
                    "
                  />
                </div>
              </div>
            </div>

            {!filteredPartners.length ? (
              <div className="py-16 px-6 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
                  <Users size={24} />
                </div>

                <h3 className="text-sm font-semibold text-slate-900">
                  No delivery partners found
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Try changing your search or check partner availability.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredPartners.map((partner) => {
                  const statusStyle = getPartnerStatusStyle(partner.status);

                  const partnerId = getPartnerId(partner);

                  const selectedId = getPartnerId(selectedPartner);

                  const isSelected = selectedId === partnerId;

                  return (
                    <button
                      key={partnerId}
                      type="button"
                      onClick={() => setSelectedPartner(partner)}
                      className={`
                        w-full
                        text-left
                        px-5 sm:px-6 py-4
                        transition-all
                        cursor-pointer
                        ${isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"}
                      `}
                    >
                      <div className="flex items-center gap-4">
                        {/* AVATAR */}

                        <div
                          className={`
                            relative
                            w-11 h-11
                            rounded-full
                            flex items-center justify-center
                            shrink-0
                            text-xs
                            font-bold
                            ${
                              isSelected
                                ? "bg-blue-600 text-white"
                                : "bg-violet-100 text-violet-700"
                            }
                          `}
                        >
                          {getInitials(partner)}

                          <span
                            className={`
                              absolute
                              right-0
                              bottom-0
                              w-3
                              h-3
                              rounded-full
                              border-2
                              border-white
                              ${statusStyle.dot}
                            `}
                          />
                        </div>

                        {/* INFO */}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-900">
                              {getPartnerName(partner)}
                            </p>

                            <span
                              className={`
                                inline-flex items-center gap-1.5
                                px-2 py-0.5
                                rounded-full
                                text-[10px]
                                font-semibold
                                border
                                ${statusStyle.badge}
                              `}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {statusStyle.label}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                            {getPartnerPhone(partner) && (
                              <span className="text-xs text-slate-500">
                                {getPartnerPhone(partner)}
                              </span>
                            )}

                            <div className="flex flex-col gap-1 mt-1">
                              {getVehicleNumber(partner) && (
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                  <Truck size={12} className="shrink-0" />
                                  {getVehicleNumber(partner)}
                                </span>
                              )}

                              {partner.areaCovered && (
                                <span className="text-xs text-slate-400 truncate">
                                  {partner.areaCovered}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* SELECTION */}

                        <div
                          className={`
                            w-7 h-7
                            rounded-full
                            border
                            flex items-center justify-center
                            shrink-0
                            transition-all
                            ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-slate-200 text-transparent"
                            }
                          `}
                        >
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="xl:sticky xl:top-4 h-fit">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">
                  {isAlreadyAssigned ? "Reassignment" : "Assignment"}
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  {isAlreadyAssigned
                    ? "Review and change the delivery partner"
                    : "Review the selected delivery partner"}
                </p>
              </div>

              {selectedPartner ? (
                <div className="p-5">
                  {/* SELECTED PARTNER */}

                  <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {getInitials(selectedPartner)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {getPartnerName(selectedPartner)}
                          </p>

                          {isAlreadyAssigned &&
                            getPartnerId(selectedPartner) ===
                              deliveryJob.deliveryPartnerId && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-semibold text-emerald-700">
                                <CheckCircle2 size={11} />
                                Current
                              </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              getPartnerStatusStyle(selectedPartner.status).dot
                            }`}
                          />

                          <span className="text-xs text-slate-600 font-medium">
                            {selectedPartner.status || "Available"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedPartner(null)}
                        className="ml-auto w-7 h-7 rounded-lg hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* DETAILS */}

                  <div className="mt-5 space-y-3">
                    {getPartnerPhone(selectedPartner) && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400">Phone</span>

                        <span className="text-xs font-semibold text-slate-700">
                          {getPartnerPhone(selectedPartner)}
                        </span>
                      </div>
                    )}

                    {getVehicleNumber(selectedPartner) && (
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-400">Vehicle</span>

                        <span className="text-xs font-semibold text-slate-700">
                          {getVehicleNumber(selectedPartner)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">
                        Delivery Area
                      </span>

                      <span className="text-xs font-semibold text-slate-700 text-right">
                        {selectedPartner.areaCovered || "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">Orders</span>

                      <span className="text-xs font-semibold text-slate-700">
                        {deliveryJob.orders?.length || 0}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-400">Slot</span>

                      <span className="text-xs font-semibold text-slate-700">
                        {deliveryJob.slot?.name || "—"}
                      </span>
                    </div>
                  </div>

                  {/* ASSIGNMENT NOTE */}

                  <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex gap-2.5">
                      <CheckCircle2
                        size={16}
                        className="text-blue-600 shrink-0 mt-0.5"
                      />

                      <p className="text-xs leading-5 text-slate-500">
                        {isAlreadyAssigned
                          ? "Reassigning this delivery job will replace the currently assigned partner with the selected partner."
                          : "Assigning this partner will make them responsible for the orders included in this delivery job."}
                      </p>
                    </div>
                  </div>

                  {/* ASSIGN BUTTON */}

                  <button
                    type="button"
                    onClick={handleAssign}
                    disabled={isAssigning || !getPartnerId(selectedPartner)}
                    className="
                      w-full
                      mt-5
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-4
                      py-3
                      rounded-xl
                      bg-[#3B5CCC]
                      hover:bg-[#334FB3]
                      disabled:bg-slate-300
                      disabled:cursor-not-allowed
                      text-white
                      text-sm
                      font-semibold
                      shadow-sm
                      hover:shadow-md
                      transition-all
                      cursor-pointer
                    "
                  >
                    {isAssigning ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        {isAlreadyAssigned ? "Reassigning..." : "Assigning..."}
                      </>
                    ) : (
                      <>
                        <Check size={17} strokeWidth={2.5} />
                        {isAlreadyAssigned
                          ? "Reassign Delivery Partner"
                          : "Assign Delivery Partner"}
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="px-5 py-12 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
                    <UserRound size={24} />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    No partner selected
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto leading-5">
                    Select a delivery partner from the list to assign this job.
                  </p>

                  <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-blue-600 font-medium">
                    <span>Select a partner</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignDeliveryPartner;

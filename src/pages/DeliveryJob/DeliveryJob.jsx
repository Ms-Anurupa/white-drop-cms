import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  Package,
  Plus,
  Search,
  Truck,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import deliveryJobStore from "../../zustand/Store/deliveryJobStore";
import { resolveFirebaseUrl } from "../../utils/resolveUrl";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";

const STATUS_FILTERS = [
  "ALL",
  "CREATED",
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

const ALL_STATUSES = [
  "CREATED",
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

const ASSIGNED_STATUSES = [
  "ASSIGNED",
  "PICKED_UP",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

const STATUS_STYLES = {
  CREATED: {
    badge: "bg-blue-50 text-blue-700 border-blue-100",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
  },

  ASSIGNED: {
    badge: "bg-violet-50 text-violet-700 border-violet-100",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
  },

  PICKED_UP: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },

  DELIVERED: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },

  FAILED: {
    badge: "bg-orange-50 text-orange-700 border-orange-100",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },

  CANCELLED: {
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
};

const getAvailableStatuses = (job) => {
  const hasDeliveryPartner = Boolean(job?.deliveryPartner);

  return hasDeliveryPartner ? ASSIGNED_STATUSES : ALL_STATUSES;
};

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || {
    badge: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
    bar: "bg-gray-300",
  };

const getStatusLabel = (status) => {
  switch (status) {
    case "CREATED":
      return "Created";

    case "ASSIGNED":
      return "Assigned";

    case "PICKED_UP":
      return "Picked Up";

    case "DELIVERED":
      return "Delivered";

    case "FAILED":
      return "Failed";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status || "Unknown";
  }
};

const getInitials = (partner) => {
  if (!partner) return "—";

  const f = partner.first_name?.[0] || partner.firstName?.[0] || "";

  const l = partner.last_name?.[0] || partner.lastName?.[0] || "";

  return (f + l).toUpperCase() || "DP";
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const DeliveryJob = () => {
  const navigate = useNavigate();

  const getDeliveryJobs = deliveryJobStore((state) => state.getDeliveryJobs);

  const deliveryJobs = deliveryJobStore((state) => state.deliveryJobs);

  const changeDelijobStatus = deliveryJobStore(
    (state) => state.changeDelijobStatus,
  );

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await getDeliveryJobs();
      } catch (error) {
        console.error("Failed to load delivery jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getDeliveryJobs]);

  const filteredJobs = useMemo(() => {
    return (deliveryJobs || []).filter((job) => {
      const matchesStatus =
        statusFilter === "ALL" || job.status === statusFilter;

      const q = query.trim().toLowerCase();

      const matchesQuery =
        !q ||
        job.name?.toLowerCase().includes(q) ||
        job.area?.toLowerCase().includes(q);

      return matchesStatus && matchesQuery;
    });
  }, [deliveryJobs, statusFilter, query]);

  const totalJobs = deliveryJobs?.length || 0;

  const assignedCount =
    deliveryJobs?.filter((job) => job.deliveryPartner).length || 0;

  const totalOrders =
    deliveryJobs?.reduce(
      (total, job) => total + (job.orders?.length || 0),
      0,
    ) || 0;

  const stats = [
    {
      label: "Total Jobs",
      value: totalJobs,
      icon: Truck,
      tint: "text-slate-900",
      chip: "bg-slate-100",
    },
    {
      label: "Total Assigned Delivery Partner",
      value: assignedCount,
      icon: UserRound,
      tint: "text-violet-600",
      chip: "bg-violet-50",
    },
    {
      label: "Total Assigned Orders",
      value: totalOrders,
      icon: Package,
      tint: "text-emerald-600",
      chip: "bg-emerald-50",
    },
  ];

  const canChangeStatus = (job) => {
    const hasDeliveryPartner = Boolean(job?.deliveryPartner);
    const hasOrders = (job?.orders?.length || 0) > 0;

    return hasDeliveryPartner && hasOrders;
  };

  const isOrderAdditionLocked = (job) => {
    return ["PICKED_UP", "DELIVERED", "FAILED", "CANCELLED"].includes(
      job?.status,
    );
  };

  const getAddOrderDisabledMessage = (job) => {
    if (job?.status === "PICKED_UP") {
      return "Orders cannot be added after the job is picked up.";
    }

    if (job?.status === "DELIVERED") {
      return "Orders cannot be added to a delivered job.";
    }

    if (job?.status === "FAILED") {
      return "Orders cannot be added to a failed job.";
    }

    if (job?.status === "CANCELLED") {
      return "Orders cannot be added to a cancelled job.";
    }

    return "";
  };

  const getStatusDisabledMessage = (job) => {
    const hasDeliveryPartner = Boolean(job?.deliveryPartner);
    const hasOrders = (job?.orders?.length || 0) > 0;

    if (!hasDeliveryPartner && !hasOrders) {
      return "Assign a delivery partner and add at least one order to change the status.";
    }

    if (!hasDeliveryPartner) {
      return "Assign a delivery partner to change the status.";
    }

    if (!hasOrders) {
      return "Add at least one order to change the status.";
    }

    return "";
  };

  const handleStatusChange = async (deliveryJobId, newStatus) => {
    const currentJob = deliveryJobs?.find((job) => job.id === deliveryJobId);

    if (!currentJob) {
      toast.error("Delivery job not found.");
      return;
    }

    if (currentJob.status === newStatus) {
      return;
    }

    if (!canChangeStatus(currentJob)) {
      const message = getStatusDisabledMessage(currentJob);

      toast.warning(message);
      return;
    }

    try {
      setUpdatingStatusId(deliveryJobId);

      const payload = {
        jobId: deliveryJobId,
        status: newStatus,
      };

      console.log("Status payload:", payload);

      await changeDelijobStatus(payload);

      toast.success(
        `Delivery job status changed to ${getStatusLabel(newStatus)}.`,
      );

      await getDeliveryJobs();
    } catch (error) {
      console.error("Failed to update status:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update delivery job status.",
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading Delivery Jobs..." />;
  }

  return (
    <div className="w-full min-h-full bg-slate-50 p-4 sm:p-4 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}

        <div className="relative overflow-hidden rounded-2xl bg-[#3B5CCC] hover:bg-[#334FB3] mb-2 px-6 sm:px-8 py-4">
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.15] pointer-events-none"
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

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/30">
                <Truck size={22} />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Delivery Jobs
                  </h1>

                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    Live
                  </span>
                </div>

                <p className="text-sm text-slate-400 mt-1">
                  Manage delivery jobs and assign delivery partners
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/delivery-job/add-delivery-job")
              }
              className="
                inline-flex items-center justify-center gap-2
                bg-white hover:bg-slate-100
                text-slate-900
                px-5 py-4
                rounded-xl
                text-sm font-semibold
                shadow-sm
                hover:shadow-md
                transition-all duration-200
                cursor-pointer
                whitespace-nowrap
              "
            >
              <Truck size={18} />
              Create New Delivery Job
            </button>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-2">
          {stats.map(({ label, value, icon: Icon, tint, chip }) => (
            <div
              key={label}
              className="bg-white border border-slate-100 rounded-2xl px-6 py-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-slate-500">{label}</p>

                <div
                  className={`w-8 h-8 rounded-lg ${chip} flex items-center justify-center`}
                >
                  <Icon size={15} className={tint} />
                </div>
              </div>

              <p
                className={`text-2xl sm:text-3xl font-bold tabular-nums ${tint}`}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ================= JOB LIST ================= */}

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          {/* List Header + Filters */}

          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Delivery Jobs
              </h2>

              <p className="text-xs text-slate-500 mt-0.5">
                {filteredJobs.length} of {totalJobs} jobs
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by job or area"
                  className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`whitespace-nowrap cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      statusFilter === s
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {s === "ALL" ? "All" : s.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ================= EMPTY STATE ================= */}

          {!filteredJobs?.length ? (
            <div className="py-16 px-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Truck size={25} />
              </div>

              <h3 className="text-base font-semibold text-slate-900">
                {totalJobs
                  ? "No jobs match your filters"
                  : "No delivery jobs yet"}
              </h3>

              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                {totalJobs
                  ? "Try a different search term or clear the status filter."
                  : "Create your first delivery job to start assigning delivery partners."}
              </p>

              {!totalJobs && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/dashboard/delivery-job/add-delivery-job")
                  }
                  className="mt-5 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  <Truck size={17} />
                  Create Delivery Job
                </button>
              )}
            </div>
          ) : (
            /* ================= JOBS ================= */

            <div className="divide-y divide-slate-100">
              {filteredJobs.map((job) => {
                const style = getStatusStyle(job.status);

                const isUpdating = updatingStatusId === job.id;

                const statusChangeAllowed = canChangeStatus(job);

                const statusDisabledMessage = getStatusDisabledMessage(job);

                return (
                  <div
                    key={job.id}
                    className="relative pl-5 pr-5 sm:pl-6 sm:pr-6 py-5 sm:py-6 hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Status accent */}

                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar} opacity-70 group-hover:opacity-100 transition-opacity`}
                    />

                    <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                      {/* ================= MAIN INFO ================= */}

                      <div className="flex-1 min-w-0">
                        {/* Job name + status */}
                        <div className="flex items-center justify-between gap-3 mb-4 w-full">
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 shrink-0">
                            {job.name}
                          </h3>

                          {/* ================= CENTER INFO TEXT ================= */}
                          <div className="flex-1 flex justify-center px-3 min-w-0">
                            {!statusChangeAllowed && (
                              <div className="flex items-center gap-1 text-[10px] text-amber-600 text-center truncate">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="truncate">
                                  {statusDisabledMessage}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* ================= STATUS DROPDOWN (RIGHT) ================= */}
                          <div className="relative flex items-center shrink-0">
                            {isUpdating && (
                              <Loader2
                                size={13}
                                className="absolute left-2.5 text-slate-500 animate-spin pointer-events-none"
                              />
                            )}

                            <select
                              value={job.status}
                              disabled={isUpdating || !statusChangeAllowed}
                              title={
                                !statusChangeAllowed
                                  ? statusDisabledMessage
                                  : "Change delivery job status"
                              }
                              onChange={(e) =>
                                handleStatusChange(job.id, e.target.value)
                              }
                              className={`
        rounded-lg
        border
        px-3
        py-1.5
        text-xs
        font-semibold
        outline-none
        transition-all
        ${statusChangeAllowed ? "cursor-pointer" : "cursor-not-allowed opacity-60"}
        disabled:cursor-not-allowed
        ${
          job.status === "PICKED_UP"
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : job.status === "DELIVERED"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : job.status === "FAILED"
                ? "border-orange-200 bg-orange-50 text-orange-700"
                : job.status === "CANCELLED"
                  ? "border-rose-200 bg-rose-50 text-rose-700"
                  : job.status === "ASSIGNED"
                    ? "border-violet-200 bg-violet-50 text-violet-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
        }
      `}
                            >
                              {getAvailableStatuses(job).map((status) => (
                                <option key={status} value={status}>
                                  {getStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* ================= INFORMATION ================= */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-stretch">
                          {/* Area */}
                          <div className="flex items-start gap-3 p-2.5 -m-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                              <MapPin size={17} className="text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                                Area
                              </p>
                              <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">
                                {job.area || "—"}
                              </p>
                            </div>
                          </div>

                          {/* Date */}
                          <div className="flex items-start gap-3 p-2.5 -m-2.5">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                              <CalendarDays
                                size={17}
                                className="text-slate-500"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                                Delivery Date
                              </p>
                              <p className="text-sm font-medium text-slate-800 mt-0.5">
                                {formatDate(job.deliveryDate)}
                              </p>
                            </div>
                          </div>

                          {/* Slot */}
                          <div className="flex items-start gap-3 p-2.5 -m-2.5">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden">
                              {job.slot?.icon ? (
                                <img
                                  src={resolveFirebaseUrl({
                                    folderName: "public",
                                    fileName: job.slot.icon,
                                  })}
                                  alt={job.slot.name}
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <Clock3 size={17} className="text-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                                Delivery Slot
                              </p>
                              <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">
                                {job.slot?.name || "—"}
                              </p>
                              {job.slot?.from && job.slot?.to && (
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {job.slot.from} - {job.slot.to}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Orders */}
                          <div
                            className={`flex flex-col gap-2 px-2.5 py-2 -m-2.5 rounded-xl border transition-colors duration-200 ${
                              isOrderAdditionLocked(job)
                                ? "border-slate-100 bg-slate-50/50"
                                : "border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/60"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                  isOrderAdditionLocked(job)
                                    ? "bg-slate-100"
                                    : "bg-emerald-50"
                                }`}
                              >
                                <Package
                                  size={17}
                                  className={
                                    isOrderAdditionLocked(job)
                                      ? "text-slate-400"
                                      : "text-emerald-600"
                                  }
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-slate-800 mt-0.5">
                                  {job.orders?.length || 0}{" "}
                                  <span className="text-slate-400 font-normal">
                                    {(job.orders?.length || 0) === 1
                                      ? "order"
                                      : "orders"}
                                  </span>
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              disabled={isOrderAdditionLocked(job)}
                              title={
                                isOrderAdditionLocked(job)
                                  ? getAddOrderDisabledMessage(job)
                                  : "Add order"
                              }
                              onClick={(e) => {
                                e.stopPropagation();

                                if (isOrderAdditionLocked(job)) {
                                  toast.warning(
                                    getAddOrderDisabledMessage(job),
                                  );
                                  return;
                                }

                                navigate(
                                  `/dashboard/delivery-job/${job.id}/add-orders`,
                                  {
                                    state: { job },
                                  },
                                );
                              }}
                              className={`
      w-full
      inline-flex items-center justify-center gap-1.5
      py-1.5 rounded-lg
      text-[11px] font-semibold
      transition-all duration-150

      ${
        isOrderAdditionLocked(job)
          ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] cursor-pointer"
      }
    `}
                            >
                              <Plus size={13} strokeWidth={2.5} />

                              <span>
                                {isOrderAdditionLocked(job)
                                  ? "Orders Locked"
                                  : "Add order"}
                              </span>
                            </button>

                            {isOrderAdditionLocked(job) && (
                              <p className="text-[10px] leading-tight text-slate-400 text-center px-1">
                                {getAddOrderDisabledMessage(job)}
                              </p>
                            )}
                          </div>

                          {/* Delivery Partner */}
                          <div className="flex items-start gap-3 p-2.5 -m-2.5 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/60 transition-colors duration-200">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                                job.deliveryPartner
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {getInitials(job.deliveryPartner)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                                Delivery Partner
                              </p>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <p className="text-sm font-medium text-slate-800 truncate">
                                  {job.deliveryPartner
                                    ? `${job.deliveryPartner.firstName || job.deliveryPartner.first_name || ""} ${
                                        job.deliveryPartner.lastName ||
                                        job.deliveryPartner.last_name ||
                                        ""
                                      }`.trim() || "Assigned"
                                    : "Not Assigned"}
                                </p>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/dashboard/delivery-job/${job.id}/assign-partner`,
                                    );
                                  }}
                                  className="
            shrink-0 inline-flex items-center justify-center
            w-6 h-6 rounded-full
            bg-white border border-violet-200 text-violet-600
            hover:bg-violet-600 hover:text-white hover:border-violet-600
            active:scale-95
            transition-all duration-150 cursor-pointer
          "
                                  title={
                                    job.deliveryPartner
                                      ? "View job"
                                      : "Assign partner"
                                  }
                                >
                                  <ChevronRight size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryJob;

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Loader2,
  MapPin,
  Package,
  Plus,
  RefreshCcw,
  Search,
  Truck,
  UserRound,
  Download,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { resolveFirebaseUrl } from "../../utils/resolveUrl";
import Loader from "../../components/Loader";
import { toast } from "react-toastify";
import deliveryJobStore from "@/zustand/Store/deliveryJobStore";

const DATE_FILTERS = ["TOMORROW", "TODAY", "HISTORY", "ALL"];

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
    badge:
      "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
  },
  ASSIGNED: {
    badge:
      "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border-violet-100 dark:border-violet-800",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
  },
  PICKED_UP: {
    badge:
      "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  DELIVERED: {
    badge:
      "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  FAILED: {
    badge:
      "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },
  CANCELLED: {
    badge:
      "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-100 dark:border-rose-800",
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
    badge:
      "bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-700",
    dot: "bg-gray-400",
    bar: "bg-gray-300 dark:bg-slate-600",
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

  const manualTriggerDeliveryJobs = deliveryJobStore(
    (state) => state.manualTriggerDeliveryJobs,
  );

  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("TOMORROW");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const getDeliveryJobRunSheetPdf = deliveryJobStore((state) => state.getDeliveryJobRunSheetPdf);

  // 1. Fetch from server whenever dateFilter changes
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const filterParam =
          dateFilter === "ALL" ? undefined : dateFilter.toLowerCase();
        await getDeliveryJobs({ filter: filterParam });
      } catch (error) {
        console.error("Failed to load delivery jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [getDeliveryJobs, dateFilter]);

  // 2. Client-side filtering for status and search query
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

  // Updated to count both orders and subscriptions!
  const totalDeliveries =
    deliveryJobs?.reduce(
      (total, job) =>
        total + (job.orders?.length || 0) + (job.subs?.length || 0),
      0,
    ) || 0;

  const stats = [
    {
      label: "Total Jobs",
      value: totalJobs,
      icon: Truck,
      tint: "text-slate-900 dark:text-slate-100",
      chip: "bg-slate-100 dark:bg-slate-800",
    },
    {
      label: "Total Assigned Delivery Partner",
      value: assignedCount,
      icon: UserRound,
      tint: "text-violet-600 dark:text-violet-400",
      chip: "bg-violet-50 dark:bg-violet-950/60",
    },
    {
      label: "Total Assigned Deliveries", // Renamed label
      value: totalDeliveries,
      icon: Package,
      tint: "text-emerald-600 dark:text-emerald-400",
      chip: "bg-emerald-50 dark:bg-emerald-950/60",
    },
  ];

  const canChangeStatus = (job) => {
    const hasDeliveryPartner = Boolean(job?.deliveryPartner);
    const hasTasks =
      (job?.orders?.length || 0) > 0 || (job?.subs?.length || 0) > 0;
    return hasDeliveryPartner && hasTasks;
  };

  const isOrderAdditionLocked = (job) => {
    return ["PICKED_UP", "DELIVERED", "FAILED", "CANCELLED"].includes(
      job?.status,
    );
  };

  const getAddOrderDisabledMessage = (job) => {
    if (job?.status === "PICKED_UP")
      return "Tasks cannot be added after the job is picked up.";
    if (job?.status === "DELIVERED")
      return "Tasks cannot be added to a delivered job.";
    if (job?.status === "FAILED")
      return "Tasks cannot be added to a failed job.";
    if (job?.status === "CANCELLED")
      return "Tasks cannot be added to a cancelled job.";
    return "";
  };

  const getStatusDisabledMessage = (job) => {
    const hasDeliveryPartner = Boolean(job?.deliveryPartner);
    const hasTasks =
      (job?.orders?.length || 0) > 0 || (job?.subs?.length || 0) > 0;

    if (!hasDeliveryPartner && !hasTasks)
      return "Assign a partner and add at least one task to change status.";
    if (!hasDeliveryPartner)
      return "Assign a delivery partner to change the status.";
    if (!hasTasks)
      return "Add at least one delivery task to change the status.";
    return "";
  };

  const handleStatusChange = async (deliveryJobId, newStatus) => {
    const currentJob = deliveryJobs?.find((job) => job.id === deliveryJobId);

    if (!currentJob) {
      toast.error("Delivery job not found.");
      return;
    }
    if (currentJob.status === newStatus) return;

    if (!canChangeStatus(currentJob)) {
      toast.warning(getStatusDisabledMessage(currentJob));
      return;
    }

    try {
      setUpdatingStatusId(deliveryJobId);
      await changeDelijobStatus({ jobId: deliveryJobId, status: newStatus });
      toast.success(
        `Delivery job status changed to ${getStatusLabel(newStatus)}.`,
      );

      // Re-fetch with current date filter
      const filterParam =
        dateFilter === "ALL" ? undefined : dateFilter.toLowerCase();
      await getDeliveryJobs({ filter: filterParam });
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
  
  const handleDownloadJobSheet = async (jobId, jobName, e) => {
    e.stopPropagation(); // Prevent card clicks if you have them

    const toastId = toast.loading("Generating Run Sheet...");

    try {
      const pdfBlob = await getDeliveryJobRunSheetPdf(jobId);

      if (!pdfBlob) {
        throw new Error("PDF data is empty.");
      }

      // Ensure we have a Blob
      const blob = pdfBlob instanceof Blob
          ? pdfBlob
          : new Blob([pdfBlob], { type: "application/pdf" });

      // Create a temporary URL
      const pdfUrl = window.URL.createObjectURL(blob);

      // Open the PDF in a new tab
      window.open(pdfUrl, "_blank", "noopener,noreferrer");
      
      // Cleanup the URL object after a minute to free memory
      setTimeout(() => {
        window.URL.revokeObjectURL(pdfUrl);
      }, 60000);

      toast.update(toastId, { 
        render: "Run Sheet generated successfully!", 
        type: "success", 
        isLoading: false, 
        autoClose: 2000 
      });

    } catch (error) {
      toast.dismiss();
      
      // Handle the IDM extension hijack
      if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
        toast.success("Download started via Download Manager.", { autoClose: 3000 });
      } else {
        console.error("Failed to generate Run Sheet PDF:", error);
        toast.error("Failed to generate the run sheet.");
      }
    }
  };

  if (loading && !deliveryJobs) {
    return <Loader text="Loading Delivery Jobs..." />;
  }

  return (
    <div className="w-full min-h-full bg-slate-50 dark:bg-slate-950 p-4 sm:p-4 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden rounded-2xl bg-[#3B5CCC] hover:bg-[#334FB3] dark:bg-slate-900 dark:hover:bg-slate-900 dark:border dark:border-slate-800 mb-2 px-6 sm:px-8 py-4 cursor-default">
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
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full cursor-default">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                    </span>
                    Live
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1 cursor-default">
                  Manage delivery jobs and assign delivery partners
                </p>
              </div>
            </div>
            <button
              onClick={() => manualTriggerDeliveryJobs()}
              className="h-8 cursor-pointer px-4 flex items-center gap-2 rounded-lg shrink-0 bg-white dark:bg-slate-800 text-black dark:text-slate-100 text-sm hover:bg-blue-400 dark:hover:bg-slate-700 dark:border dark:border-slate-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCcw size={16} />
              Regenerate Deli jobs for today
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/dashboard/delivery-job/add-delivery-job")
              }
              className="inline-flex items-center justify-center gap-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 dark:border dark:border-slate-700 px-5 py-4 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer whitespace-nowrap"
            >
              <Truck size={18} />
              Create New Delivery Job
            </button>
          </div>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-2 cursor-default">
          {stats.map(({ label, value, icon: Icon, tint, chip }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {label}
                </p>
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
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          {/* List Header + Double Filters Row */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="cursor-default">
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  Delivery Jobs
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {filteredJobs.length} of {totalJobs} jobs
                </p>
              </div>

              {/* SEARCH & DATE FILTERS (Server-side) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by job or area"
                    className="cursor-text w-full sm:w-56 pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-1 cursor-default">
                    Date:
                  </span>
                  {DATE_FILTERS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDateFilter(d)}
                      className={`whitespace-nowrap cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        dateFilter === d
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400"
                      }`}
                    >
                      {d === "ALL"
                        ? "All Dates"
                        : d.charAt(0) + d.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STATUS FILTERS (Client-side) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-50 dark:border-slate-800">
              <span className="text-xs text-slate-400 dark:text-slate-500 font-medium px-1 cursor-default">
                Status:
              </span>
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`whitespace-nowrap cursor-pointer px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    statusFilter === s
                      ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                      : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}
                >
                  {s === "ALL" ? "All Statuses" : s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* ================= EMPTY STATE ================= */}
          {loading ? (
            <div className="py-16 px-6 flex justify-center">
              <Loader2 className="animate-spin text-blue-500" size={30} />
            </div>
          ) : !filteredJobs?.length ? (
            <div className="py-16 px-6 text-center cursor-default">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                <Truck size={25} />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {totalJobs
                  ? "No jobs match your filters"
                  : "No delivery jobs found"}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {totalJobs
                  ? "Try a different search term or clear the status/date filter."
                  : "Create your first delivery job to start assigning delivery partners."}
              </p>
            </div>
          ) : (
            /* ================= JOBS ================= */
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredJobs.map((job) => {
                const style = getStatusStyle(job.status);
                const isUpdating = updatingStatusId === job.id;
                const statusChangeAllowed = canChangeStatus(job);
                const statusDisabledMessage = getStatusDisabledMessage(job);

                return (
                  <div
                    key={job.id}
                    className="relative pl-5 pr-5 sm:pl-6 sm:pr-6 py-5 sm:py-6 hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors group"
                  >
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar} opacity-70 group-hover:opacity-100 transition-opacity`}
                    />
                    <div className="flex flex-col gap-4">
                      {/* ================= JOB CARD HEADER (Refactored for Responsiveness) ================= */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 w-full">
                        {/* Title and Download Button side */}
                        <div className="flex items-center justify-between md:justify-start gap-4">
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 shrink-0 truncate cursor-default">
                            {job.name}
                          </h3>
                        </div>

                        {/* Status Select & Download Button side */}
                        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                          {/* New Download Job Sheet Button */}
                          <button
                            type="button"
                            title="Download Job Sheet"
                            onClick={(e) => handleDownloadJobSheet(job.id, job.name, e)}
                            className="cursor-pointer inline-flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800 shadow-sm transition-all"
                          >
                            <Download size={14} className="sm:mr-1.5" />
                            <span className="hidden sm:inline text-xs font-semibold">
                              Sheet
                            </span>
                          </button>

                          {/* Status Dropdown */}
                          <div className="relative flex items-center shrink-0">
                            {isUpdating && (
                              <Loader2
                                size={13}
                                className="absolute left-2.5 text-slate-500 dark:text-slate-400 animate-spin pointer-events-none"
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
                                rounded-lg border px-3 py-1.5 text-xs font-semibold outline-none transition-all
                                ${
                                  statusChangeAllowed
                                    ? "cursor-pointer"
                                    : "cursor-not-allowed opacity-60"
                                }
                                disabled:cursor-not-allowed
                                ${
                                  job.status === "PICKED_UP"
                                    ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                                    : job.status === "DELIVERED"
                                      ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                                      : job.status === "FAILED"
                                        ? "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300"
                                        : job.status === "CANCELLED"
                                          ? "border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                                          : job.status === "ASSIGNED"
                                            ? "border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300"
                                            : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                                }
                              `}
                            >
                              {getAvailableStatuses(job).map((status) => (
                                <option
                                  key={status}
                                  value={status}
                                  className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                                >
                                  {getStatusLabel(status)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Warning message detached from top flex row to prevent crowding */}
                      {!statusChangeAllowed && (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-md w-fit max-w-full cursor-default">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span className="truncate">
                            {statusDisabledMessage}
                          </span>
                        </div>
                      )}

                      {/* ================= INFORMATION GRID (Refactored for Responsiveness) ================= */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch cursor-default mt-2">
                        {/* Area */}
                        <div className="flex items-start gap-3 p-2">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <MapPin
                              size={17}
                              className="text-slate-500 dark:text-slate-400"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                              Area
                            </p>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                              {job.area || "—"}
                            </p>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-start gap-3 p-2">
                          <div className="w-9 h-9 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <CalendarDays
                              size={17}
                              className="text-slate-500 dark:text-slate-400"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                              Delivery Date
                            </p>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                              {formatDate(job.deliveryDate)}
                            </p>
                          </div>
                        </div>

                        {/* Slot */}
                        <div className="flex items-start gap-3 p-2">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 overflow-hidden">
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
                              <Clock3
                                size={17}
                                className="text-blue-600 dark:text-blue-400"
                              />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                              Delivery Slot
                            </p>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                              {job.slot?.name || "—"}
                            </p>
                            {job.slot?.from && job.slot?.to && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                {job.slot.from} - {job.slot.to}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Orders */}
                        <div
                          className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors duration-200 ${
                            isOrderAdditionLocked(job)
                              ? "border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
                              : "border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/30"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                isOrderAdditionLocked(job)
                                  ? "bg-slate-100 dark:bg-slate-800"
                                  : "bg-emerald-50 dark:bg-emerald-950/60"
                              }`}
                            >
                              <Package
                                size={17}
                                className={
                                  isOrderAdditionLocked(job)
                                    ? "text-slate-400 dark:text-slate-500"
                                    : "text-emerald-600 dark:text-emerald-400"
                                }
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                                {job.orders?.length || 0}{" "}
                                <span className="text-slate-400 dark:text-slate-500 font-normal">
                                  {(job.orders?.length || 0) === 1
                                    ? "order"
                                    : "orders"}
                                </span>
                              </p>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                                {job.subs?.length || 0}{" "}
                                <span className="text-slate-400 dark:text-slate-500 font-normal">
                                  {(job.subs?.length || 0) === 1
                                    ? "subscription"
                                    : "subs"}
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
                                toast.warning(getAddOrderDisabledMessage(job));
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
        w-full inline-flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150
        ${
          isOrderAdditionLocked(job)
            ? "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed"
            : "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] cursor-pointer"
        }
      `}
                          >
                            <Plus size={13} strokeWidth={2.5} />
                            <span>
                              {isOrderAdditionLocked(job)
                                ? "Tasks Locked"
                                : "Add Task"}
                            </span>
                          </button>
                        </div>

                        {/* Delivery Partner */}
                        <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 hover:bg-violet-50/60 dark:hover:bg-violet-950/30 transition-colors duration-200">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                              job.deliveryPartner
                                ? "bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300"
                                : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {getInitials(job.deliveryPartner)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                              Delivery Partner
                            </p>
                            <div className="flex items-center justify-between gap-2 mt-0.5">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
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
            cursor-pointer
            shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full
            bg-white dark:bg-slate-800 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400
            hover:bg-violet-600 hover:text-white hover:border-violet-600
            active:scale-95 transition-all duration-150
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

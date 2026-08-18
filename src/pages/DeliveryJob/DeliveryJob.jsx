import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Package,
  Search,
  Truck,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import deliveryJobStore from "../../zustand/Store/deliveryJobStore";
import { getIconUrl } from "../../utils/resolveProductUrl";

const STATUS_FILTERS = [
  "ALL",
  "CREATED",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
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
  IN_PROGRESS: {
    badge: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  COMPLETED: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  CANCELLED: {
    badge: "bg-rose-50 text-rose-700 border-rose-100",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
};

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || {
    badge: "bg-gray-50 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
    bar: "bg-gray-300",
  };

const getInitials = (partner) => {
  if (!partner) return "—";
  const f = partner.first_name?.[0] || "";
  const l = partner.last_name?.[0] || "";
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
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    getDeliveryJobs();
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
  const createdCount =
    deliveryJobs?.filter((job) => job.status === "CREATED").length || 0;
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
      label: "Created",
      value: createdCount,
      icon: Clock3,
      tint: "text-blue-600",
      chip: "bg-blue-50",
    },
    {
      label: "Assigned",
      value: assignedCount,
      icon: UserRound,
      tint: "text-violet-600",
      chip: "bg-violet-50",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: Package,
      tint: "text-emerald-600",
      chip: "bg-emerald-50",
    },
  ];

  return (
    <div className="w-full min-h-full bg-slate-50 p-4 sm:p-4 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden rounded-2xl bg-[#3B5CCC] hover:bg-[#334FB3] mb-2 px-6 sm:px-8 py-4">
          {/* signature route-line */}
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

            {/* Add Button */}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
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

          {/* Empty State */}
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
            <div className="divide-y divide-slate-100">
              {filteredJobs.map((job) => {
                const style = getStatusStyle(job.status);
                return (
                  <div
                    key={job.id}
                    className="relative pl-5 pr-5 sm:pl-6 sm:pr-6 py-5 sm:py-6 hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* status accent bar */}
                    <span
                      className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar} opacity-70 group-hover:opacity-100 transition-opacity`}
                    />

                    <div className="flex flex-col xl:flex-row xl:items-center gap-5">
                      {/* ================= MAIN INFO ================= */}
                      <div className="flex-1 min-w-0">
                        {/* Job name + status */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900">
                            {job.name}
                          </h3>

                          <span
                            className={`
                              inline-flex items-center gap-1.5
                              px-2.5 py-1
                              rounded-full
                              text-[11px]
                              font-semibold
                              border
                              ${style.badge}
                            `}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${style.dot}`}
                            />
                            {job.status}
                          </span>
                        </div>

                        {/* Information */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Area */}
                          <div className="flex items-start gap-3">
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
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                              <CalendarDays
                                size={17}
                                className="text-slate-500"
                              />
                            </div>

                            <div>
                              <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                                Delivery Date
                              </p>

                              <p className="text-sm font-medium text-slate-800 mt-0.5">
                                {formatDate(job.deliveryDate)}
                              </p>
                            </div>
                          </div>

                          {/* Slot */}
                          <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 overflow-hidden">
                              {job.slot?.icon ? (
                                <img
                                  src={getIconUrl(job.slot.icon)}
                                  alt={job.slot.name}
                                  className="w-6 h-6 object-contain"
                                />
                              ) : (
                                <Clock3 size={17} className="text-blue-600" />
                              )}
                            </div>

                            <div>
                              <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                                Delivery Slot
                              </p>

                              <p className="text-sm font-medium text-slate-800 mt-0.5">
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
                          {/* Orders */}
                          <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-colors">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                              <Package size={16} className="text-slate-500" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                                Orders
                              </p>

                              <div className="flex items-center justify-between gap-2 mt-1">
                                <p className="text-sm font-semibold text-slate-800">
                                  {job.orders?.length || 0}
                                </p>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/dashboard/delivery-job/${job.id}/add-orders`,
                                      {
                                        state: { job },
                                      },
                                    );
                                  }}
                                  className="
          inline-flex items-center gap-1
          px-2 py-1
          rounded-lg
          bg-blue-50
          border border-blue-100
          text-blue-600
          hover:bg-blue-100
          hover:border-blue-200
          text-[10px]
          font-bold
          transition-all
          cursor-pointer
        "
                                >
                                  <span className="text-sm leading-none">
                                    +
                                  </span>
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ================= RIGHT ACTION ================= */}
                      <div className="xl:w-60 shrink-0">
                        <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/70">
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold ${
                                job.deliveryPartner
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {getInitials(job.deliveryPartner)}
                            </div>

                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                                Delivery Partner
                              </p>

                              <p className="text-sm font-medium text-slate-800 truncate mt-0.5">
                                {job.deliveryPartner
                                  ? `${job.deliveryPartner.firstName || ""} ${
                                      job.deliveryPartner.lastName || ""
                                    }`.trim() || "Assigned"
                                  : "Not Assigned"}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/dashboard/delivery-job/${job.id}/assign-partner`,
                              )
                            }
                            className="
                              w-full
                              cursor-pointer
                              flex items-center justify-center gap-2
                              px-3 py-2.5
                              rounded-lg
                              bg-white
                              border border-slate-200
                              hover:border-blue-300
                              hover:text-blue-600
                              text-slate-700
                              text-xs font-semibold
                              transition-all
                            "
                          >
                            {job.deliveryPartner
                              ? "View Job"
                              : "Assign Partner"}
                            <ChevronRight size={15} />
                          </button>
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

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock3,
  Package,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import deliveryJobStore from "../../zustand/Store/deliveryJobStore";
import Loader from "../../components/Loader";

const PAGE_SIZE = 6;

const STATUS_LABELS = {
  CREATED: "Created",
  ASSIGNED: "Assigned",
  PICKED_UP: "Picked Up",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

const statusMeta = {
  CREATED: {
    dot: "bg-slate-400",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    bar: "bg-slate-400",
    text: "text-slate-600",
  },

  ASSIGNED: {
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    bar: "bg-violet-500",
    text: "text-violet-600",
  },

  PICKED_UP: {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    bar: "bg-blue-500",
    text: "text-blue-600",
  },

  DELIVERED: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  },

  FAILED: {
    dot: "bg-orange-500",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    bar: "bg-orange-500",
    text: "text-orange-600",
  },

  CANCELLED: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    bar: "bg-rose-500",
    text: "text-rose-600",
  },
};

const getStatusMeta = (status) => statusMeta[status] || statusMeta.CREATED;

const getStatusLabel = (status) => STATUS_LABELS[status] || status || "Unknown";

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getPartnerName = (partner) => {
  if (!partner) return "Not Assigned";

  return (
    `${partner.firstName || partner.first_name || ""} ${
      partner.lastName || partner.last_name || ""
    }`.trim() || "Assigned"
  );
};

const getPartnerInitials = (partner) => {
  if (!partner) return "—";

  const first = partner.firstName?.[0] || "";

  const last = partner.lastName?.[0] || "";

  return `${first}${last}`.toUpperCase() || "DP";
};

const DeliveryCard = ({ job }) => {
  const navigate = useNavigate();

  const meta = getStatusMeta(job.status);

  const partnerName = getPartnerName(job.deliveryPartner);

  const partnerInitials = getPartnerInitials(job.deliveryPartner);

  const orders = job.orders || [];

  const ordersCount = orders.length;

  const pickedUpCount = orders.filter(
    (order) => order.orderStatus === "PICKED_UP",
  ).length;

  const deliveredCount = orders.filter(
    (order) => order.orderStatus === "DELIVERED",
  ).length;

  // Delivered orders / Total assigned orders
  const deliveryPercentage =
    ordersCount > 0 ? Math.round((deliveredCount / ordersCount) * 100) : 0;

  const handleTrack = () => {
    navigate(`/location-tracker/${job.deliveryPartnerId}`, {
      state: { job },
    });
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-0.5">
            Job #{job.serialNumber || "—"}
          </p>

          <h3 className="font-semibold text-gray-900 text-sm truncate">
            {job.name || "Delivery Job"}
          </h3>
        </div>

        <span
          className={`
            shrink-0
            inline-flex
            items-center
            gap-1.5
            px-2.5
            py-1
            rounded-full
            text-[11px]
            font-semibold
            border
            ${meta.badge}
          `}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />

          {getStatusLabel(job.status)}
        </span>
      </div>

      {/* Job Details */}
      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <MapPin size={13} className="shrink-0 text-slate-400" />

          <span className="truncate">{job.area || "—"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Clock3 size={13} className="shrink-0 text-slate-400" />

          <span>{formatDate(job.deliveryDate)}</span>
        </div>

        <div className="flex items-center gap-2">
          <Truck size={13} className="shrink-0 text-slate-400" />

          <span>
            {job.slot?.name || "—"}

            {job.slot?.from && job.slot?.to && (
              <span className="ml-1 text-xs text-slate-400">
                ({job.slot.from} - {job.slot.to})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Delivery Partner */}
      <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
        <div
          className={`
            w-9
            h-9
            rounded-full
            flex
            items-center
            justify-center
            shrink-0
            text-[11px]
            font-bold
            ${
              job.deliveryPartner
                ? "bg-violet-100 text-violet-700"
                : "bg-slate-200 text-slate-500"
            }
          `}
        >
          {partnerInitials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">
            Delivery Partner
          </p>

          <p className="text-sm font-medium text-slate-800 truncate">
            {partnerName}
          </p>
        </div>
      </div>

      {/* Orders */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Package size={15} className="text-blue-600" />
          </div>

          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
              Assigned Orders
            </p>

            <p className="text-sm font-semibold text-slate-800">
              {ordersCount}
            </p>
          </div>
        </div>

        {ordersCount > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
              Order Value
            </p>

            <p className="text-sm font-semibold text-slate-800">
              ₹
              {orders
                .reduce(
                  (total, order) => total + Number(order.orderTotal || 0),
                  0,
                )
                .toFixed(2)}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-100 p-3 bg-white">
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Picked Up */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />

            <p className="text-xs text-slate-500">
              Picked Up{" "}
              <span className="font-semibold text-slate-800">
                {pickedUpCount}
              </span>
            </p>
          </div>

          {/* Delivered */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />

            <p className="text-xs text-slate-500">
              Delivered{" "}
              <span className="font-semibold text-slate-800">
                {deliveredCount}
              </span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-1">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{
              width: `${deliveryPercentage}%`,
            }}
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-slate-400">
            {deliveredCount} of {ordersCount} orders delivered
          </span>

          <span className="text-[10px] font-semibold text-emerald-600">
            {deliveryPercentage}%
          </span>
        </div>

        <button
          type="button"
          onClick={handleTrack}
          className="
            w-full
            inline-flex
            items-center
            justify-center
            gap-1.5
            py-2
            rounded-lg
            bg-blue-600
            text-white
            text-xs
            font-semibold
            hover:bg-blue-700
            active:scale-[0.98]
            transition-all
            duration-150
            cursor-pointer
          "
        >
          <Truck size={13} />
          Track
        </button>
      </div>

      {/* Job Progress */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <span className="text-xs font-semibold text-emerald-600">
          {deliveryPercentage}% orders delivered
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({ label, value, Icon, iconClass, bgClass }) => (
  <div className="bg-white border border-slate-100 rounded-xl shadow-sm px-4 py-4 flex items-center gap-4">
    <div
      className={`
        w-10
        h-10
        rounded-lg
        flex
        items-center
        justify-center
        shrink-0
        ${bgClass}
      `}
    >
      <Icon size={18} className={iconClass} />
    </div>

    <div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>

      <p className="text-2xl font-semibold text-gray-900 leading-tight">
        {value}
      </p>
    </div>
  </div>
);

/* =========================================================
   MAIN COMPONENT
========================================================= */

const Deliveries = () => {
  const getDeliveryJobs = deliveryJobStore((state) => state.getDeliveryJobs);

  const deliveryJobs = deliveryJobStore((state) => state.deliveryJobs);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  /* =======================================================
     FETCH DELIVERY JOBS
  ======================================================= */

  useEffect(() => {
    const loadDeliveryJobs = async () => {
      try {
        setLoading(true);

        await getDeliveryJobs();
      } catch (error) {
        console.error("Failed to load delivery jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDeliveryJobs();
  }, [getDeliveryJobs]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredData = useMemo(() => {
    const jobs = deliveryJobs || [];

    const q = search.trim().toLowerCase();

    return jobs.filter((job) => {
      // Only show PICKED_UP jobs
      if (job.status !== "PICKED_UP") {
        return false;
      }

      const matchesSearch =
        !q ||
        job.id?.toLowerCase().includes(q) ||
        job.name?.toLowerCase().includes(q) ||
        job.area?.toLowerCase().includes(q) ||
        getPartnerName(job.deliveryPartner).toLowerCase().includes(q);

      return matchesSearch;
    });
  }, [deliveryJobs, search]);

  /* =======================================================
     PAGINATION
  ======================================================= */

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE) || 1;

  const currentData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  /* =======================================================
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    const jobs = deliveryJobs || [];

    return {
      total: jobs.length,

      delivered: jobs.filter((job) => job.status === "DELIVERED").length,

      outForDelivery: jobs.filter((job) => job.status === "PICKED_UP").length,

      assigned: jobs.filter((job) => job.status === "ASSIGNED").length,

      pending: jobs.filter((job) => job.status === "CREATED").length,

      totalOrders: jobs.reduce(
        (total, job) => total + (job.orders?.length || 0),
        0,
      ),
    };
  }, [deliveryJobs]);

  if (loading) {
    return <Loader text="Loading Delivery Tracking..." />;
  }

  return (
    <div className="p-6 md:p-6 space-y-2">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Delivery Tracking
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Track and manage all delivery jobs
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search job, area or partner..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="
              w-full
              bg-white
              border
              border-gray-200
              rounded-lg
              py-2
              pl-9
              pr-3
              text-sm
              outline-none
              focus:ring-2
              focus:ring-blue-500/30
              focus:border-blue-400
            "
          />
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
        <StatCard
          label="Total Jobs"
          value={stats.total}
          Icon={Package}
          iconClass="text-slate-600"
          bgClass="bg-slate-100"
        />

        <StatCard
          label="Picked Up"
          value={stats.outForDelivery}
          Icon={Truck}
          iconClass="text-blue-600"
          bgClass="bg-blue-50"
        />

        <StatCard
          label="Delivered"
          value={stats.delivered}
          Icon={CheckCircle2}
          iconClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
      </div>

      {/* ===================================================
          CARDS
      =================================================== */}

      {currentData.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No delivery jobs match your search.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentData.map((job) => (
            <DeliveryCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* ===================================================
          PAGINATION
      =================================================== */}

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          {filteredData.length === 0
            ? "No results"
            : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(
                page * PAGE_SIZE,
                filteredData.length,
              )} of ${filteredData.length}`}
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="
              w-8
              h-8
              cursor-pointer
              rounded-lg
              bg-white
              border
              border-gray-200
              flex
              items-center
              justify-center
              disabled:opacity-40
              disabled:cursor-not-allowed
              hover:bg-gray-50
              transition-colors
            "
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          <span className="text-sm font-medium text-gray-700 min-w-[52px] text-center">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="
              w-8
              h-8
              cursor-pointer
              rounded-lg
              bg-white
              border
              border-gray-200
              flex
              items-center
              justify-center
              disabled:opacity-40
              disabled:cursor-not-allowed
              hover:bg-gray-50
              transition-colors
            "
            aria-label="Next page"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Deliveries;

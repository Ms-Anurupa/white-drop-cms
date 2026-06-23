import { useState } from "react";
import {
  Search,
  Truck,
  CheckCircle2,
  Clock3,
  Package,
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CircleDot,
  Warehouse,
} from "lucide-react";

const PAGE_SIZE = 6;

const deliveriesData = [
  {
    id: "ORD-1001",
    customer: "Rahul Sharma",
    phone: "+91 9876543210",
    address: "Salt Lake, Kolkata",
    rider: "Arjun Das",
    status: "Out for Delivery",
    eta: "30 mins",
    progress: 75,
  },
  {
    id: "ORD-1002",
    customer: "Priya Sen",
    phone: "+91 9830011223",
    address: "New Town, Kolkata",
    rider: "Amit Roy",
    status: "Delivered",
    eta: "Completed",
    progress: 100,
  },
  {
    id: "ORD-1003",
    customer: "Sourav Paul",
    phone: "+91 9123456789",
    address: "Howrah",
    rider: "Rakesh Gupta",
    status: "Pending",
    eta: "2 hrs",
    progress: 20,
  },
  {
    id: "ORD-1004",
    customer: "Ananya Dey",
    phone: "+91 9988776655",
    address: "Park Street",
    rider: "Vikash Singh",
    status: "Delivered",
    eta: "Completed",
    progress: 100,
  },
  {
    id: "ORD-1005",
    customer: "Abhishek Ghosh",
    phone: "+91 9012345678",
    address: "Dum Dum",
    rider: "Raj Kumar",
    status: "Out for Delivery",
    eta: "45 mins",
    progress: 80,
  },
  {
    id: "ORD-1006",
    customer: "Sneha Das",
    phone: "+91 9345678901",
    address: "Behala",
    rider: "Ankit Roy",
    status: "Pending",
    eta: "3 hrs",
    progress: 10,
  },
  {
    id: "ORD-1007",
    customer: "Rina Mukherjee",
    phone: "+91 9871234567",
    address: "Barrackpore",
    rider: "Deepak Singh",
    status: "Delivered",
    eta: "Completed",
    progress: 100,
  },
];

/* ── tracking steps ──────────────────────────────────────────────────────── */
const STEPS = [
  { label: "Ordered", Icon: ClipboardList, threshold: 0 },
  { label: "Processing", Icon: Warehouse, threshold: 25 },
  { label: "En Route", Icon: Truck, threshold: 50 },
  { label: "Nearby", Icon: CircleDot, threshold: 80 },
  { label: "Delivered", Icon: CheckCircle2, threshold: 100 },
];

const statusMeta = {
  Delivered: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bar: "bg-emerald-500",
  },
  "Out for Delivery": {
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    bar: "bg-blue-500",
  },
  Pending: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-400",
  },
};

/* ── TrackingTimeline ────────────────────────────────────────────────────── */
const TrackingTimeline = ({ progress, status }) => {
  const meta = statusMeta[status];

  const activeIndex = STEPS.findLastIndex((step) => progress >= step.threshold);

  return (
    <div className="mt-4">
      <div className="relative flex items-center justify-between mb-3">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-100" />

        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 transition-all duration-700 ${meta.bar}`}
          style={{ width: `${progress}%` }}
        />

        {STEPS.map((step, i) => {
          const done = progress >= step.threshold;
          const Icon = step.Icon;

          return (
            <div
              key={step.label}
              className="relative z-10 flex flex-col items-center"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all
                ${
                  done
                    ? `${meta.bar} border-transparent text-white`
                    : "bg-white border-slate-200 text-slate-300"
                }
                ${activeIndex === i ? "ring-2 ring-offset-1 ring-blue-300" : ""}
                `}
              >
                <Icon size={12} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between">
        {STEPS.map((step) => (
          <span
            key={step.label}
            className={`text-[10px] font-medium w-12 text-center leading-tight ${
              progress >= step.threshold ? "text-gray-700" : "text-gray-300"
            }`}
          >
            {step.label}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── DeliveryCard ────────────────────────────────────────────────────────── */
const DeliveryCard = ({ item }) => {
  const meta = statusMeta[item.status] || statusMeta["Pending"];

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col gap-4">
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-0.5">
            {item.id}
          </p>
          <h3 className="font-semibold text-gray-900 text-sm">
            {item.customer}
          </h3>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
          {item.status}
        </span>
      </div>

      {/* details */}
      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Phone size={13} className="shrink-0 text-slate-400" />
          <span>{item.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={13} className="shrink-0 text-slate-400" />
          <span>{item.address}</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck size={13} className="shrink-0 text-slate-400" />
          <span>{item.rider}</span>
        </div>
      </div>

      {/* tracking timeline */}
      <TrackingTimeline progress={item.progress} status={item.status} />

      {/* ETA footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <span className="text-xs text-slate-400 font-medium">
          {item.progress}% complete
        </span>
        <span
          className={`text-xs font-semibold ${
            item.status === "Delivered"
              ? "text-emerald-600"
              : item.status === "Out for Delivery"
                ? "text-blue-600"
                : "text-amber-600"
          }`}
        >
          ETA: {item.eta}
        </span>
      </div>
    </div>
  );
};

/* ── StatCard ────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, Icon, iconClass, bgClass }) => (
  <div className="bg-white border border-slate-100 rounded-xl shadow-sm px-4 py-4 flex items-center gap-4">
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${bgClass}`}
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

/* ── Deliveries (main) ───────────────────────────────────────────────────── */
const Deliveries = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("All");

  const FILTERS = ["All", "Pending", "Out for Delivery", "Delivered"];

  const filteredData = deliveriesData.filter((item) => {
    const q = search.toLowerCase();

    return (
      (item.id.toLowerCase().includes(q) ||
        item.customer.toLowerCase().includes(q)) &&
      (activeFilter === "All" || item.status === activeFilter)
    );
  });

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE) || 1;
  const currentData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = {
    total: deliveriesData.length,
    delivered: 0,
    outForDelivery: 0,
    pending: 0,
  };

  deliveriesData.forEach((item) => {
    if (item.status === "Delivered") stats.delivered++;
    else if (item.status === "Out for Delivery") stats.outForDelivery++;
    else stats.pending++;
  });

  return (
    <div className=" px-4 md:px-4 space-y-2">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Delivery Tracking
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track and manage all active deliveries
          </p>
        </div>

        <div className="relative w-full lg:w-72">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search order or customer…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard
          label="Total Orders"
          value={stats.total}
          Icon={Package}
          iconClass="text-slate-600"
          bgClass="bg-slate-100"
        />
        <StatCard
          label="Delivered"
          value={stats.delivered}
          Icon={CheckCircle2}
          iconClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <StatCard
          label="Out for Delivery"
          value={stats.outForDelivery}
          Icon={Truck}
          iconClass="text-blue-600"
          bgClass="bg-blue-50"
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          Icon={Clock3}
          iconClass="text-amber-600"
          bgClass="bg-amber-50"
        />
      </div>

      {/* ── FILTER TABS ── */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setActiveFilter(f);
              setPage(1);
            }}
            className={[
              "px-3.5 py-1.5 cursor-pointer rounded-lg text-sm font-medium border transition-colors",
              activeFilter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-800",
            ].join(" ")}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── CARDS ── */}
      {currentData.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          No deliveries match your search.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {currentData.map((item) => (
            <DeliveryCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* ── PAGINATION ── */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          {filteredData.length === 0
            ? "No results"
            : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filteredData.length)} of ${filteredData.length}`}
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[52px] text-center">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50 transition-colors"
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

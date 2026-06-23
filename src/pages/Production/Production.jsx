import { useState } from "react";
import {
  Search,
  Plus,
  Factory,
  Package,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
} from "lucide-react";

const PAGE_SIZE = 5;

const initialProduction = [
  {
    id: "PROD-1001",
    product: "Milk 1L",
    batch: "B-24001",
    quantity: 1200,
    status: "In Progress",
    shift: "Morning",
    startDate: "23 Jun 2026",
  },
  {
    id: "PROD-1002",
    product: "Butter 500g",
    batch: "B-24002",
    quantity: 650,
    status: "Completed",
    shift: "Afternoon",
    startDate: "22 Jun 2026",
  },
  {
    id: "PROD-1003",
    product: "Paneer 200g",
    batch: "B-24003",
    quantity: 400,
    status: "Pending",
    shift: "Night",
    startDate: "23 Jun 2026",
  },
  {
    id: "PROD-1004",
    product: "Curd 500g",
    batch: "B-24004",
    quantity: 900,
    status: "Completed",
    shift: "Morning",
    startDate: "21 Jun 2026",
  },
  {
    id: "PROD-1005",
    product: "Cheese Slice",
    batch: "B-24005",
    quantity: 750,
    status: "In Progress",
    shift: "Afternoon",
    startDate: "23 Jun 2026",
  },
  {
    id: "PROD-1006",
    product: "Ghee 1L",
    batch: "B-24006",
    quantity: 320,
    status: "Pending",
    shift: "Night",
    startDate: "24 Jun 2026",
  },
];

const filters = ["All", "Pending", "In Progress", "Completed"];

const statusColor = {
  Pending: "bg-amber-100 text-amber-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

const StatCard = ({ label, value, Icon, iconColor, bg }) => (
  <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-slate-100">
    <div
      className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}
    >
      <Icon className={iconColor} size={22} />
    </div>

    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const Production = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filteredData = initialProduction.filter(
    (item) =>
      (item.product.toLowerCase().includes(search.toLowerCase()) ||
        item.batch.toLowerCase().includes(search.toLowerCase())) &&
      (activeFilter === "All" || item.status === activeFilter),
  );

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const currentData = filteredData.slice(start, start + PAGE_SIZE);

  const stats = {
    total: initialProduction.length,
    progress: initialProduction.filter((i) => i.status === "In Progress")
      .length,
    completed: initialProduction.filter((i) => i.status === "Completed").length,
    pending: initialProduction.filter((i) => i.status === "Pending").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Production Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Monitor and manage production batches
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-52">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products…"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              className="w-full cursor-pointer sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={15} />
              New Batch
            </button>

            <button
              className="w-full cursor-pointer sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Download size={15} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Batches"
          value={stats.total}
          Icon={Package}
          iconColor="text-slate-700"
          bg="bg-slate-100"
        />

        <StatCard
          label="In Progress"
          value={stats.progress}
          Icon={Factory}
          iconColor="text-blue-600"
          bg="bg-blue-100"
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          Icon={CheckCircle2}
          iconColor="text-green-600"
          bg="bg-green-100"
        />

        <StatCard
          label="Pending"
          value={stats.pending}
          Icon={Clock3}
          iconColor="text-amber-600"
          bg="bg-amber-100"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setActiveFilter(filter);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition
            ${
              activeFilter === filter
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-200 text-gray-600 hover:bg-slate-100"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-slate-50">
              <tr className="text-sm text-gray-500">
                <th className="text-left p-5">Batch ID</th>
                <th className="text-left p-5">Product</th>
                <th className="text-left p-5">Quantity</th>
                <th className="text-left p-5">Shift</th>
                <th className="text-left p-5">Start Date</th>
                <th className="text-left p-5">Status</th>
                <th className="text-left p-5">Action</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition border-t border-slate-100"
                >
                  <td className="p-5 font-semibold">{item.batch}</td>

                  <td className="p-5">{item.product}</td>

                  <td className="p-5">{item.quantity} Units</td>

                  <td className="p-5">{item.shift}</td>

                  <td className="p-5">{item.startDate}</td>

                  <td className="p-5">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-5">
                    <button className="text-blue-600 font-medium hover:text-blue-800">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="xl:hidden grid gap-4">
        {currentData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{item.product}</h3>
                <p className="text-sm text-gray-400">{item.batch}</p>
              </div>

              <span
                className={`px-3 py-1 h-fit rounded-full text-xs font-semibold ${statusColor[item.status]}`}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
              <div>
                <p className="text-gray-400">Quantity</p>
                <p>{item.quantity}</p>
              </div>

              <div>
                <p className="text-gray-400">Shift</p>
                <p>{item.shift}</p>
              </div>

              <div>
                <p className="text-gray-400">Start Date</p>
                <p>{item.startDate}</p>
              </div>

              <div>
                <p className="text-gray-400">Batch ID</p>
                <p>{item.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">
          Showing {start + 1} -{" "}
          {Math.min(start + PAGE_SIZE, filteredData.length)} of{" "}
          {filteredData.length}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="w-10 h-10 cursor-pointer rounded-xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="w-10 h-10 cursor-pointer rounded-xl bg-white border border-slate-200 flex items-center justify-center disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Production;

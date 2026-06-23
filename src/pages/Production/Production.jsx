import { useState } from "react";
import {
  Search,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 5;

const inventoryData = [
  {
    id: "INV-1001",
    product: "Milk 1L",
    category: "Dairy",
    stock: 420,
    unit: "Packets",
    minStock: 100,
    status: "In Stock",
    updated: "23 Jun 2026",
  },
  {
    id: "INV-1002",
    product: "Butter 500g",
    category: "Butter",
    stock: 42,
    unit: "Boxes",
    minStock: 80,
    status: "Low Stock",
    updated: "22 Jun 2026",
  },
  {
    id: "INV-1003",
    product: "Paneer 200g",
    category: "Dairy",
    stock: 0,
    unit: "Units",
    minStock: 50,
    status: "Out of Stock",
    updated: "21 Jun 2026",
  },
  {
    id: "INV-1004",
    product: "Curd 500g",
    category: "Dairy",
    stock: 250,
    unit: "Boxes",
    minStock: 80,
    status: "In Stock",
    updated: "20 Jun 2026",
  },
];

const filters = ["All", "In Stock", "Low Stock", "Out of Stock"];

const statusColor = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

const StatCard = ({ label, value, Icon, iconColor, bg }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-2">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}
        >
          <Icon className={iconColor} size={20} />
        </div>
        <p className="text-sm font-medium text-gray-600 truncate">{label}</p>
      </div>

      <h3 className="text-2xl font-bold text-slate-900 shrink-0">{value}</h3>
    </div>
  </div>
);

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredData = inventoryData.filter((item) => {
    const matchSearch =
      item.product.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());

    const matchFilter = activeFilter === "All" || item.status === activeFilter;

    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const start = (page - 1) * PAGE_SIZE;
  const currentData = filteredData.slice(start, start + PAGE_SIZE);

  const stats = {
    total: inventoryData.length,
    inStock: inventoryData.filter((i) => i.status === "In Stock").length,
    lowStock: inventoryData.filter((i) => i.status === "Low Stock").length,
    outStock: inventoryData.filter((i) => i.status === "Out of Stock").length,
  };

  return (
    <div className="px-4 md:px-4 space-y-3">
      {/* ── HEADER (LEFT) + TOOLBAR (RIGHT) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* LEFT */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track stock levels & product availability
          </p>
        </div>

        {/* RIGHT TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* SEARCH */}
          <div className="relative w-full sm:w-64">
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
              placeholder="Search inventory…"
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* EXPORT */}
          <button className="flex cursor-pointer items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Download size={15} />
            Export
          </button>

          {/* ADD */}
          <button className="flex cursor-pointer items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={15} />
            Add Item
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Items"
          value={stats.total}
          Icon={Package}
          bg="bg-slate-100"
        />
        <StatCard
          label="In Stock"
          value={stats.inStock}
          Icon={CheckCircle2}
          bg="bg-green-100"
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStock}
          Icon={AlertTriangle}
          bg="bg-amber-100"
        />
        <StatCard
          label="Out of Stock"
          value={stats.outStock}
          Icon={XCircle}
          bg="bg-red-100"
        />
      </div>

      {/* ── FILTERS (LEFT SIDE LIKE YOU WANTED) ── */}
      <div className="flex gap-2 flex-wrap justify-start">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => {
              setActiveFilter(f);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 cursor-pointer rounded-lg text-sm font-medium border transition-colors
            ${
              activeFilter === f
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* TABLE - DESKTOP */}
      <div className="hidden xl:block bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="max-h-[430px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-sm text-gray-500">
                <th className="text-left px-6 py-2">Product</th>
                <th className="text-left px-6 py-2">Category</th>
                <th className="text-left px-6 py-2">Stock</th>
                <th className="text-left px-6 py-2">Min Stock</th>
                <th className="text-left px-6 py-2">Status</th>
                <th className="text-left px-6 py-2">Updated</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((item) => (
                <tr
                  key={item.id}
                  className="border-t hover:bg-blue-50/40 transition"
                >
                  <td className="px-6 py-2">
                    <p className="font-medium">{item.product}</p>
                    <p className="text-xs text-gray-400">{item.id}</p>
                  </td>

                  <td className="px-6 py-2 text-gray-600">{item.category}</td>

                  <td className="px-6 py-2 text-gray-600">
                    {item.stock} {item.unit}
                  </td>

                  <td className="px-6 py-2 text-gray-600">{item.minStock}</td>

                  <td className="px-6 py-2">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${statusColor[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-6 py-2 text-gray-500">{item.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOBILE CARDS */}
      <div className="grid xl:hidden gap-4 sm:grid-cols-2">
        {currentData.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-semibold">{item.product}</h3>
                <p className="text-xs text-gray-400">{item.category}</p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full ${statusColor[item.status]}`}
              >
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
              <div>
                <p className="text-gray-400">Stock</p>
                <p>{item.stock}</p>
              </div>

              <div>
                <p className="text-gray-400">Min</p>
                <p>{item.minStock}</p>
              </div>

              <div>
                <p className="text-gray-400">Updated</p>
                <p>{item.updated}</p>
              </div>

              <div>
                <p className="text-gray-400">ID</p>
                <p>{item.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <p className="text-xs sm:text-sm text-gray-400">
          Showing {start + 1} -{" "}
          {Math.min(start + PAGE_SIZE, filteredData.length)} of{" "}
          {filteredData.length}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="w-10 h-10 cursor-pointer rounded-lg border disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="w-10 h-10 cursor-pointer rounded-lg border disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

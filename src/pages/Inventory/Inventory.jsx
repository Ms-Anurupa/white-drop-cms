import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  XCircle,
  Package,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* ── DATA ───────────────────────────────────────────── */
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
];

const filters = ["All", "In Stock", "Low Stock", "Out of Stock"];

const statusColor = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

/* ── COMPONENT ─────────────────────────────────────── */
export default function Inventory() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredData = inventoryData.filter((item) => {
    const q = search.toLowerCase();

    return (
      (item.product.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)) &&
      (activeFilter === "All" || item.status === activeFilter)
    );
  });

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE) || 1;

  const currentData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = {
    total: inventoryData.length,
    inStock: inventoryData.filter((i) => i.status === "In Stock").length,
    lowStock: inventoryData.filter((i) => i.status === "Low Stock").length,
    outStock: inventoryData.filter((i) => i.status === "Out of Stock").length,
  };

  return (
    <div className="px-4 space-y-3">
      {/* ── HEADER + SEARCH (SAME ROW LIKE DELIVERIES) ── */}
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
          <button className="flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            <Download size={15} />
            Export
          </button>

          {/* ADD */}
          <button className="flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus size={15} />
            Add Item
          </button>
        </div>
      </div>

            {/* ── STATS STRIP ── */}
<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">

  {/* Total */}
  <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
        <Package size={18} className="text-slate-600" />
      </div>
      <p className="text-sm text-gray-600">Total Items</p>
    </div>
    <h3 className="text-xl font-semibold">{stats.total}</h3>
  </div>

  {/* In Stock */}
  <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
        <CheckCircle2 size={18} className="text-green-600" />
      </div>
      <p className="text-sm text-gray-600">In Stock</p>
    </div>
    <h3 className="text-xl font-semibold text-green-600">{stats.inStock}</h3>
  </div>

  {/* Low Stock */}
  <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
        <AlertTriangle size={18} className="text-amber-600" />
      </div>
      <p className="text-sm text-gray-600">Low Stock</p>
    </div>
    <h3 className="text-xl font-semibold text-amber-600">
      {stats.lowStock}
    </h3>
  </div>

  {/* Out of Stock */}
  <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
        <XCircle size={18} className="text-red-600" />
      </div>
      <p className="text-sm text-gray-600">Out of Stock</p>
    </div>
    <h3 className="text-xl font-semibold text-red-600">
      {stats.outStock}
    </h3>
  </div>

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



      {/* ── TABLE ── */}
      <div className="hidden xl:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="max-h-[430px] overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-left text-sm text-gray-500">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Min Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4">Updated</th>
              </tr>
            </thead>

            <tbody>
              {currentData.map((item) => (
                <tr key={item.id} className="border-t hover:bg-blue-50/40">
                  <td className="p-4">
                    <p className="font-medium">{item.product}</p>
                    <p className="text-xs text-gray-400">{item.id}</p>
                  </td>

                  <td className="p-4 text-gray-600">{item.category}</td>

                  <td className="p-4">
                    {item.stock} {item.unit}
                  </td>

                  <td className="p-4">{item.minStock}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${statusColor[item.status]}`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4 text-gray-500">{item.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MOBILE ── */}
      <div className="grid xl:hidden gap-4 sm:grid-cols-2">
        {currentData.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-2xl p-5 shadow-sm"
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

            <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
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

      {/* ── PAGINATION ── */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          Showing {currentData.length === 0 ? 0 : 1} - {currentData.length}{" "}
          items
        </p>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="w-9 h-9 cursor-pointer border rounded-lg disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="w-9 h-9 cursor-pointer border rounded-lg disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

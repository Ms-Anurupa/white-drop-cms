import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Flame,
  Package,
  Coffee,
  Layers,
  Box,
} from "lucide-react";

const PRODUCT_ICONS = {
  Milk: Droplets,
  Butter: Package,
  Cheese: Layers,
  Yogurt: Coffee,
  Ghee: Flame,
  Paneer: Box,
};

const INITIAL_PRODUCTS = [
  {
    id: 1,
    name: "Milk",
    catchPhrase: "Pure & Fresh",
    price: 50,
    availability: "In Stock",
    unit: "Litre",
  },
  {
    id: 2,
    name: "Butter",
    catchPhrase: "Creamy Taste",
    price: 120,
    availability: "Out of Stock",
    unit: "Pack",
  },
  {
    id: 3,
    name: "Cheese",
    catchPhrase: "Rich & Soft",
    price: 200,
    availability: "In Stock",
    unit: "Kg",
  },
  {
    id: 4,
    name: "Yogurt",
    catchPhrase: "Healthy & Natural",
    price: 80,
    availability: "In Stock",
    unit: "Cup",
  },
  {
    id: 5,
    name: "Ghee",
    catchPhrase: "Pure Desi Ghee",
    price: 600,
    availability: "Out of Stock",
    unit: "Kg",
  },
  {
    id: 6,
    name: "Paneer",
    catchPhrase: "Soft & Fresh",
    price: 300,
    availability: "In Stock",
    unit: "Kg",
  },
];

const PAGE_SIZE = 5;

const Product = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.catchPhrase.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const inStock = products.filter((p) => p.availability === "In Stock").length;
  const outOfStock = products.filter(
    (p) => p.availability === "Out of Stock",
  ).length;

  const handleDelete = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleExport = () => {
    console.log("export");
  };

  return (
    <div className="min-h-[80vh] p-2 space-y-4">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Product Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Inventory, pricing &amp; availability
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative">
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
              className="pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 w-52"
            />
          </div>

          {/* Add */}
          <button
            onClick={() => navigate("/dashboard/product/addProduct")}
            className="inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={15} />
            Add product
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total products" value={products.length} />
        <StatCard
          label="In stock"
          value={inStock}
          valueClass="text-emerald-700"
        />
        <StatCard
          label="Out of stock"
          value={outOfStock}
          valueClass="text-red-600"
        />
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col h-[350px]">
        {/* TABLE HEADER  */}
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {[
                "Sl No.",
                "Name",
                "Catch phrase",
                "Image",
                "Price",
                "Availability",
                "Unit",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        </table>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <table className="w-full text-sm table-fixed">
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-gray-400"
                  >
                    No products match “{search}”
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => {
                  const Icon = PRODUCT_ICONS[item.name] ?? Package;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-400">
                        {start + index + 1}
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-800">
                        {item.name}
                      </td>

                      <td className="px-4 py-3 text-gray-500">
                        {item.catchPhrase}
                      </td>

                      <td className="px-4 py-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                          <Icon size={16} />
                        </div>
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-800">
                        ₹{item.price}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.availability === "In Stock"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {item.availability}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-500">{item.unit}</td>

                      <td className="px-2 py-3">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/product/edit/${item.id}`)
                            }
                            className="px-3 py-1 text-xs font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 text-xs font-medium rounded-md border border-red-100 bg-white hover:bg-red-50 text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {filtered.length === 0
              ? "No results"
              : `${start + 1}–${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length}`}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
              className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="text-xs font-medium text-gray-600 min-w-[40px] text-center">
              {page} / {totalPages || 1}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= (totalPages || 1)}
              className="w-7 cursor-pointer h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, valueClass = "text-gray-900" }) => (
  <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 shadow-sm">
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className={`text-2xl font-semibold ${valueClass}`}>{value}</p>
  </div>
);

export default Product;

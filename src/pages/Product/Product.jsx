import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Edit,
  Delete,
} from "lucide-react";
import productDataStore from "../../zustand/Store/productDataStore";
import { toast } from "react-toastify";
import { useConfirm } from "../../components/ConfirmProvider";

const PAGE_SIZE = 5;

const Product = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const {
    products,
    getAllProducts,
    deleteProductById,
    hardDeleteProduct,
    exportProductDetails,
  } = productDataStore();

  //fetch data
  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  useEffect(() => {
    console.log("allProducts", products);
  }, [products]);

  const filtered = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.catch_phrase.toLowerCase().includes(search.toLowerCase()),
  );

  const hydratedProducts = filtered.map((p) => ({
    ...p,
    variant: p.variants?.[0] || {},
  }));

  const totalPages = Math.ceil(hydratedProducts.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = hydratedProducts.slice(start, start + PAGE_SIZE);

  const inStock = products.filter((p) =>
    p.variants?.some((v) => v.availability),
  ).length;

  const outOfStock = products.filter((p) =>
    p.variants?.every((v) => !v.availability),
  ).length;

  const handleStatusChange = async (productId, status) => {
    try {
      await deleteProductById({
        productId,
        status,
      });

      await getAllProducts();

      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };
  const handleHardDelete = async (productId) => {
    try {
      const confirmMessage = await confirm({
        title: "Delete Product",
        message: "This will permanently delete the product. Continue?",
      });

      if (!confirmMessage) return;
      await hardDeleteProduct({
        productId,
      });

      toast.success("Product deleted");
      getAllProducts();
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleExport = async () => {
    try {
      const file = await exportProductDetails();

      const url = window.URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = "proucts.xlsx";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Products exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="p-2 sm:p-3 md:p-4 space-y-2">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            Product Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Inventory, pricing &amp; availability
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
              onClick={() => navigate("/dashboard/product/addProduct")}
              className="w-full cursor-pointer sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus size={15} />
              Add product
            </button>

            <button
              onClick={handleExport}
              className="w-full cursor-pointer sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              <Download size={15} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
        {/* CONTENT */}
        <div className="flex-1 overflow-hidden">
          {/* MOBILE VIEW */}
          <div className="block sm:hidden h-full overflow-y-auto p-2 space-y-3">
            {paginated.length === 0 ? (
              <p className="text-center text-gray-400 py-10">
                No products found
              </p>
            ) : (
              paginated.map((item, index) => {
                return (
                  <div
                    key={item.id}
                    className="border border-gray-100 rounded-xl p-3 bg-white hover:bg-slate-50"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">
                            #{start + index + 1}
                          </span>

                          <h3 className="font-medium text-gray-800">
                            {item.product_name}
                          </h3>
                        </div>

                        <p className="text-xs text-gray-500 mt-1">
                          {item.catch_phrase}
                        </p>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="font-medium text-sm">
                            ₹{item.price}
                          </span>

                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${
                              item.availability === "In Stock"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                        {/* <Icon size={16} /> */}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/product/editProduct/${item.id}`)
                        }
                        className="flex-1 py-2 text-xs rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleHardDelete(item.id)}
                        className="flex-1 py-2 text-xs rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden sm:block h-full overflow-auto">
            <table className="w-full text-sm table-fixed">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-100 z-10">
                <tr>
                  {[
                    "Sl No.",
                    "Name",
                    "Catch Phrase",
                    "Image",
                    "Price",
                    "Availability",
                    "Unit",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-400">
                      No products found
                    </td>
                  </tr>
                ) : (
                  paginated.map((item, index) => {
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-gray-50 hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-gray-400">
                          {start + index + 1}
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.product_name}
                        </td>

                        <td className="px-4 py-3 text-gray-500">
                          {item.catch_phrase}
                        </td>

                        <td className="px-4 py-3">
                          <img
                            src={`${import.meta.env.VITE_BASE_URL}/${
                              item.product_images?.[0]
                            }`}
                            alt={item.product_name}
                            className="w-12 h-12 rounded-lg object-cover "
                          />
                        </td>

                        <td className="px-4 py-3 font-medium">
                          ₹{item.variant?.price ?? "-"}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.variant?.availability
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-600"
                            }`}
                          >
                            {item.variant?.availability
                              ? "In Stock"
                              : "Out of Stock"}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-500">
                          {item.variant?.unit ?? "-"}
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={item.status ?? "ACTIVE"}
                            onChange={(e) =>
                              handleStatusChange(
                                item.product_id,
                                e.target.value,
                              )
                            }
                            className="px-2 py-1 cursor-pointer text-xs border border-gray-200 rounded-md"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                          </select>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex gap-2">
                            <button
                              title="Edit Product"
                              onClick={() =>
                                navigate(
                                  `/dashboard/product/editProduct/${item.product_id}`,
                                )
                              }
                              className="px-3 py-1 cursor-pointer rounded-md border border-gray-200 hover:bg-gray-50"
                            >
                              <Edit size={18} />
                            </button>

                            <button
                              title="Delete Product"
                              onClick={() => handleHardDelete(item.product_id)}
                              className="px-3 py-1 cursor-pointer rounded-md border border-red-100 text-red-600 hover:bg-red-50"
                            >
                              <Delete size={18} />
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
        </div>

        {/* PAGINATION */}
        <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {filtered.length === 0
                ? "No results"
                : `${start + 1}-${Math.min(
                    start + PAGE_SIZE,
                    filtered.length,
                  )} of ${filtered.length}`}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 cursor-pointer rounded-md border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="text-xs font-medium text-gray-600">
                {page} / {totalPages || 1}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                disabled={page >= (totalPages || 1)}
                className="w-8 h-8 cursor-pointer rounded-md border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
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

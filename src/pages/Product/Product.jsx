/* eslint-disable react-hooks/preserve-manual-memoization */
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Trash2,
  PackageSearch,
} from "lucide-react";
import productDataStore from "../../zustand/Store/productDataStore";
import { toast } from "react-toastify";
import { useConfirm } from "../../components/ConfirmProvider";

const PAGE_SIZE_OPTIONS = [8, 15, 25, 50];

import { SplitButton, SplitButtonItem } from "../../components/SplitButton"; // adjust path
import Loader from "../../components/Loader";
import { resolveFirebaseUrl } from "../../utils/resolveUrl";

const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE", "COMING_SOON"];

const PRODUCT_STATUS_LABEL = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  COMING_SOON: "Coming soon",
};

const PRODUCT_STATUS_DOT = {
  ACTIVE: "bg-emerald-500",
  INACTIVE: "bg-gray-400",
  COMING_SOON: "bg-blue-500",
};

const Product = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const {
    products,
    getAllProducts,
    deleteProductById,
    hardDeleteProduct,
    exportProductDetails,
  } = productDataStore();
  const [loading, setLoading] = useState(false);

  // fetch data
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await getAllProducts();
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [getAllProducts]);

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.product_name.toLowerCase().includes(search.toLowerCase()) ||
          p.catch_phrase.toLowerCase().includes(search.toLowerCase()),
      ),
    [products, search],
  );

  const hydratedProducts = useMemo(
    () => filtered.map((p) => ({ ...p, variant: p.variants?.[0] || {} })),
    [filtered],
  );

  const totalPages = Math.max(Math.ceil(hydratedProducts.length / pageSize), 1);
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = hydratedProducts.slice(start, start + pageSize);

  const inStock = products.filter((p) =>
    p.variants?.some((v) => v.availability),
  ).length;

  const outOfStock = products.filter((p) =>
    p.variants?.every((v) => !v.availability),
  ).length;

  const handleStatusChange = async (productId, status) => {
    try {
      await deleteProductById({ productId, status });
      await getAllProducts();
      toast.success("Status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleHardDelete = async (productId) => {
    try {
      const confirmMessage = await confirm({
        title: "Delete product",
        message: "This will permanently delete the product. Continue?",
      });

      if (!confirmMessage) return;
      await hardDeleteProduct({ productId });

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
      link.download = "products.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Products exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
  };

  // Build a compact page list like: 1 2 3 ... 8
  const getPageNumbers = () => {
    const pages = [];
    const windowSize = 1;
    const addRange = (from, to) => {
      for (let i = from; i <= to; i++) pages.push(i);
    };

    if (totalPages <= 7) {
      addRange(1, totalPages);
      return pages;
    }

    pages.push(1);
    const left = Math.max(2, currentPage - windowSize);
    const right = Math.min(totalPages - 1, currentPage + windowSize);

    if (left > 2) pages.push("ellipsis-left");
    addRange(left, right);
    if (right < totalPages - 1) pages.push("ellipsis-right");
    pages.push(totalPages);

    return pages;
  };

  if (loading) {
    return <Loader text="Loading Product Details..." />;
  }

  return (
    <div className="px-3 py-4 sm:px-5 lg:px-6 space-y-4 bg-gray-50 min-h-full text-[13px]">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 tracking-tight leading-tight">
            Product Management
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage inventory, pricing &amp; availability
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center w-full lg:w-auto">
          <div className="relative w-full sm:w-60">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products…"
              className="w-full h-8 pl-8 pr-3 text-xs rounded-md bg-white border border-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => navigate("/dashboard/product/addProduct")}
              className="flex-1 sm:flex-none cursor-pointer inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Plus size={14} />
              Add product
            </button>

            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none cursor-pointer inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-medium bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total products" value={products.length} />
        <StatCard
          label="In stock"
          value={inStock}
          valueClass="text-emerald-600"
          dotClass="bg-emerald-500"
        />
        <StatCard
          label="Out of stock"
          value={outOfStock}
          valueClass="text-red-600"
          dotClass="bg-red-500"
        />
      </div>

      {/* TABLE CARD — no inner scroll, the page itself scrolls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* MOBILE VIEW */}
        <div className="block sm:hidden divide-y divide-gray-100">
          {paginated.length === 0 ? (
            <EmptyState />
          ) : (
            paginated.map((item, index) => (
              <div key={item.product_id} className="p-3 hover:bg-slate-50">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-400 shrink-0">
                        #{start + index + 1}
                      </span>
                      <h3 className="text-[13px] font-medium text-gray-900 truncate">
                        {item.product_name}
                      </h3>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {item.catch_phrase}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[13px] text-gray-900">
                        ₹{item.variant?.price ?? item.price}
                      </span>
                      <StatusPill available={item.variant?.availability} />
                    </div>
                  </div>
                  <img
                    src={resolveFirebaseUrl({
                      folderName: "productImages",
                      fileName: item?.product_images?.[0],
                    })}
                    alt={item.product_name}
                    className="w-12 h-12 rounded-md object-cover shrink-0 border border-gray-100"
                  />
                </div>

                <div className="flex gap-2 mt-2.5">
                  <button
                    onClick={() =>
                      navigate(
                        `/dashboard/product/editProduct/${item.product_id}`,
                      )
                    }
                    className="flex-1 h-8 text-xs font-medium rounded-md border border-gray-200 hover:bg-gray-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleHardDelete(item.product_id)}
                    className="flex-1 h-8 text-xs font-medium rounded-md border border-red-100 text-red-600 hover:bg-red-50 inline-flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full table-fixed text-xs">
            <colgroup>
              <col className="w-12" />
              <col />
              <col className="hidden md:table-column" />
              <col className="w-14" />
              <col className="w-20" />
              <col className="w-28" />
              <col className="hidden md:table-column w-16" />
              <col className="w-40" />
              <col className="w-20" />
            </colgroup>

            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  { label: "Sl No.", cls: "" },
                  { label: "Name", cls: "" },
                  { label: "Catch phrase", cls: "hidden md:table-cell" },
                  { label: "Image", cls: "" },
                  { label: "Price", cls: "" },
                  { label: "Availability", cls: "" },
                  { label: "Unit", cls: "hidden md:table-cell" },
                  { label: "Status", cls: "" },
                  { label: "Actions", cls: "" },
                ].map((h) => (
                  <th
                    key={h.label}
                    className={`px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${h.cls}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paginated?.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                paginated.map((item, index) => (
                  <tr
                    key={item.product_id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-3 py-1.5 text-gray-400 tabular-nums">
                      {start + index + 1}
                    </td>

                    <td
                      className="px-3 py-1.5 font-medium text-gray-900 truncate"
                      title={item.product_name}
                    >
                      {item.product_name}
                    </td>

                    <td
                      className="hidden md:table-cell px-3 py-1.5 text-gray-500 truncate"
                      title={item.catch_phrase}
                    >
                      {item.catch_phrase}
                    </td>

                    <td className="px-3 py-1.5">
                      <img
                        src={resolveFirebaseUrl({
                          folderName: "productImages",
                          fileName: item?.product_images?.[0],
                        })}
                        alt={item.product_name}
                        className="w-9 h-9 rounded-md object-cover border border-gray-100"
                      />
                    </td>

                    <td className="px-3 py-1.5 font-medium text-gray-900 whitespace-nowrap tabular-nums">
                      ₹{item.variant?.price ?? "-"}
                    </td>

                    <td className="px-3 py-1.5">
                      <StatusPill available={item.variant?.availability} />
                    </td>

                    <td className="hidden md:table-cell px-3 py-1.5 text-gray-500 whitespace-nowrap">
                      {item.variant?.unit ?? "-"}
                    </td>

                    <td className="px-3 py-1.5">
                      <ProductStatusSelect
                        status={item.status}
                        onChange={(newStatus) =>
                          handleStatusChange(item.product_id, newStatus)
                        }
                      />
                    </td>

                    <td className="px-3 py-1.5">
                      <div className="flex gap-1.5">
                        <button
                          title="Edit product"
                          aria-label="Edit product"
                          onClick={() =>
                            navigate(
                              `/dashboard/product/editProduct/${item.product_id}`,
                            )
                          }
                          className="p-1.5 cursor-pointer rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          title="Delete product"
                          aria-label="Delete product"
                          onClick={() => handleHardDelete(item.product_id)}
                          className="p-1.5 cursor-pointer rounded-md border border-red-100 text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="border-t border-gray-200 bg-gray-50/50 px-3 sm:px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span>
              {filtered.length === 0
                ? "No results"
                : `Showing ${start + 1}–${Math.min(
                    start + pageSize,
                    filtered.length,
                  )} of ${filtered.length}`}
            </span>

            <label className="flex items-center gap-1.5">
              <span className="hidden md:inline">Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="cursor-pointer text-[11px] border border-gray-200 rounded-md px-1.5 py-0.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-1">
            <PageButton
              onClick={() => setPage(1)}
              disabled={currentPage === 1}
              label="First page"
            >
              <ChevronsLeft size={13} />
            </PageButton>

            <PageButton
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              label="Previous page"
            >
              <ChevronLeft size={13} />
            </PageButton>

            <div className="flex items-center gap-0.5 mx-1">
              {getPageNumbers().map((p, i) =>
                typeof p === "number" ? (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`min-w-7 h-7 px-1 cursor-pointer rounded-md text-[11px] font-medium transition ${
                      p === currentPage
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ) : (
                  <span
                    key={`${p}-${i}`}
                    className="w-7 h-7 flex items-center justify-center text-gray-300 text-[11px]"
                  >
                    …
                  </span>
                ),
              )}
            </div>

            <PageButton
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              label="Next page"
            >
              <ChevronRight size={13} />
            </PageButton>

            <PageButton
              onClick={() => setPage(totalPages)}
              disabled={currentPage >= totalPages}
              label="Last page"
            >
              <ChevronsRight size={13} />
            </PageButton>
          </div>
        </div>
      </div>
    </div>
  );
};

const PageButton = ({ children, onClick, disabled, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={label}
    aria-label={label}
    className="w-7 h-7 cursor-pointer rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
  >
    {children}
  </button>
);

const StatusPill = ({ available }) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
      available ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
    }`}
  >
    <span
      className={`w-1.5 h-1.5 rounded-full ${
        available ? "bg-emerald-500" : "bg-red-500"
      }`}
    />
    {available ? "In stock" : "Out of stock"}
  </span>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center gap-1.5 py-10 text-gray-400">
    <PackageSearch size={28} className="text-gray-300" />
    <p className="text-[13px] font-medium text-gray-500">No products found</p>
    <p className="text-[11px] text-gray-400">
      Try adjusting your search or add a new product
    </p>
  </div>
);

const StatCard = ({ label, value, valueClass = "text-gray-900", dotClass }) => (
  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 min-w-0">
      {dotClass && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />
      )}
      <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide truncate">
        {label}
      </p>
    </div>
    <p className={`text-xl font-semibold tabular-nums ${valueClass}`}>
      {value}
    </p>
  </div>
);

const ProductStatusSelect = ({
  status,
  onChange,
  disabled,
  className = "w-full min-w-36 h-8 text-xs whitespace-nowrap",
}) => {
  const current = status ?? "ACTIVE";

  return (
    <SplitButton
      variant="outline"
      disabled={disabled}
      className={className}
      onClick={() => {}}
      menuContent={
        <>
          {PRODUCT_STATUSES.map((s) => (
            <SplitButtonItem key={s} onClick={() => onChange(s)}>
              <div className="flex w-full items-center justify-between gap-3 text-xs whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${PRODUCT_STATUS_DOT[s]}`}
                  />
                  <span>{PRODUCT_STATUS_LABEL[s]}</span>
                </div>
                {current === s && <span className="text-blue-600">✓</span>}
              </div>
            </SplitButtonItem>
          ))}
        </>
      }
    >
      <div className="flex items-center gap-1 whitespace-nowrap">
        <span
          className={`h-1.5 w-1.5 rounded-full ${PRODUCT_STATUS_DOT[current]}`}
        />
        <span>{PRODUCT_STATUS_LABEL[current]}</span>
      </div>
    </SplitButton>
  );
};
export default Product;

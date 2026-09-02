/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Eye,
  CalendarDays,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react";
import inventoryStore from "@/zustand/Store/inventoryStore";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 5;

const filters = ["All", "In Stock", "Low Stock", "Out of Stock"];

const statusColor = {
  INSTOCK: "bg-green-100 text-green-700",
  LOWSTOCK: "bg-amber-100 text-amber-700",
  OUTOFSTOCK: "bg-red-100 text-red-700",

  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-amber-100 text-amber-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

const normalizeStatus = (status) => {
  if (!status) return "Out of Stock";

  const value = String(status).toUpperCase();

  if (value === "INSTOCK" || value === "IN_STOCK") {
    return "In Stock";
  }

  if (value === "LOWSTOCK" || value === "LOW_STOCK") {
    return "Low Stock";
  }

  if (value === "OUTOFSTOCK" || value === "OUT_OF_STOCK") {
    return "Out of Stock";
  }

  return status;
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (value) => {
  const number = Number(value ?? 0);

  return Number.isInteger(number) ? number : Number(number.toFixed(2));
};

const formatStockItems = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    return "-";
  }

  return items
    .map((item) => {
      if (item.isLoose) {
        return `${formatNumber(item.qty)} ${item.unit} Loose`;
      }

      return `${formatNumber(item.qty)} ${item.unit} (${formatNumber(
        item.packets,
      )} packets × ${formatNumber(item.unitSize)})`;
    })
    .join(", ");
};

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("All");

  const getInventoryListing = inventoryStore(
    (state) => state.getInventoryListing,
  );

  const inventoryLists = inventoryStore((state) => state.inventoryLists);

  const navigate = useNavigate();

  useEffect(() => {
    getInventoryListing();
  }, [getInventoryListing]);

  const inventoryData = inventoryLists;

  const filteredData = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    return inventoryData.filter((item) => {
      const status = normalizeStatus(item?.stockStatus);

      const matchesSearch =
        !searchText ||
        item?.id?.toLowerCase().includes(searchText) ||
        formatDate(item?.entryDate).toLowerCase().includes(searchText) ||
        item?.bulkUnit?.toLowerCase().includes(searchText) ||
        status.toLowerCase().includes(searchText) ||
        String(item?.bulkProducedQty ?? "")
          .toLowerCase()
          .includes(searchText);

      const matchesFilter = activeFilter === "All" || status === activeFilter;

      return matchesSearch && matchesFilter;
    });
  }, [inventoryData, search, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));

  const safePage = Math.min(page, totalPages);

  const currentData = filteredData.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const stats = useMemo(() => {
    const totalStockIn = inventoryData.reduce(
      (total, item) => total + Number(item?.totalStockIn ?? 0),
      0,
    );

    const totalStockOut = inventoryData.reduce(
      (total, item) => total + Number(item?.totalStockOut ?? 0),
      0,
    );

    const totalAvailable = inventoryData.reduce(
      (total, item) => total + Number(item?.totalAvailable ?? 0),
      0,
    );

    const inStock = inventoryData.filter(
      (item) => normalizeStatus(item?.stockStatus) === "In Stock",
    ).length;

    const lowStock = inventoryData.filter(
      (item) => normalizeStatus(item?.stockStatus) === "Low Stock",
    ).length;

    const outStock = inventoryData.filter(
      (item) => normalizeStatus(item?.stockStatus) === "Out of Stock",
    ).length;

    return {
      total: inventoryData.length,
      inStock,
      lowStock,
      outStock,
      totalStockIn,
      totalStockOut,
      totalAvailable,
    };
  }, [inventoryData]);

  useEffect(() => {
    setPage(1);
  }, [search, activeFilter]);

  const handleExport = () => {
    if (!inventoryData.length) return;

    const headers = [
      "Entry Date",
      "Bulk Produced",
      "Unit",
      "Wastage",
      "Actual Bulk",
      "Stock In",
      "Stock Out",
      "Available",
      "Status",
    ];

    const rows = inventoryData.map((item) => [
      formatDate(item.entryDate),
      item.bulkProducedQty ?? 0,
      item.bulkUnit ?? "",
      item.wastageQty ?? 0,
      item.actualBulkQty ?? 0,
      item.totalStockIn ?? 0,
      item.totalStockOut ?? 0,
      item.totalAvailable ?? 0,
      normalizeStatus(item.stockStatus),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "inventory.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:p-6 md:p-6 space-y-4">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Inventory Management
          </h1>

          <p className="text-sm text-gray-500 mt-0.5">
            Track production, stock movement and availability
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* SEARCH */}
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory..."
              className="w-full bg-white border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          {/* EXPORT */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium bg-slate-700 text-white rounded-lg hover:bg-slate-800"
          >
            <Download size={15} />
            Export
          </button>

          {/* ADD */}
          <button
            type="button"
            onClick={() => navigate("/dashboard/inventory/add-inventory")}
            className="flex cursor-pointer items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={15} />
            Add Item
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* TOTAL */}
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package size={18} className="text-slate-600" />
            </div>

            <p className="text-sm text-gray-600">Total Entries</p>
          </div>

          <h3 className="text-xl font-semibold">{stats.total}</h3>
        </div>

        {/* IN STOCK */}
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-green-600" />
            </div>

            <p className="text-sm text-gray-600">In Stock</p>
          </div>

          <h3 className="text-xl font-semibold text-green-600">
            {stats.inStock}
          </h3>
        </div>

        {/* LOW STOCK */}
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

        {/* OUT OF STOCK */}
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

      {/* STOCK SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400">Total Stock In</p>

          <p className="text-lg font-semibold text-gray-900 mt-1">
            {formatNumber(stats.totalStockIn)} L
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400">Total Stock Out</p>

          <p className="text-lg font-semibold text-gray-900 mt-1">
            {formatNumber(stats.totalStockOut)} L
          </p>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
          <p className="text-xs text-gray-400">Total Available</p>

          <p className="text-lg font-semibold text-gray-900 mt-1">
            {formatNumber(stats.totalAvailable)} L
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex gap-2 flex-wrap justify-start">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => {
              setActiveFilter(filter);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 cursor-pointer rounded-lg text-sm font-medium border transition-colors ${
              activeFilter === filter
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden xl:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50 z-10">
              <TableRow className="hover:bg-slate-50">
                <TableHead>Entry</TableHead>
                <TableHead>Entry Date</TableHead>
                <TableHead>Produced</TableHead>
                <TableHead>Stock In</TableHead>
                <TableHead>Stock Out</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentData.length > 0 ? (
                currentData.map((item) => {
                  const status = normalizeStatus(item?.stockStatus);

                  return (
                    <TableRow
                      key={item.id}
                      className="border-t hover:bg-blue-50/40 transition-colors"
                    >
                      <TableCell className="p-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            Production Entry
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5 break-all max-w-[180px]">
                            {item.id}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="p-4 text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={14} className="text-gray-400" />

                          {formatDate(item.entryDate)}
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <span className="font-medium text-gray-800">
                          {formatNumber(item.bulkProducedQty)}
                        </span>

                        <span className="text-gray-400 text-sm ml-1">
                          {item.bulkUnit}
                        </span>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="flex items-center gap-1">
                          <ArrowDownToLine
                            size={14}
                            className="text-green-500"
                          />

                          <span className="font-medium text-gray-800">
                            {formatNumber(item.totalStockIn)}
                          </span>

                          <span className="text-gray-400 text-sm">
                            {item.bulkUnit}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <div className="flex items-center gap-1">
                          <ArrowUpFromLine size={14} className="text-red-500" />

                          <span className="font-medium text-gray-800">
                            {formatNumber(item.totalStockOut)}
                          </span>

                          <span className="text-gray-400 text-sm">
                            {item.bulkUnit}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="p-4">
                        <span className="font-semibold text-gray-900">
                          {formatNumber(item.totalAvailable)}
                        </span>

                        <span className="text-gray-400 text-sm ml-1">
                          {item.bulkUnit}
                        </span>
                      </TableCell>

                      <TableCell className="p-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            statusColor[status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {status}
                        </span>
                      </TableCell>

                      <TableCell className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/dashboard/inventory/update-inventory/${item.id}`,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          <Eye size={14} />
                          Edit
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-sm text-gray-400"
                  >
                    No inventory items found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* MOBILE */}
      <div className="grid xl:hidden gap-4 sm:grid-cols-2">
        {currentData.length > 0 ? (
          currentData.map((item) => {
            const status = normalizeStatus(item?.stockStatus);

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Production Entry
                    </h3>

                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(item.entryDate)}
                    </p>
                  </div>

                  <span
                    className={`h-fit px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                      statusColor[status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
                  <div>
                    <p className="text-gray-400">Bulk Produced</p>

                    <p className="font-medium mt-1">
                      {formatNumber(item.bulkProducedQty)} {item.bulkUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Actual Bulk</p>

                    <p className="font-medium mt-1">
                      {formatNumber(item.actualBulkQty)} {item.bulkUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Stock In</p>

                    <p className="font-medium mt-1">
                      {formatNumber(item.totalStockIn)} {item.bulkUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Stock Out</p>

                    <p className="font-medium mt-1">
                      {formatNumber(item.totalStockOut)} {item.bulkUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Available</p>

                    <p className="font-semibold text-gray-900 mt-1">
                      {formatNumber(item.totalAvailable)} {item.bulkUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Wastage</p>

                    <p className="font-medium mt-1">
                      {formatNumber(item.wastageQty)} {item.bulkUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Expired Loose</p>

                    <p className="font-medium mt-1">
                      {formatNumber(item.expiredWastageQtyLoose)}{" "}
                      {item.bulkUnit}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">Expired Packaged</p>

                    <p className="font-medium mt-1">
                      {formatNumber(item.expiredWastageQtyPackaged)}{" "}
                      {item.bulkUnit}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 mb-1">Stock In Details</p>

                  <p className="text-xs text-gray-600 leading-5">
                    {formatStockItems(item.stockIn)}
                  </p>
                </div>

                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-1">
                    Stock Out Details
                  </p>

                  <p className="text-xs text-gray-600 leading-5">
                    {formatStockItems(item.stockOut)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(`/dashboard/inventory/update-inventory/${item.id}`)
                  }
                  className="mt-4 cursor-pointer w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <Eye size={15} />
                  Update Details
                </button>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center text-sm text-gray-400">
            No inventory items found.
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-400">
          Showing{" "}
          {filteredData.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1} -{" "}
          {Math.min(safePage * PAGE_SIZE, filteredData.length)} of{" "}
          {filteredData.length} items
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage === 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="w-9 h-9 flex items-center justify-center cursor-pointer border rounded-lg disabled:opacity-40 bg-white"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm text-gray-500">
            {safePage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={safePage === totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="w-9 h-9 flex items-center justify-center cursor-pointer border rounded-lg disabled:opacity-40 bg-white"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

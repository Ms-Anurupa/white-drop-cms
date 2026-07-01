import { useEffect, useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import orderDataStore from "../../zustand/Store/orderDataStore";
import { toast } from "react-toastify";

const PAGE_SIZE = 5;

// const INITIAL_ORDERS = [
//   {
//     id: "ORD-1001",
//     customer: "Rahul Sharma",
//     total: 1200,
//     address: "Salt Lake, Kolkata",
//     status: "Pending",
//     createdAt: "2026-06-20",
//     assignedTo: "Delivery Boy A",
//     phone: "9876543210",
//   },
//   {
//     id: "ORD-1002",
//     customer: "Anita Das",
//     total: 850,
//     address: "Park Street, Kolkata",
//     status: "Delivered",
//     createdAt: "2026-06-19",
//     assignedTo: "Delivery Boy B",
//     phone: "9123456780",
//   },
//   {
//     id: "ORD-1003",
//     customer: "Sourav Roy",
//     total: 2400,
//     address: "New Town, Kolkata",
//     status: "Shipped",
//     createdAt: "2026-06-18",
//     assignedTo: "Delivery Boy C",
//     phone: "9988776655",
//   },
// ];

const Order = () => {
  const getAllOrders = orderDataStore((state) => state.getAllOrders);
  const exportOrderDetails = orderDataStore((state) => state.exportOrderDetails);
  const orders = orderDataStore((state) => state.orders);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  const filtered = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search),
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const handleExport = async () => {
    try {
      const file = await exportOrderDetails();
      const url = window.URL.createObjectURL(file);

      const link = document.createElement("a");
      link.href = url;
      link.download = "orders.xlsx";

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Order data exported successfully");
    } catch {
      toast.error("Failed to export order details");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700";
      case "Shipped":
        return "bg-blue-50 text-blue-700";
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  return (
    <div className="h-full p-2 sm:p-3 md:p-4 space-y-4 overflow-hidden">
      {/* ── HEADER ── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Order Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track orders, delivery & status
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-stretch sm:items-center w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-52">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search orders..."
              className="
      w-full
      pl-10 pr-3 py-2
      text-sm
      bg-white
      border border-gray-200
      rounded-xl
      shadow-sm
      placeholder:text-gray-400
      focus:outline-none
      focus:ring-2 focus:ring-blue-500/20
      focus:border-blue-500
      transition-all
    "
            />
          </div>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 cursor-pointer py-2 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          {/* Export */}
          <button
            onClick={handleExport}
            className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-1.5 px-3.5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <Download size={15} />
            Export
          </button>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col h-[380px] overflow-hidden">
        {/* mobile table cards */}
        <div className="sm:hidden flex-1 overflow-y-auto p-3 space-y-3">
          {paginated.map((o) => (
            <div key={o.id} className="border border-gray-100 rounded-xl p-3">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{o.id}</h3>

                  <p className="text-sm text-gray-500">{o.customer}</p>
                </div>

                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(
                    o.status,
                  )}`}
                >
                  {o.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 mt-3 text-sm">
                <div>
                  <p className="text-gray-400">Total</p>
                  <p>₹{o.total}</p>
                </div>

                <div>
                  <p className="text-gray-400">Phone</p>
                  <p>{o.phone}</p>
                </div>

                <div>
                  <p className="text-gray-400">Assigned</p>
                  <p>{o.assignedTo}</p>
                </div>

                <div>
                  <p className="text-gray-400">Date</p>
                  <p>{o.createdAt}</p>
                </div>
              </div>

              <button className="mt-4 w-full px-3 py-2 text-xs rounded-lg border border-gray-200 hover:bg-gray-50">
                View
              </button>
            </div>
          ))}
        </div>

        {/*desktop HEADER */}
        <div className="hidden sm:flex flex-col flex-1 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Order ID",
                  "Customer",
                  "Order Total",
                  "Shipping Address",
                  "Status",
                  "Created At",
                  "Assigned To",
                  "Phone",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
          {/* BODY */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm table-fixed">
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-12 text-center text-gray-400"
                    >
                      No orders found
                    </td>
                  </tr>
                ) : (
                  paginated.map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 py-3 font-medium text-gray-800">
                        {o.id}
                      </td>

                      <td className="px-3 py-3 text-gray-700">{o.customer}</td>

                      <td className="px-3 py-3 font-medium text-gray-800">
                        ₹{o.total}
                      </td>

                      <td className="px-3 py-3 text-gray-500">{o.address}</td>

                      <td className="px-3 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                            o.status,
                          )}`}
                        >
                          {o.status}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-gray-500">{o.createdAt}</td>

                      <td className="px-3 py-3 text-gray-700">
                        {o.assignedTo}
                      </td>

                      <td className="px-3 py-3 text-gray-500">{o.phone}</td>

                      <td className="px-3 py-3">
                        <button className="px-3 py-1 cursor-pointer text-xs font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PAGINATION */}
        <div className="shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {filtered.length === 0
              ? "No results"
              : `${start + 1}–${Math.min(
                  start + PAGE_SIZE,
                  filtered.length,
                )} of ${filtered.length}`}
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
              className="w-7 h-7 cursor-pointer flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Order;

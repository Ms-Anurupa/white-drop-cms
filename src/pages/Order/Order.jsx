import { useEffect, useState } from "react";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import orderDataStore from "../../zustand/Store/orderDataStore";
import { useNavigate } from "react-router-dom";
import { getProductUrl } from "../../utils/resolveProductUrl";

const PAGE_SIZE = 8;

const Order = () => {
  const getOrderListing = orderDataStore((state) => state.getOrderListing);
  const exportOrderDetails = orderDataStore(
    (state) => state.exportOrderDetails,
  );  
  const orders = orderDataStore((state) => state.orders);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    console.log("orders", orders);
  }, [orders]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getOrderListing(search, status);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [getOrderListing, search, status]);

  const filteredOrders = orders.filter((order) => {
    if (dateFilter === "all") return true;

    const orderDate = new Date(order.createdAt);
    const now = new Date();

    if (dateFilter === "today") {
      return orderDate.toDateString() === now.toDateString();
    }

    if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);

      return orderDate >= weekAgo;
    }

    if (dateFilter === "month") {
      return (
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getFullYear() === now.getFullYear()
      );
    }

    return true;
  });

  const totalPages = Math.ceil(filteredOrders.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const paginated = filteredOrders.slice(start, start + PAGE_SIZE);

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
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-700";

      case "SHIPPED":
        return "bg-blue-100 text-blue-700";

      case "PROCESSING":
        return "bg-amber-100 text-amber-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
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

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 cursor-pointer py-2 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="">Payment Status</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="INTRANSIT">INTRANSIT</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="FAILED">FAILED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-sm rounded-lg bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col h-125 overflow-hidden">
        {/*desktop HEADER */}
        <div className="hidden sm:flex flex-col flex-1 overflow-hidden">
          <table className="w-full text-sm table-fixed">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {[
                  "Sl No.",
                  "Order ID",
                  "Product Image",
                  "Order Total",
                  "Customer Details",
                  "Status",
                  "Created At",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider"
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
                  paginated.map((o, idx) => (
                    <tr
                      key={o.orderId}
                      className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-3 py-3 font-medium whitespace-nowrap text-gray-800">
                        {start + idx + 1}
                      </td>
                      <td className="px-3 py-3 font-medium whitespace-nowrap text-gray-800">
                        {o.orderId}
                      </td>

                      <td className="px-3 py-3 text-center text-gray-700">
                        <img
                          src={getProductUrl(
                            o?.orderItems?.[0]?.product?.product_images?.[0],
                          )}
                          alt="Product"
                          className="w-14 h-14 text-center object-cover"
                        />
                      </td>

                      <td className="px-3 py-3 font-medium text-gray-800">
                        ₹{o.orderTotal}
                      </td>

                      <td className="px-3 py-3 text-gray-500">
                        <span className="text-gray-600 font-semibold">
                          {o.user?.customer_name} <br />
                        </span>
                        <span>
                          {o.shippingAddress?.locality} <br />
                        </span>
                        <span className="text-gray-600 font-semibold">
                          {o.user?.phone_num} <br />
                        </span>
                        <span>
                          {o.shippingAddress?.apartment} <br />
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(
                            o.orderStatus,
                          )}`}
                        >
                          {o.orderStatus}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-gray-500">{o.createdAt}</td>

                      <td className="px-3 py-3">
                        <button
                          onClick={() =>
                            navigate(`/dashboard/orders/orderDetails/${o.id}`)
                          }
                          className="px-3 py-1 text-center cursor-pointer text-xs font-medium rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        >
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
            {filteredOrders.length === 0
              ? "No results"
              : `${start + 1}–${Math.min(
                  start + PAGE_SIZE,
                  filteredOrders.length,
                )} of ${filteredOrders.length}`}
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

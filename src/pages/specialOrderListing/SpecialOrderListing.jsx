import { useEffect, useState } from "react";
import specialOrderStore from "@/zustand/Store/specialOrderStore";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  UserRound,
  Phone,
  CreditCard,
} from "lucide-react";

const SpecialOrderListing = () => {
  const specialOrder = specialOrderStore((state) => state.specialOrder);
  const getSpecialOrderRequests = specialOrderStore(
    (state) => state.getSpecialOrderRequests,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [dateFilter, setDateFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const orders = Array.isArray(specialOrder?.list) ? specialOrder.list : [];
  const pagination = specialOrder?.pagination || {};
  const total = Number(pagination?.totalItems || 0);
  const totalPages = Math.max(
    1,
    Number(pagination?.totalPages || Math.ceil(total / limit)),
  );

  useEffect(() => {
    const fetchSpecialOrders = async () => {
      try {
        await getSpecialOrderRequests({
          search,
          page,
          limit,
          dateFilter,
          startDate,
          endDate,
        });
      } catch (error) {
        console.error("Failed to fetch special orders:", error);
      }
    };

    fetchSpecialOrders();
  }, [
    getSpecialOrderRequests,
    search,
    page,
    limit,
    dateFilter,
    startDate,
    endDate,
  ]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-50 text-green-600 border-green-100";

      case "PENDING":
        return "bg-yellow-50 text-yellow-600 border-yellow-100";

      case "REJECTED":
        return "bg-red-50 text-red-600 border-red-100";

      case "CANCELLED":
        return "bg-gray-50 text-gray-600 border-gray-200";

      default:
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  const getItemCount = (order) => {
    if (!Array.isArray(order?.cart)) return 0;

    return order.cart.reduce(
      (totalQty, cartItem) => totalQty + Number(cartItem?.qty || 0),
      0,
    );
  };

  const getProductCount = (order) => {
    if (!Array.isArray(order?.cart)) return 0;

    return order.cart.length;
  };

  const fromRecord = total > 0 ? (page - 1) * limit + 1 : 0;

  const toRecord = total > 0 ? Math.min(page * limit, total) : 0;

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">
            Special Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage and review special order requests
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5">
          <span className="text-xs font-medium text-blue-600">
            Total Orders
          </span>

          <span className="text-sm font-semibold text-blue-700">{total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full lg:w-80">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search special orders..."
              className="
                h-10
                w-full
                rounded-lg
                border
                border-gray-200
                bg-white
                pl-9
                pr-3
                text-sm
                text-gray-700
                outline-none
                focus:border-blue-400
                focus:ring-1
                focus:ring-blue-100
              "
            />
          </div>

          {/* Date Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="
                h-10
                cursor-pointer
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                text-gray-600
                outline-none
              "
            >
              <option value="">All Dates</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="
                h-10
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                text-gray-600
                outline-none
              "
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="
                h-10
                rounded-lg
                border
                border-gray-200
                bg-white
                px-3
                text-sm
                text-gray-600
                outline-none
              "
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1400px] text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Sl No.
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Customer
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Contact
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Product
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Qty
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Total
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Payment
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Date
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.length > 0 ? (
                orders.map((order, index) => {
                  const customerName = order?.user?.customer_name || "-";

                  const phone = order?.user?.phone_num || "-";

                  const firstItem = order?.cart?.[0]?.item;

                  const itemCount = getItemCount(order);

                  const productCount = getProductCount(order);

                  return (
                    <tr
                      key={order?.id || index}
                      className="
                        border-b
                        border-gray-100
                        transition
                        hover:bg-gray-50
                      "
                    >
                      {/* Sl No */}
                      <td className="px-4 py-3 text-gray-500">
                        {(page - 1) * limit + index + 1}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="
                              flex
                              h-8
                              w-8
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-blue-50
                              text-blue-600
                            "
                          >
                            <UserRound size={15} />
                          </div>

                          <div>
                            <div className="font-medium text-gray-700">
                              {customerName}
                            </div>

                            <div className="mt-0.5 text-xs text-gray-400">
                              CUSTOMER
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 whitespace-nowrap text-gray-600">
                          <Phone size={14} className="text-gray-400" />

                          {phone}
                        </div>
                      </td>

                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="max-w-[280px]">
                          <div className="font-medium text-gray-700">
                            {firstItem?.product_name || "-"}
                          </div>

                          <div className="mt-1 text-xs text-gray-400">
                            {firstItem?.quantity
                              ? `${firstItem.quantity} ${firstItem.unit || ""}`
                              : "-"}
                          </div>

                          {productCount > 1 && (
                            <div className="mt-1 text-xs text-blue-600">
                              + {productCount - 1} more product
                              {productCount - 1 !== 1 ? "s" : ""}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Qty */}
                      <td className="px-4 py-3 text-gray-600">{itemCount}</td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-800">
                        ₹{Number(order?.orderTotal || 0).toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CreditCard size={14} className="text-gray-400" />

                          <span className="text-sm font-medium text-gray-600">
                            {order?.paymentMode || "-"}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="text-gray-600">
                          {formatDate(order?.createdAt)}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {formatTime(order?.createdAt)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`
                            inline-flex
                            rounded-full
                            border
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            ${getStatusClass(order?.status)}
                          `}
                        >
                          {order?.status || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="px-4 py-12 text-center text-sm text-gray-400"
                  >
                    No special orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows:</span>

            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="
                h-8
                cursor-pointer
                rounded-md
                border
                border-gray-200
                bg-white
                px-2
                text-sm
                outline-none
              "
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <span>
              {total > 0
                ? `${fromRecord}-${toRecord} of ${total}`
                : "0 records"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* First */}
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="
                flex
                h-8
                w-8
                cursor-pointer
                items-center
                justify-center
                rounded-md
                border
                border-gray-200
                text-gray-500
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronsLeft size={16} />
            </button>

            {/* Previous */}
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
              className="
                flex
                h-8
                w-8
                cursor-pointer
                items-center
                justify-center
                rounded-md
                border
                border-gray-200
                text-gray-500
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 text-sm text-gray-600">
              {page} / {totalPages}
            </span>

            {/* Next */}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="
                flex
                h-8
                w-8
                cursor-pointer
                items-center
                justify-center
                rounded-md
                border
                border-gray-200
                text-gray-500
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronRight size={16} />
            </button>

            {/* Last */}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="
                flex
                h-8
                w-8
                cursor-pointer
                items-center
                justify-center
                rounded-md
                border
                border-gray-200
                text-gray-500
                hover:bg-gray-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialOrderListing;

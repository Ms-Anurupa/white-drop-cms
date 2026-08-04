import { useNavigate } from "react-router-dom";
import { Building2, Eye, Plus, Search } from "lucide-react";
import corporateDataStore from "../../zustand/Store/corporateDataStore";
import { useEffect, useState } from "react";

const deliveryBadgeClass = (status) =>
  status === "PLACED"
    ? "bg-blue-100 text-blue-700"
    : status === "PROCESSING"
      ? "bg-amber-100 text-amber-700"
      : status === "INTRANSIT"
        ? "bg-indigo-100 text-indigo-700"
        : status === "DELIVERED"
          ? "bg-green-100 text-green-700"
          : status === "FAILED"
            ? "bg-red-100 text-red-700"
            : status === "CANCELLED"
              ? "bg-gray-200 text-gray-700"
              : "bg-gray-100 text-gray-700";

const paymentBadgeClass = (status) =>
  status === "COMPLETE"
    ? "bg-green-100 text-green-700"
    : status === "POSTPAID"
      ? "bg-purple-100 text-purple-700"
      : status === "PENDING"
        ? "bg-yellow-100 text-yellow-700"
        : status === "FAILED"
          ? "bg-red-100 text-red-700"
          : "bg-gray-100 text-gray-700";

const EmptyState = ({ onCheckAccounts }) => (
  <div className="flex flex-col items-center justify-center px-4 py-16 sm:py-20">
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
      <Plus size={28} className="text-blue-600" />
    </div>

    <h3 className="mt-4 text-lg font-semibold text-gray-800">
      No Corporate Orders
    </h3>

    <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
      There are no corporate orders available yet. Check your corporate accounts
      and create a new order.
    </p>

    <button
      onClick={onCheckAccounts}
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
    >
      <Eye size={18} />
      Check Corporate Accounts
    </button>
  </div>
);

const CorporateOrder = () => {
  const navigate = useNavigate();
  
  const getCorporateOrders = corporateDataStore(
    (state) => state.getCorporateOrders,
  );
  const corporateOrderLists = corporateDataStore(
    (state) => state.corporateOrderLists,
  );

  const [search, setSearch] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const goToAccounts = () =>
    navigate("/dashboard/corporate-orders/corporate-accounts");

  useEffect(() => {
    getCorporateOrders({
      deliveryStatus,
      paymentStatus,
      search,
      page,
      limit,
      fromDate,
      toDate,
    });
  }, [
    getCorporateOrders,
    deliveryStatus,
    paymentStatus,
    search,
    page,
    limit,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    console.log("corporateOrderLists", corporateOrderLists);
  }, [corporateOrderLists]);

  const hasOrders = corporateOrderLists?.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Corporate Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all corporate orders.
          </p>
        </div>

        <div className="w-full sm:w-64 lg:w-72">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search Order ID / Product..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <button
          onClick={goToAccounts}
          className="inline-flex cursor-pointer w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow transition hover:bg-blue-700 sm:w-auto"
        >
          <Building2 size={18} />
          Check Corporate Accounts
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:flex lg:flex-row lg:items-end">
        <div className="w-full lg:w-52">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Delivery Status
          </label>

          <select
            value={deliveryStatus}
            onChange={(e) => {
              setDeliveryStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="PLACED">Placed</option>
            <option value="PROCESSING">Processing</option>
            <option value="INTRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="w-full lg:w-52">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Payment Status
          </label>

          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All</option>
            <option value="COMPLETE">Complete</option>
            <option value="PENDING">Pending</option>
            <option value="POSTPAID">Postpaid</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        <div className="w-full lg:w-auto">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            From
          </label>

          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 lg:w-auto"
          />
        </div>

        <div className="w-full lg:w-auto">
          <label className="mb-1 block text-xs font-medium text-gray-600">
            To
          </label>

          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-blue-500 lg:w-auto"
          />
        </div>

        <button
          onClick={() => {
            setSearch("");
            setDeliveryStatus("");
            setPaymentStatus("");
            setFromDate("");
            setToDate("");
            setPage(1);
          }}
          className="w-full rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium hover:bg-gray-50 sm:col-span-2 lg:w-auto lg:col-span-1"
        >
          Reset
        </button>
      </div>

      {/* Mobile / tablet: card list (< lg) */}
      <div className="md:hidden">
        {hasOrders ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {corporateOrderLists.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.orderId}
                    </p>
                    <p className="text-xs text-gray-500">{order.corpoAccId}</p>
                  </div>

                  <button
                    className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                    onClick={() => console.log(order)}
                    aria-label="View order"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-sm font-medium text-gray-900">
                    {order.orderDetails.productName}
                  </p>
                  <p className="line-clamp-1 text-xs text-gray-500">
                    {order.orderDetails.description}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Quantity</p>
                    <p className="text-gray-800">
                      {order.orderDetails.qty} {order.orderDetails.unit}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-semibold text-gray-900">
                      ₹{order.orderDetails.orderTotal.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-gray-800">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${deliveryBadgeClass(
                      order.deliveryStatus,
                    )}`}
                  >
                    {order.deliveryStatus}
                  </span>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${paymentBadgeClass(
                      order.paymentStatus,
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <EmptyState onCheckAccounts={goToAccounts} />
          </div>
        )}
      </div>

      {/* Desktop: table (lg and up) */}
      <div className="hidden md:max-w-[1000px] lg:block rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Quantity</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {hasOrders ? (
                corporateOrderLists.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-100 transition hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {order.orderId}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {order.corpoAccId}
                    </td>

                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.orderDetails.productName}
                        </p>
                        <p className="line-clamp-1 text-xs text-gray-500">
                          {order.orderDetails.description}
                        </p>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {order.orderDetails.qty} {order.orderDetails.unit}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                      ₹{order.orderDetails.orderTotal.toLocaleString()}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${deliveryBadgeClass(
                          order.deliveryStatus,
                        )}`}
                      >
                        {order.deliveryStatus}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${paymentBadgeClass(
                          order.paymentStatus,
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        className="inline-flex items-center justify-center rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                        onClick={() => console.log(order)}
                        aria-label="View order"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9}>
                    <EmptyState onCheckAccounts={goToAccounts} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-gray-500">Page {page}</p>

        <div className="flex w-full gap-2 sm:w-auto">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="flex-1 rounded-lg border px-4 py-2 disabled:opacity-40 sm:flex-none"
          >
            Previous
          </button>

          <button
            disabled={corporateOrderLists.length < limit}
            onClick={() => setPage((p) => p + 1)}
            className="flex-1 rounded-lg border px-4 py-2 disabled:opacity-40 sm:flex-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorporateOrder;

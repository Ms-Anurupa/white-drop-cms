/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Phone,
  CreditCard,
  CalendarDays,
  Clock3,
  Package,
  Pencil,
  Check,
} from "lucide-react";
import specialOrderStore from "@/zustand/Store/specialOrderStore";
import { resolveFirebaseUrl } from "@/utils/resolveUrl";

const SpecialOrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const specialOrderDetails = specialOrderStore(
    (state) => state.specialOrderDetails,
  );
  const getSpecialOrderDetails = specialOrderStore(
    (state) => state.getSpecialOrderDetails,
  );
  const [paymentMode, setPaymentMode] = useState("");
  const [cart, setCart] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      getSpecialOrderDetails(id);
    }
  }, [id, getSpecialOrderDetails]);

  useEffect(() => {
    if (!specialOrderDetails) return;

    setPaymentMode(specialOrderDetails?.paymentMode || "");

    setCart(
      Array.isArray(specialOrderDetails?.cart)
        ? specialOrderDetails.cart.map((cartItem) => ({
            ...cartItem,
            qty: Number(cartItem?.qty || 0),
          }))
        : [],
    );

    setIsEditing(false);
  }, [specialOrderDetails]);

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

  const handleQuantityChange = (index, value) => {
    const quantity = Math.max(1, Number(value) || 1);

    setCart((prev) =>
      prev.map((cartItem, itemIndex) =>
        itemIndex === index
          ? {
              ...cartItem,
              qty: quantity,
            }
          : cartItem,
      ),
    );

    setIsEditing(true);
  };

  const handlePaymentChange = (value) => {
    setPaymentMode(value);
    setIsEditing(true);
  };

  const handleUpdateAndApprove = () => {
    const payload = {
      reqId: id,
      paymentMode,
      cart: cart.map((cartItem) => ({
        qty: Number(cartItem?.qty || 0),
        item: cartItem?.item,
      })),
      status: "APPROVED",
    };

    console.log("Update & Approve Payload:", payload);

    // Connect your update API here
  };

  const handleCancelEdit = () => {
    setPaymentMode(specialOrderDetails?.paymentMode || "");

    setCart(
      Array.isArray(specialOrderDetails?.cart)
        ? specialOrderDetails.cart.map((cartItem) => ({
            ...cartItem,
            qty: Number(cartItem?.qty || 0),
          }))
        : [],
    );

    setIsEditing(false);
  };

  if (!specialOrderDetails) {
    return (
      <div className="min-h-full bg-gray-50 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <Package size={40} className="mx-auto mb-3 text-gray-300" />

          <h2 className="text-base font-semibold text-gray-800">
            Order not found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Unable to load special order details.
          </p>
        </div>
      </div>
    );
  }

  const customerName = specialOrderDetails?.user?.customer_name || "-";

  const phone = specialOrderDetails?.user?.phone_num || "-";

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-0.5 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
          </button>

          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Special Order Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage special order
            </p>
          </div>
        </div>

        <span
          className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-medium ${getStatusClass(
            specialOrderDetails?.status,
          )}`}
        >
          {specialOrderDetails?.status || "PENDING"}
        </span>
      </div>

      {/* Order Summary */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
            <CreditCard size={18} />
          </div>

          <p className="text-xs text-gray-500">Payment Mode</p>

          <p className="mt-1 text-sm font-semibold text-gray-800">
            {specialOrderDetails?.paymentMode || "-"}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
            <Package size={18} />
          </div>

          <p className="text-xs text-gray-500">Total Items</p>

          <p className="mt-1 text-sm font-semibold text-gray-800">
            {cart.reduce((total, item) => total + Number(item?.qty || 0), 0)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
            <CalendarDays size={18} />
          </div>

          <p className="text-xs text-gray-500">Order Date</p>

          <p className="mt-1 text-sm font-semibold text-gray-800">
            {formatDate(specialOrderDetails?.createdAt)}
          </p>
        </div>
      </div>

      {/* Customer / Order / Delivery */}
      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Customer */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Customer Details
            </h2>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <UserRound size={17} />
              </div>

              <div>
                <p className="text-xs text-gray-500">Customer Name</p>

                <p className="text-sm font-medium text-gray-800">
                  {customerName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50 text-green-600">
                <Phone size={17} />
              </div>

              <div>
                <p className="text-xs text-gray-500">Phone Number</p>

                <p className="text-sm font-medium text-gray-800">{phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <UserRound size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-xs text-gray-500">Customer Type</p>

                <p className="text-sm font-medium text-gray-800">
                  {specialOrderDetails?.user?.customer_type || "Customer"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-800">
              Order Information
            </h2>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <CreditCard size={17} />
                </div>

                <div>
                  <p className="text-xs text-gray-500">Payment Mode</p>

                  <select
                    value={paymentMode}
                    onChange={(e) => handlePaymentChange(e.target.value)}
                    className="mt-1 h-9 cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-400"
                  >
                    <option value="COD">COD</option>
                    <option value="ONLINE">ONLINE</option>
                  </select>
                </div>
              </div>

              <Pencil size={14} className="text-gray-400" />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <CalendarDays size={17} />
              </div>

              <div>
                <p className="text-xs text-gray-500">Created Date</p>

                <p className="text-sm font-medium text-gray-800">
                  {formatDate(specialOrderDetails?.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Clock3 size={17} />
              </div>

              <div>
                <p className="text-xs text-gray-500">Created Time</p>

                <p className="text-sm font-medium text-gray-800">
                  {formatTime(specialOrderDetails?.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="mb-5 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              Order Products
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Update product quantity if required
            </p>
          </div>

          <span className="text-lg font-bold text-gray-800">
            ₹{Number(specialOrderDetails?.orderTotal || 0).toFixed(2)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                  Product
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                  Package
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500">
                  Product Size
                </th>

                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500">
                  Quantity
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">
                  Price
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500">
                  Subtotal
                </th>
              </tr>
            </thead>

            <tbody>
              {cart.length > 0 ? (
                cart.map((cartItem, index) => {
                  const item = cartItem?.item || {};
                  const qty = Number(cartItem?.qty || 0);
                  const price = Number(item?.price || 0);
                  const subtotal = qty * price;

                  return (
                    <tr
                      key={item?.variant_id || item?.product_id || index}
                      className="border-b border-gray-100 last:border-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                            {item?.product_images?.[0] ? (
                              <img
                                src={resolveFirebaseUrl({
                                  folderName: "productImages",
                                  fileName: item.product_images[0],
                                })}
                                alt={item?.product_name || "Product"}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package size={18} className="text-gray-400" />
                            )}
                          </div>

                          <div>
                            <p className="font-medium text-gray-700">
                              {item?.product_name || "-"}
                            </p>

                            <p className="mt-1 text-xs text-gray-400">
                              {item?.product_description || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {item?.package || "-"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {item?.quantity
                          ? `${item.quantity} ${item.unit || ""}`
                          : "-"}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={(e) =>
                            handleQuantityChange(index, e.target.value)
                          }
                          className="h-9 w-20 rounded-md border border-gray-200 bg-white px-2 text-center text-sm font-medium text-gray-700 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                        />
                      </td>

                      <td className="px-5 py-4 text-right text-gray-600">
                        ₹{price.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold text-gray-800">
                        ₹{subtotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-sm text-gray-400"
                  >
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-5 py-4">
          <div className="flex items-center gap-8">
            <span className="text-sm font-medium text-gray-600">
              Order Total
            </span>

            <span className="text-lg font-bold text-gray-800">
              ₹
              {cart
                .reduce(
                  (total, cartItem) =>
                    total +
                    Number(cartItem?.qty || 0) *
                      Number(cartItem?.item?.price || 0),
                  0,
                )
                .toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Update Actions */}
      {isEditing && (
        <div className="sticky bottom-4 z-10 flex flex-col items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white p-4 shadow-lg sm:flex-row">
          <div>
            <p className="text-sm font-semibold text-gray-800">
              Unsaved changes
            </p>

            <p className="mt-0.5 text-xs text-gray-500">
              Quantity or payment mode has been modified.
            </p>
          </div>

          <div className="flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="flex-1 cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:flex-none"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpdateAndApprove}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 sm:flex-none"
            >
              <Check size={16} />
              Update & Approve
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOrderDetails;

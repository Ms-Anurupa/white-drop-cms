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
        return "border-emerald-200 bg-emerald-50 text-emerald-700";

      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700";

      case "CANCELLED":
        return "border-gray-200 bg-gray-50 text-gray-600";

      default:
        return "border-blue-200 bg-blue-50 text-blue-700";
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
      <div className="min-h-full bg-slate-50 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Package size={26} className="text-slate-400" />
          </div>

          <h2 className="text-base font-semibold text-slate-800">
            Order not found
          </h2>

          <p className="mt-1.5 text-sm text-slate-500">
            Unable to load special order details.
          </p>
        </div>
      </div>
    );
  }

  const customerName = specialOrderDetails?.user?.customer_name || "-";
  const phone = specialOrderDetails?.user?.phone_num || "-";

  const totalItems = cart.reduce(
    (total, item) => total + Number(item?.qty || 0),
    0,
  );

  const calculatedTotal = cart.reduce(
    (total, cartItem) =>
      total + Number(cartItem?.qty || 0) * Number(cartItem?.item?.price || 0),
    0,
  );

  return (
    <div className="min-h-full bg-slate-50 p-4 pb-6 sm:p-4 sm:pb-12">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-0.5 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Special Order Details
              </h1>

              <span
                className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getStatusClass(
                  specialOrderDetails?.status,
                )}`}
              >
                {specialOrderDetails?.status || "PENDING"}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Review order information and update requested quantities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Package size={16} />
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              Order Total
            </p>
            <p className="text-sm font-bold text-slate-900">
              ₹{Number(specialOrderDetails?.orderTotal || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CreditCard size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Payment Mode
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                {specialOrderDetails?.paymentMode || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Package size={18} />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Total Items
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Order Date
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatDate(specialOrderDetails?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="mb-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Customer */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Customer Details
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Customer information
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <UserRound size={17} />
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <UserRound size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">
                  Customer Name
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                  {customerName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Phone size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">
                  Phone Number
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                  {phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <UserRound size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400">
                  Customer Type
                </p>
                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                  {specialOrderDetails?.user?.customer_type || "Customer"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Order Information
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Payment and creation details
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <CreditCard size={17} />
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="mb-2 flex items-center gap-2">
                <CreditCard size={15} className="text-blue-600" />
                <p className="text-[11px] font-medium text-slate-400">
                  Payment Mode
                </p>
              </div>

              <select
                value={paymentMode}
                onChange={(e) => handlePaymentChange(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              >
                <option value="COD">COD</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays size={15} className="text-orange-600" />
                <p className="text-[11px] font-medium text-slate-400">
                  Created Date
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-800">
                {formatDate(specialOrderDetails?.createdAt)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Clock3 size={15} className="text-violet-600" />
                <p className="text-[11px] font-medium text-slate-400">
                  Created Time
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-800">
                {formatTime(specialOrderDetails?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Package size={16} />
              </div>

              <h2 className="text-sm font-bold text-slate-800">
                Order Products
              </h2>
            </div>

            <p className="mt-1 pl-10 text-xs text-slate-400">
              Adjust quantities before approving the order.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 sm:justify-end">
            <span className="text-xs font-medium text-slate-500">
              Current Total
            </span>

            <span className="text-base font-bold text-slate-900">
              ₹{calculatedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Product
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Package
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Product Size
                </th>

                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Quantity
                </th>

                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Price
                </th>

                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
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
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
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
                              <Package size={19} className="text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate font-semibold text-slate-700">
                              {item?.product_name || "-"}
                            </p>

                            <p className="mt-1 max-w-[280px] truncate text-xs text-slate-400">
                              {item?.product_description || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item?.package || "-"}
                      </td>

                      <td className="px-5 py-4">
                        {item?.quantity ? (
                          <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {item.quantity} {item.unit || ""}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
                          <input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) =>
                              handleQuantityChange(index, e.target.value)
                            }
                            className="h-9 w-20 rounded-lg bg-transparent px-2 text-center text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-100"
                          />

                          <Pencil size={13} className="mr-2 text-slate-300" />
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right font-medium text-slate-600">
                        ₹{price.toFixed(2)}
                      </td>

                      <td className="px-5 py-4 text-right font-bold text-slate-800">
                        ₹{subtotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                        <Package size={22} className="text-slate-400" />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        No products found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        This order does not contain any products.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/70 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-400">
              {totalItems} total items
            </p>

            <p className="mt-0.5 text-sm font-semibold text-slate-700">
              Order Total
            </p>
          </div>

          <p className="text-xl font-bold tracking-tight text-slate-900">
            ₹{calculatedTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Sticky Actions */}
      {isEditing && (
        <div className="fixed bottom-4 left-4 right-4 z-20 mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.14)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Pencil size={15} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Unsaved changes
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  Quantity or payment mode has been modified.
                </p>
              </div>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateAndApprove}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 sm:flex-none"
              >
                <Check size={16} />
                Update & Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOrderDetails;

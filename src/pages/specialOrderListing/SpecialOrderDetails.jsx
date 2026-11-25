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
import { toast } from "react-toastify";
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
  const approveAndUpdateSpecialRequest = specialOrderStore(
    (state) => state.approveAndUpdateSpecialRequest,
  );
  const [paymentMode, setPaymentMode] = useState("");
  const [cart, setCart] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            item: {
              ...cartItem?.item,
              price: Number(cartItem?.item?.price || 0),
            },
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
        return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300";

      case "PENDING":
        return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300";

      case "REJECTED":
        return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/60 dark:text-red-300";

      case "CANCELLED":
        return "border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";

      default:
        return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300";
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

  const handlePriceChange = (index, value) => {
    const price = Math.max(0, Number(value) || 0);

    setCart((prev) =>
      prev.map((cartItem, itemIndex) =>
        itemIndex === index
          ? {
              ...cartItem,
              item: {
                ...cartItem.item,
                price,
              },
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

  const handleUpdateAndApprove = async () => {
    try {
      setIsSubmitting(true);

      const updatedCart = cart.map((cartItem) => ({
        qty: Number(cartItem?.qty || 0),
        item: {
          ...cartItem?.item,
          price: Number(cartItem?.item?.price || 0),
        },
      }));

      const updatedOrderTotal = updatedCart.reduce(
        (total, cartItem) =>
          total +
          Number(cartItem?.qty || 0) * Number(cartItem?.item?.price || 0),
        0,
      );

      const updatedPaymentMode = paymentMode;

      const payload = {
        requestId: id,
        updatedCart,
        updatedOrderTotal,
        updatedPaymentMode,
      };

      console.log("Update & Approve Payload:", payload);

      await approveAndUpdateSpecialRequest(payload);

      toast.success("Special order updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Update & Approve Error:", error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.data?.message ||
        error?.response?.data?.data?.error ||
        error?.message ||
        "Failed to update the special order request";

      toast.error(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setPaymentMode(specialOrderDetails?.paymentMode || "");

    setCart(
      Array.isArray(specialOrderDetails?.cart)
        ? specialOrderDetails.cart.map((cartItem) => ({
            ...cartItem,
            qty: Number(cartItem?.qty || 0),
            item: {
              ...cartItem?.item,
              price: Number(cartItem?.item?.price || 0),
            },
          }))
        : [],
    );

    setIsEditing(false);
  };

  if (!specialOrderDetails) {
    return (
      <div className="min-h-full bg-slate-50 dark:bg-slate-950 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <Package size={26} className="text-slate-400 dark:text-slate-500" />
          </div>

          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
            Order not found
          </h2>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
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
    <div className="min-h-full bg-slate-50 dark:bg-slate-950 p-4 pb-6 sm:p-4 sm:pb-12">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-0.5 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 shadow-sm transition hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
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

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Review order information and update requested quantities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 shadow-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Package size={16} />
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Order Total
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              ₹{calculatedTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CreditCard size={18} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Payment Mode
              </p>

              <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                {paymentMode || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <Package size={18} />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Total Items
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {totalItems}
              </p>
            </div>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <CalendarDays size={18} />
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Order Date
              </p>

              <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {formatDate(specialOrderDetails?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Information Cards */}
      <div className="mb-4 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Customer */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Customer Details
              </h2>

              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                Customer information
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <UserRound size={17} />
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <UserRound size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Customer Name
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {customerName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Phone size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Phone Number
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {phone}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
                <UserRound size={16} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  Customer Type
                </p>

                <p className="mt-0.5 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {specialOrderDetails?.user?.customer_type || "Customer"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Information */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Order Information
              </h2>

              <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                Payment and creation details
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <CreditCard size={17} />
            </div>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3 lg:grid-cols-3">
            <div className="rounded-xl border border-slate-100 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/60 p-3">
              <div className="mb-2 flex items-center gap-2">
                <CreditCard size={15} className="text-blue-600 dark:text-blue-400" />

                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  Payment Mode
                </p>
              </div>

              <select
                value={paymentMode}
                onChange={(e) => handlePaymentChange(e.target.value)}
                className="h-9 w-full cursor-pointer rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-sm font-semibold text-slate-700 dark:text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-500/20"
              >
                <option value="COD">COD</option>
                <option value="ONLINE">ONLINE</option>
              </select>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/60 p-3">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays size={15} className="text-orange-600 dark:text-orange-400" />

                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  Created Date
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {formatDate(specialOrderDetails?.createdAt)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-700/70 bg-slate-50/70 dark:bg-slate-800/60 p-3">
              <div className="mb-2 flex items-center gap-2">
                <Clock3 size={15} className="text-violet-600 dark:text-violet-400" />

                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-400">
                  Created Time
                </p>
              </div>

              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {formatTime(specialOrderDetails?.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Package size={16} />
              </div>

              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Order Products
              </h2>
            </div>

            <p className="mt-1 pl-10 text-xs text-slate-400 dark:text-slate-500">
              Adjust quantity and price before approving the order.
            </p>
          </div>

          {/* Auto calculated total */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 sm:justify-end">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Current Total
            </span>

            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              ₹{calculatedTotal.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/70">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                  Product
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                  Package
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                  Product Size
                </th>

                <th className="px-5 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                  Quantity
                </th>

                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
                  Price
                </th>

                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-400">
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
                      className="border-b border-slate-100 dark:border-slate-800 transition last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/60"
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
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
                              <Package size={19} className="text-slate-400 dark:text-slate-500" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[260px] truncate font-semibold text-slate-700 dark:text-slate-200">
                              {item?.product_name || "-"}
                            </p>

                            <p className="mt-1 max-w-[280px] truncate text-xs text-slate-400 dark:text-slate-500">
                              {item?.product_description || "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Package */}
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {item?.package || "-"}
                      </td>

                      {/* Product Size */}
                      <td className="px-5 py-4">
                        {item?.quantity ? (
                          <span className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                            {item.quantity} {item.unit || ""}
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">-</span>
                        )}
                      </td>

                      {/* Quantity */}
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
                          <input
                            type="number"
                            min="1"
                            value={qty}
                            onChange={(e) =>
                              handleQuantityChange(index, e.target.value)
                            }
                            className="h-9 w-20 rounded-lg bg-transparent px-2 text-center text-sm font-semibold text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
                          />

                          <Pencil size={13} className="mr-2 text-slate-300 dark:text-slate-500" />
                        </div>
                      </td>

                      {/* Editable Price */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <span className="text-sm text-slate-400 dark:text-slate-500">₹</span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) =>
                              handlePriceChange(index, e.target.value)
                            }
                            className="h-9 w-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 text-right text-sm font-semibold text-slate-700 dark:text-slate-100 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-500/20"
                          />

                          <Pencil size={13} className="text-slate-300 dark:text-slate-500" />
                        </div>
                      </td>

                      {/* Auto calculated Subtotal */}
                      <td className="px-5 py-4 text-right font-bold text-slate-800 dark:text-slate-100">
                        ₹{subtotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-5 py-14 text-center">
                    <div className="mx-auto flex max-w-xs flex-col items-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        <Package size={22} className="text-slate-400 dark:text-slate-500" />
                      </div>

                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        No products found
                      </p>

                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
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
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/70 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-400">
              {totalItems} total items
            </p>

            <p className="mt-0.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Order Total
            </p>
          </div>

          <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            ₹{calculatedTotal.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Sticky Actions */}
      {isEditing && (
        <div className="fixed bottom-4 left-4 right-4 z-20 mx-auto max-w-7xl">
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 p-4 shadow-[0_10px_40px_rgba(15,23,42,0.14)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <Pencil size={15} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Unsaved changes
                </p>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Quantity, price, or payment mode has been modified.
                </p>
              </div>
            </div>

            <div className="flex w-full gap-2 sm:w-auto">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
                className="flex-1 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-200 transition hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateAndApprove}
                disabled={isSubmitting}
                className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
              >
                <Check size={16} />

                {isSubmitting ? "Updating..." : "Update & Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOrderDetails;

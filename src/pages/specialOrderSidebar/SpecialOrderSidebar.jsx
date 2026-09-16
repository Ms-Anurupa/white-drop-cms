import { useEffect } from "react";
import {
  X,
  Package,
  UserRound,
  Phone,
  CreditCard,
  CalendarDays,
  Clock3,
  ShoppingCart,
  MapPin,
} from "lucide-react";

import specialOrderStore from "@/zustand/Store/specialOrderStore";

const SpecialOrderSidebar = ({ open, onClose, reqId }) => {
  const getSpecialOrderRequests = specialOrderStore(
    (state) => state.getSpecialOrderRequests,
  );

  const orders = specialOrderStore((state) => state.orders);

  useEffect(() => {
    if (open && reqId) {
      getSpecialOrderRequests({ reqId });
    }
  }, [open, reqId, getSpecialOrderRequests]);

  if (!open) return null;

  const order = Array.isArray(orders) ? orders[0] : orders;

  const cartItems = Array.isArray(order?.cart) ? order.cart : [];

  const itemCount = cartItems.reduce(
    (total, cartItem) => total + Number(cartItem?.qty || 0),
    0,
  );

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case "APPROVED":
        return "bg-green-50 text-green-700 border-green-200";

      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";

      case "CANCELLED":
        return "bg-gray-50 text-gray-600 border-gray-200";

      default:
        return "bg-blue-50 text-blue-700 border-blue-200";
    }
  };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Sidebar */}
      <aside className="absolute right-0 top-0 flex h-full w-full flex-col bg-white shadow-2xl sm:w-[650px]">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Special Order Details
            </h2>

            <p className="mt-0.5 text-xs text-gray-400">
              Request details and customer information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!order ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-gray-400">No special order found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Order Summary */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Package size={16} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Order Summary
                      </h3>

                      <p className="text-xs text-gray-400">
                        Special order request
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClass(
                      order?.status,
                    )}`}
                  >
                    {order?.status || "PENDING"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <p className="text-xs text-gray-400">Order ID</p>
                    <p className="mt-1 break-all text-xs font-medium text-gray-700">
                      {order?.id || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Order Total</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800">
                      ₹{Number(order?.orderTotal || 0).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Payment</p>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
                      <CreditCard size={14} className="text-gray-400" />
                      {order?.paymentMode || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Items</p>
                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {itemCount}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Created At</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-700">
                      <CalendarDays size={14} className="text-gray-400" />
                      {formatDate(order?.createdAt)}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Updated At</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-700">
                      <Clock3 size={14} className="text-gray-400" />
                      {formatDate(order?.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <UserRound size={16} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Customer Details
                    </h3>

                    <p className="text-xs text-gray-400">
                      Customer information
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-400">Customer Name</p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      {order?.user?.customer_name || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Phone</p>

                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-700">
                      <Phone size={14} className="text-gray-400" />

                      {order?.user?.phone_num || "-"}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Customer Type</p>

                    <p className="mt-1 text-sm text-gray-700">
                      {order?.user?.customer_type || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Role</p>

                    <p className="mt-1 text-sm text-gray-700">
                      {order?.user?.role || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Account Status</p>

                    <p className="mt-1 text-sm text-gray-700">
                      {order?.user?.accountStatus || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Wallet Balance</p>

                    <p className="mt-1 text-sm font-medium text-gray-700">
                      ₹{Number(order?.user?.wallet_balance || 0).toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">User Created</p>

                    <p className="mt-1 text-sm text-gray-700">
                      {formatDate(order?.user?.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">User UID</p>

                    <p className="mt-1 break-all text-xs text-gray-600">
                      {order?.user?.userUid || order?.userUid || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address / IDs */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <MapPin size={16} />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-800">
                    Delivery Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-400">Address ID</p>

                    <p className="mt-1 break-all text-xs text-gray-600">
                      {order?.addressId || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">Delivery Slot ID</p>

                    <p className="mt-1 break-all text-xs text-gray-600">
                      {order?.deliverySlotId || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cart */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <ShoppingCart size={16} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        Products
                      </h3>

                      <p className="text-xs text-gray-400">
                        {cartItems.length} product
                        {cartItems.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {cartItems.length > 0 ? (
                    <div className="space-y-3">
                      {cartItems.map((cartItem, index) => {
                        const item = cartItem?.item || {};

                        return (
                          <div
                            key={index}
                            className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                          >
                            <div className="flex gap-3">
                              {/* Product Image */}
                              {item?.product_images?.[0] ? (
                                <img
                                  src={item.product_images[0]}
                                  alt={item?.product_name || "Product"}
                                  className="h-14 w-14 shrink-0 rounded-lg border border-gray-200 bg-white object-cover"
                                />
                              ) : (
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white">
                                  <Package
                                    size={20}
                                    className="text-gray-400"
                                  />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-800">
                                  {item?.product_name || "-"}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  {item?.product_description || "-"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">
                                  ₹{Number(item?.price || 0).toFixed(2)}
                                </p>

                                <p className="mt-1 text-xs text-gray-400">
                                  Qty: {cartItem?.qty || 0}
                                </p>
                              </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-200 pt-3 sm:grid-cols-3">
                              <div>
                                <p className="text-[11px] text-gray-400">
                                  Package
                                </p>

                                <p className="mt-0.5 text-xs text-gray-700">
                                  {item?.package || "-"}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] text-gray-400">
                                  Quantity
                                </p>

                                <p className="mt-0.5 text-xs text-gray-700">
                                  {item?.quantity || "-"} {item?.unit || ""}
                                </p>
                              </div>

                              <div>
                                <p className="text-[11px] text-gray-400">
                                  Offer
                                </p>

                                <p
                                  className={`mt-0.5 text-xs ${
                                    item?.selectedOffer
                                      ? "text-green-600"
                                      : "text-gray-400"
                                  }`}
                                >
                                  {item?.selectedOffer || "No offer"}
                                </p>
                              </div>

                              <div className="col-span-2 sm:col-span-3">
                                <p className="text-[11px] text-gray-400">
                                  Product ID
                                </p>

                                <p className="mt-0.5 break-all text-[11px] text-gray-500">
                                  {item?.product_id || "-"}
                                </p>
                              </div>

                              <div className="col-span-2 sm:col-span-3">
                                <p className="text-[11px] text-gray-400">
                                  Variant ID
                                </p>

                                <p className="mt-0.5 break-all text-[11px] text-gray-500">
                                  {item?.variant_id || "-"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <ShoppingCart
                        size={24}
                        className="mx-auto text-gray-300"
                      />

                      <p className="mt-2 text-sm text-gray-400">
                        No products found
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Clock3 size={16} />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-800">
                    Order Timeline
                  </h3>
                </div>

                <div className="space-y-3 p-4">
                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                    <CalendarDays size={15} className="mt-0.5 text-gray-400" />

                    <div>
                      <p className="text-xs text-gray-400">Created At</p>

                      <p className="mt-1 text-sm text-gray-700">
                        {formatDateTime(order?.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                    <Clock3 size={15} className="mt-0.5 text-gray-400" />

                    <div>
                      <p className="text-xs text-gray-400">Last Updated</p>

                      <p className="mt-1 text-sm text-gray-700">
                        {formatDateTime(order?.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};

export default SpecialOrderSidebar;

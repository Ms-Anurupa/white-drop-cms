/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  Check,
  Clock,
  Search,
  Receipt,
  Navigation,
  CircleDot,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import orderDataStore from "../zustand/Store/orderDataStore";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";
import { useConfirm } from "./ConfirmProvider";
import Loader from "./Loader";
import { resolveFirebaseUrl } from "../utils/resolveUrl";

const STATUS_TOKENS = {
  DELIVERED: {
    badge:
      "bg-[#EAF3DE] text-[#27500A] dark:bg-emerald-950/60 dark:text-emerald-300",
    dot: "bg-[#639922] dark:bg-emerald-400",
  },
  SHIPPED: {
    badge:
      "bg-[#FAEEDA] text-[#633806] dark:bg-amber-950/60 dark:text-amber-300",
    dot: "bg-[#BA7517] dark:bg-amber-400",
  },
  PROCESSING: {
    badge:
      "bg-[#E6F1FB] text-[#0C447C] dark:bg-blue-950/60 dark:text-blue-300",
    dot: "bg-[#378ADD] dark:bg-blue-400",
  },
  CANCELLED: {
    badge:
      "bg-[#FCEBEB] text-[#791F1F] dark:bg-red-950/60 dark:text-red-300",
    dot: "bg-[#E24B4A] dark:bg-red-400",
  },
};

const DEFAULT_TOKEN = {
  badge: "bg-[#F1EFE8] text-[#444441] dark:bg-slate-800 dark:text-slate-300",
  dot: "bg-[#888780] dark:bg-slate-400",
};

const statusToken = (status) => STATUS_TOKENS[status] || DEFAULT_TOKEN;

const StatusPill = ({ status }) => {
  const t = statusToken(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap ${t.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${t.dot}`} />
      {status}
    </span>
  );
};

const STAGES = ["PROCESSING", "INTRANSIT", "DELIVERED"];

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const AVATAR_PALETTE = [
  "bg-[#EEEDFE] text-[#3C3489] dark:bg-indigo-950/60 dark:text-indigo-300",
  "bg-[#E1F5EE] text-[#085041] dark:bg-emerald-950/60 dark:text-emerald-300",
  "bg-[#FAECE7] text-[#712B13] dark:bg-orange-950/60 dark:text-orange-300",
  "bg-[#FBEAF0] text-[#72243E] dark:bg-rose-950/60 dark:text-rose-300",
  "bg-[#E6F1FB] text-[#0C447C] dark:bg-blue-950/60 dark:text-blue-300",
  "bg-[#EAF3DE] text-[#27500A] dark:bg-lime-950/60 dark:text-lime-300",
];

const avatarStyle = (seed = "") => {
  const code = seed.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
};

const OrderViewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  const getOrderById = orderDataStore((state) => state.getOrderById);
  const orderDetails = orderDataStore((state) => state.orderDetails);
  const getDeliveryPersons = deliveryPartnerStore(
    (state) => state.getDeliveryPersons,
  );
  const partners = deliveryPartnerStore((state) => state.partners);
  const associateOrderToDelPerson = orderDataStore(
    (state) => state.associateOrderToDelPerson,
  );

  const [loading, setLoading] = useState(true);
  const [dpMenuOpen, setDpMenuOpen] = useState(false);
  const [dpSearch, setDpSearch] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignedDpId, setAssignedDpId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        await getOrderById?.(id);
      } finally {
        if (active) setLoading(false);
      }
    })();
    getDeliveryPersons?.();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const deliveryAgent = orderDetails?.orderItems?.[0]?.deliveryAgent;

    if (deliveryAgent) {
      setAssignedDpId(deliveryAgent.deliveryPersonId || deliveryAgent.id);
    } else {
      setAssignedDpId(null);
    }
  }, [orderDetails]);

  const handleBack = () => navigate(-1);

  const filteredPartners = useMemo(() => {
    const list = partners || [];
    if (!dpSearch.trim()) return list;
    return list.filter((dp) =>
      `${dp.firstName || ""} ${dp.lastName || ""}`
        .toLowerCase()
        .includes(dpSearch.trim().toLowerCase()),
    );
  }, [partners, dpSearch]);

  const handleAssign = async (dp) => {
    if (!dp || assigning || !orderDetails) return;
    console.log(orderDetails);

    setAssigning(true);
    try {
      const confirmMessage = await confirm({
        title: "Assign Delivery Partner",
        message:
          "This will assign the delivery partner for this order. Continue?",
      });

      if (!confirmMessage) return;

      const payload = {
        id: orderDetails?.id,
        deliveryPersonId: dp.deliveryPersonId,
      };
      console.log("payload", payload);

      await associateOrderToDelPerson(payload);
      await getOrderById(orderDetails.id);
      setAssignedDpId(dp.deliveryPersonId || dp.id);
      setDpMenuOpen(false);
      setDpSearch("");
      toast.success(
        `${dp.firstName} ${dp.lastName} assigned to order ${orderDetails.id}`,
      );
    } catch {
      toast.error("Failed to assign delivery partner");
    } finally {
      setAssigning(false);
    }
  };

  const pageStyle = { fontFamily: "Inter, sans-serif" };
  const fontImport = (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
      .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
    `}</style>
  );

  if (loading) return <Loader text="Loading order details..." />;

  if (!orderDetails) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center gap-4 dark:bg-slate-950"
        style={pageStyle}
      >
        {fontImport}
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#F1EFE8] dark:bg-slate-800">
          <Package size={20} className="text-[#B4B2A9] dark:text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[#14213D] dark:text-slate-100">
            Order not found
          </p>
          <p className="text-xs mt-0.5 text-[#8A8778] dark:text-slate-400">
            It may have been removed or the link is incorrect.
          </p>
        </div>
        <button
          onClick={handleBack}
          className="px-3.5 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors border border-[#E4E1D6] bg-white text-[#14213D] hover:bg-[#FAF9F5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
        >
          Go back
        </button>
      </div>
    );
  }

  const order = orderDetails;
  const items = order.orderItems || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.variant?.price || 0) * (item.qty || 0),
    0,
  );
  const stageIdx = STAGES.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "CANCELLED";

  return (
    <div className="min-h-[85vh] w-full p-6 dark:bg-slate-950" style={pageStyle}>
      {fontImport}

      {/* Header */}
      <div className="sticky -mt-4 z-20 bg-[#f7f6f2]/92 backdrop-blur-md border-b border-[#faf7ed] dark:bg-slate-950/90 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors border border-[#E4E1D6] text-[#14213D] hover:bg-[#EFECE1] dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="mono text-lg font-bold tracking-tight text-[#264da3] dark:text-blue-400">
                  {order.orderId}
                </h1>
                <StatusPill status={order.orderStatus} />
              </div>
              <p className="flex items-center text-gray-950 dark:text-slate-400 gap-1.5 mt-1 text-xs">
                <Clock size={12} />
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase text-gray-950 dark:text-slate-400 tracking-wider font-medium">
              Total amount
            </p>
            <h2 className="mono text-2xl font-bold text-[#14213D] dark:text-slate-100">
              ₹{Number(order.orderTotal || 0).toLocaleString("en-IN")}
            </h2>
          </div>
        </div>

        {/* Route / status strip */}
        {!isCancelled && (
          <div className="max-w-6xl mx-auto px-6 pb-4">
            <div className="flex items-center">
              {STAGES.map((stage, i) => {
                const done = i <= stageIdx;
                const isLast = i === STAGES.length - 1;
                return (
                  <div
                    key={stage}
                    className="flex items-center flex-1 last:flex-none"
                  >
                    <div className="flex items-center gap-2">
                      <CircleDot
                        size={14}
                        className={
                          done
                            ? "text-[#8a340e] dark:text-amber-400"
                            : "text-[#D3D1C7] dark:text-slate-700"
                        }
                        strokeWidth={2.5}
                      />
                      <span
                        className={`text-xs font-medium whitespace-nowrap ${
                          done
                            ? "text-[#14213D] dark:text-slate-100"
                            : "text-[#B4B2A9] dark:text-slate-500"
                        }`}
                      >
                        {stage.charAt(0) + stage.slice(1).toLowerCase()}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className={`flex-1 h-px mx-3 ${
                          i < stageIdx
                            ? "bg-[#C65D2E] dark:bg-amber-500"
                            : "bg-[#E4E1D6] dark:bg-slate-800"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-4 grid lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-2">
          {/* Products */}
          <div className="rounded-2xl overflow-hidden bg-white border border-[#E4E1D6] dark:bg-slate-900 dark:border-slate-800">
            <div className="px-5 py-4 flex items-center gap-2 border-b border-[#E4E1D6] dark:border-slate-800">
              <Package size={16} className="text-[#8A8778] dark:text-slate-400" />
              <h2 className="font-semibold text-sm text-[#14213D] dark:text-slate-100">
                Ordered products
              </h2>
              <span className="mono text-xs text-[#B4B2A9] dark:text-slate-400">
                {items.length}
              </span>
            </div>

            <div>
              {items.length === 0 ? (
                <p className="text-sm text-center py-10 text-[#B4B2A9] dark:text-slate-500">
                  No products found on this order.
                </p>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`p-2 flex gap-4 items-center transition-colors hover:bg-[#FAF9F5] dark:hover:bg-slate-800/60 ${
                      idx < items.length - 1
                        ? "border-b border-[#F0EEE5] dark:border-slate-800"
                        : ""
                    }`}
                  >
                    <img
                      src={resolveFirebaseUrl({
                        folderName: "productImages",
                        fileName: item.product?.product_images?.[0],
                      })}
                      alt={item.product?.product_name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0 border border-[#E4E1D6] dark:border-slate-700"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-[#14213D] dark:text-slate-100">
                        {item.product?.product_name}
                      </h3>
                      <p className="text-xs mt-0.5 whitespace-normal text-[#8A8778] dark:text-slate-400">
                        {item.product?.product_description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs text-[#5F5E5A] dark:text-slate-400">
                        <span>
                          Variant{" "}
                          <strong className="mono font-semibold text-[#14213D] dark:text-slate-200">
                            {item.variant?.quantity}
                            {item.variant?.unit}
                          </strong>
                        </span>
                        <span>
                          Package{" "}
                          <strong className="font-semibold capitalize text-[#14213D] dark:text-slate-200">
                            {item.variant?.package}
                          </strong>
                        </span>
                        <span>
                          Qty{" "}
                          <strong className="mono font-semibold text-[#14213D] dark:text-slate-200">
                            {item.qty}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="mono text-xs text-[#8A8778] dark:text-slate-400">
                        ₹{item.variant?.price} × {item.qty}
                      </p>
                      <h4 className="mono text-base font-semibold mt-0.5 text-[#14213D] dark:text-slate-100">
                        ₹
                        {(
                          (item.variant?.price || 0) * (item.qty || 0)
                        ).toLocaleString("en-IN")}
                      </h4>
                      <div className="mt-2 flex justify-end">
                        <StatusPill status={order?.orderStatus} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-2xl overflow-hidden bg-white border border-[#E4E1D6] dark:bg-slate-900 dark:border-slate-800">
            <div className="px-5 py-4 flex items-center gap-2 border-b border-[#E4E1D6] dark:border-slate-800">
              <MapPin size={16} className="text-[#8A8778] dark:text-slate-400" />
              <h2 className="font-semibold text-sm text-[#14213D] dark:text-slate-100">
                Shipping address
              </h2>
            </div>

            <div className="px-5 py-4 space-y-2">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-medium mb-1 text-[#B4B2A9] dark:text-slate-400">
                  Address type
                </p>
                <p className="text-sm font-medium text-[#14213D] dark:text-slate-100">
                  {order.shippingAddress?.addressType}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider font-medium mb-1 text-[#B4B2A9] dark:text-slate-400">
                  Apartment
                </p>
                <p className="text-sm text-[#3A3936] dark:text-slate-300">
                  {order.shippingAddress?.apartment}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider font-medium mb-1 text-[#B4B2A9] dark:text-slate-400">
                  Locality
                </p>
                <p className="text-sm text-[#3A3936] dark:text-slate-300">
                  {order.shippingAddress?.locality}
                </p>
              </div>

              {order.shippingAddress?.coordinate?.lat && (
                <a
                  href={`https://www.google.com/maps?q=${order.shippingAddress.coordinate.lat},${order.shippingAddress.coordinate.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full mt-1 rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-colors border border-[#E4E1D6] text-[#5F5E5A] hover:bg-[#FAF9F5] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <Navigation size={13} />
                  Open in maps
                </a>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-2">
          {/* Delivery Partner */}
          <div className="rounded-2xl overflow-hidden bg-white border border-[#E4E1D6] dark:bg-slate-900 dark:border-slate-800">
            <div className="px-5 py-4 flex items-center gap-2 border-b border-[#E4E1D6] dark:border-slate-800">
              <Truck size={16} className="text-[#C65D2E] dark:text-orange-400" />
              <h2 className="font-semibold text-sm text-[#14213D] dark:text-slate-100">
                Manage Delivery
              </h2>
            </div>

            <div className="p-5">
              <button
                onClick={() => {
                  if (order?.orderStatus.toUpperCase() !== "PLACED") {
                    toast.error(
                      "To Manage Delivery change the order status to placed",
                    );
                    return;
                  }
                  navigate("/dashboard/delivery-job");
                }}
                disabled={assigning}
                className="w-full rounded-xl p-4 text-sm font-medium cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60 border-[1.5px] border-dashed border-[#D3D1C7] text-[#8A8778] hover:border-[#C65D2E] hover:text-[#C65D2E] dark:border-slate-700 dark:text-slate-400 dark:hover:border-orange-400 dark:hover:text-orange-400"
              >
                Manage delivery
              </button>

              {dpMenuOpen && (
                <div className="mt-4 rounded-xl overflow-visible relative border border-[#E4E1D6] dark:border-slate-700 dark:bg-slate-900">
                  <div className="relative p-2.5 border-b border-[#E4E1D6] dark:border-slate-800">
                    <Search
                      size={14}
                      className="absolute left-5 top-1/2 -translate-y-1/2 text-[#B4B2A9] dark:text-slate-400"
                    />
                    <input
                      value={dpSearch}
                      onChange={(e) => setDpSearch(e.target.value)}
                      placeholder="Search partners…"
                      className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none border border-[#E4E1D6] text-[#14213D] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto">
                    {filteredPartners.map((dp) => (
                      <div
                        key={dp.deliveryPersonId}
                        className="group border-b border-gray-100 dark:border-slate-800 last:border-b-0"
                      >
                        <button
                          onClick={() => handleAssign(dp)}
                          disabled={
                            assigning ||
                            assignedDpId === (dp.deliveryPersonId || dp.id)
                          }
                          className="w-full p-3 flex items-center justify-between transition-colors hover:bg-[#FAF9F5] dark:hover:bg-slate-800/60 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${avatarStyle(
                                `${dp.firstName} ${dp.lastName}`,
                              )}`}
                            >
                              {initials(`${dp.firstName} ${dp.lastName}`)}
                            </div>

                            <div className="text-left">
                              <p className="text-sm font-medium text-[#14213D] dark:text-slate-100">
                                {dp.firstName} {dp.lastName}
                              </p>

                              <p className="text-xs whitespace-normal text-[#8A8778] dark:text-slate-400">
                                {dp.areaCovered || "Area not assigned"}
                              </p>
                            </div>
                          </div>

                          {assignedDpId === (dp.deliveryPersonId || dp.id) && (
                            <Check size={16} className="text-[#C65D2E] dark:text-orange-400" />
                          )}
                        </button>

                        {/* Hover Details */}
                        <div
                          className="
                          max-h-0
                          overflow-hidden
                          group-hover:max-h-60
                          transition-all
                          duration-300
                        "
                        >
                          <div className="mx-3 mb-3 rounded-lg p-3 text-xs bg-[#FAF9F5] border border-[#E4E1D6] text-[#14213D] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                            <div className="grid grid-cols-2 gap-y-2">
                              <span className="text-[#8A8778] dark:text-slate-400">Phone</span>
                              <span>{dp.phoneNo}</span>

                              <span className="text-[#8A8778] dark:text-slate-400">Vehicle</span>
                              <span>{dp.vehicleNumber}</span>

                              <span className="text-[#8A8778] dark:text-slate-400">Area</span>
                              <span className="whitespace-normal">
                                {dp.areaCovered || "-"}
                              </span>

                              <span className="text-[#8A8778] dark:text-slate-400">Status</span>
                              <span
                                className={
                                  dp.active
                                    ? "text-green-600 dark:text-emerald-400"
                                    : "text-red-500 dark:text-red-400"
                                }
                              >
                                {dp.active ? "Active" : "Inactive"}
                              </span>

                              <span className="text-[#8A8778] dark:text-slate-400">
                                Documents
                              </span>
                              <span
                                className={
                                  dp.documentsVerified
                                    ? "text-green-600 dark:text-emerald-400"
                                    : "text-yellow-600 dark:text-amber-400"
                                }
                              >
                                {dp.documentsVerified ? "Verified" : "Pending"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredPartners.length === 0 && (
                      <p className="text-center text-xs py-6 text-[#B4B2A9] dark:text-slate-500">
                        No partners match that search.
                      </p>
                    )}
                    {filteredPartners.length === 0 && (
                      <p className="text-center text-xs py-6 text-[#B4B2A9] dark:text-slate-500">
                        No partners match that search.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl overflow-hidden bg-white border border-[#E4E1D6] dark:bg-slate-900 dark:border-slate-800">
            <div className="px-5 py-4 flex items-center gap-2 border-b border-[#E4E1D6] dark:border-slate-800">
              <Receipt size={16} className="text-[#8A8778] dark:text-slate-400" />
              <h2 className="font-semibold text-sm text-[#14213D] dark:text-slate-100">
                Order summary
              </h2>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8778] dark:text-slate-400">Items</span>
                <span className="mono font-medium text-[#14213D] dark:text-slate-100">
                  {items.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#8A8778] dark:text-slate-400">Subtotal</span>
                <span className="mono font-medium text-[#14213D] dark:text-slate-100">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="pt-3 flex justify-between items-baseline border-t border-[#E4E1D6] dark:border-slate-800">
                <span className="text-sm font-semibold text-[#14213D] dark:text-slate-100">
                  Total
                </span>
                <span className="mono text-xl font-semibold text-[#14213D] dark:text-slate-100">
                  ₹{Number(order.orderTotal || 0).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderViewDetails;

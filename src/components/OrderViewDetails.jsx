/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState, useRef } from "react";
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  Check,
  Loader2,
  Clock,
  Search,
  Receipt,
  Phone,
  Navigation,
  CircleDot,
  Home,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import orderDataStore from "../zustand/Store/orderDataStore";
import deliveryPartnerStore from "../zustand/Store/deliveryPartnerStore";
import { getProductUrl } from "../utils/resolveProductUrl";
import { useConfirm } from "./ConfirmProvider";
import Loader from "./Loader";
import { createPortal } from "react-dom";

const STATUS_TOKENS = {
  DELIVERED: { bg: "#EAF3DE", text: "#27500A", dot: "#639922" },
  SHIPPED: { bg: "#FAEEDA", text: "#633806", dot: "#BA7517" },
  PROCESSING: { bg: "#E6F1FB", text: "#0C447C", dot: "#378ADD" },
  CANCELLED: { bg: "#FCEBEB", text: "#791F1F", dot: "#E24B4A" },
};

const DEFAULT_TOKEN = { bg: "#F1EFE8", text: "#444441", dot: "#888780" };

const statusToken = (status) => STATUS_TOKENS[status] || DEFAULT_TOKEN;

const StatusPill = ({ status }) => {
  const t = statusToken(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide whitespace-nowrap"
      style={{ background: t.bg, color: t.text }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ background: t.dot }}
      />
      {status}
    </span>
  );
};

const STAGES = ["PROCESSING", "SHIPPED", "DELIVERED"];

// truncated area-covered line for the assigned delivery partner address card
const AreaCoveredHover = ({ text }) => {
  const [isTruncated, setIsTruncated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      setIsTruncated(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [text]);

  if (!text) {
    return (
      <p className="text-xs italic mt-0.5" style={{ color: "#B4B2A9" }}>
        Area not assigned
      </p>
    );
  }

  const handleMouseEnter = () => {
    if (!isTruncated || !textRef.current) return;
    const rect = textRef.current.getBoundingClientRect();
    const tooltipWidth = 256; // fixed tooltip width
    const left = Math.min(rect.left, window.innerWidth - tooltipWidth - 16);
    setTooltipPos({ top: rect.bottom + 8, left: Math.max(left, 8) });
    setShowTooltip(true);
  };

  return (
    <>
      <p
        className="flex items-center gap-1 mt-0.5 text-xs"
        style={{ color: "#8A8778" }}
      >
        <Home size={11} className="shrink-0" />
        <span
          ref={textRef}
          className="truncate"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {text}
        </span>
      </p>
      {showTooltip &&
        isTruncated &&
        createPortal(
          <div
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
            }}
            className="fixed z-50 w-64 text-gray-950 bg-white text-xs 
            rounded-lg px-3 py-2 shadow-lg leading-relaxed pointer-events-none break-words"
          >
            {text}
          </div>,
          document.body,
        )}
    </>
  );
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

const AVATAR_PALETTE = [
  { bg: "#EEEDFE", text: "#3C3489" },
  { bg: "#E1F5EE", text: "#085041" },
  { bg: "#FAECE7", text: "#712B13" },
  { bg: "#FBEAF0", text: "#72243E" },
  { bg: "#E6F1FB", text: "#0C447C" },
  { bg: "#EAF3DE", text: "#27500A" },
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

  const assignedDp = useMemo(() => {
    const deliveryAgent = orderDetails?.orderItems?.[0]?.deliveryAgent;

    if (deliveryAgent) {
      return deliveryAgent;
    }

    if (!assignedDpId) return null;

    return partners?.find(
      (p) => p.deliveryPersonId === assignedDpId || p.id === assignedDpId,
    );
  }, [assignedDpId, partners, orderDetails]);

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
        className="min-h-screen w-full flex flex-col items-center justify-center gap-4"
        style={pageStyle}
      >
        {fontImport}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "#F1EFE8" }}
        >
          <Package size={20} style={{ color: "#B4B2A9" }} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium" style={{ color: "#14213D" }}>
            Order not found
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#8A8778" }}>
            It may have been removed or the link is incorrect.
          </p>
        </div>
        <button
          onClick={handleBack}
          className="px-3.5 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors"
          style={{
            border: "1px solid #E4E1D6",
            background: "#FFFFFF",
            color: "#14213D",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF9F5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#FFFFFF")}
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
    <div className="min-h-[85vh] w-full" style={pageStyle}>
      {fontImport}

      {/* Header */}
      <div
        className="sticky -mt-4 z-20"
        style={{
          background: "rgba(247,246,242,0.92)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #faf7ed",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{ border: "1px solid #E4E1D6", color: "#14213D" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#EFECE1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <ArrowLeft size={17} />
            </button>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1
                  className="mono text-lg font-bold tracking-tight"
                  style={{ color: "#264da3" }}
                >
                  {order.orderId}
                </h1>
                <StatusPill status={order.orderStatus} />
              </div>
              <p className="flex items-center text-gray-950 gap-1.5 mt-1 text-xs">
                <Clock size={12} />
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[11px] uppercase text-gray-950 tracking-wider font-medium">
              Total amount
            </p>
            <h2
              className="mono text-2xl font-bold"
              style={{ color: "#14213D" }}
            >
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
                        style={{ color: done ? "#8a340e" : "#D3D1C7" }}
                        strokeWidth={2.5}
                      />
                      <span
                        className="text-xs font-medium whitespace-nowrap"
                        style={{ color: done ? "#14213D" : "#B4B2A9" }}
                      >
                        {stage.charAt(0) + stage.slice(1).toLowerCase()}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className="flex-1 h-px mx-3"
                        style={{
                          background: i < stageIdx ? "#C65D2E" : "#E4E1D6",
                        }}
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
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid #E4E1D6" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid #E4E1D6" }}
            >
              <Package size={16} style={{ color: "#8A8778" }} />
              <h2
                className="font-semibold text-sm"
                style={{ color: "#14213D" }}
              >
                Ordered products
              </h2>
              <span className="mono text-xs" style={{ color: "#B4B2A9" }}>
                {items.length}
              </span>
            </div>

            <div>
              {items.length === 0 ? (
                <p
                  className="text-sm text-center py-10"
                  style={{ color: "#B4B2A9" }}
                >
                  No products found on this order.
                </p>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-2 flex gap-4 items-center transition-colors"
                    style={{
                      borderBottom:
                        idx < items.length - 1 ? "1px solid #F0EEE5" : "none",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#FAF9F5")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <img
                      src={getProductUrl(item.product?.product_images?.[0])}
                      alt={item.product?.product_name}
                      className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                      style={{ border: "1px solid #E4E1D6" }}
                    />

                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium text-sm"
                        style={{ color: "#14213D" }}
                      >
                        {item.product?.product_name}
                      </h3>
                      <p
                        className="text-xs mt-0.5 whitespace-normal"
                        style={{ color: "#8A8778" }}
                      >
                        {item.product?.product_description}
                      </p>

                      <div
                        className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5 text-xs"
                        style={{ color: "#5F5E5A" }}
                      >
                        <span>
                          Variant{" "}
                          <strong
                            className="mono font-semibold"
                            style={{ color: "#14213D" }}
                          >
                            {item.variant?.quantity}
                            {item.variant?.unit}
                          </strong>
                        </span>
                        <span>
                          Package{" "}
                          <strong
                            className="font-semibold capitalize"
                            style={{ color: "#14213D" }}
                          >
                            {item.variant?.package}
                          </strong>
                        </span>
                        <span>
                          Qty{" "}
                          <strong
                            className="mono font-semibold"
                            style={{ color: "#14213D" }}
                          >
                            {item.qty}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="mono text-xs" style={{ color: "#8A8778" }}>
                        ₹{item.variant?.price} × {item.qty}
                      </p>
                      <h4
                        className="mono text-base font-semibold mt-0.5"
                        style={{ color: "#14213D" }}
                      >
                        ₹
                        {(
                          (item.variant?.price || 0) * (item.qty || 0)
                        ).toLocaleString("en-IN")}
                      </h4>
                      <div className="mt-2 flex justify-end">
                        <StatusPill status={item.deliverStatus} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Shipping */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid #E4E1D6" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid #E4E1D6" }}
            >
              <MapPin size={16} style={{ color: "#8A8778" }} />
              <h2
                className="font-semibold text-sm"
                style={{ color: "#14213D" }}
              >
                Shipping address
              </h2>
            </div>

            <div className="px-5 py-4 space-y-2">
              <div>
                <p
                  className="text-[11px] uppercase tracking-wider font-medium mb-1"
                  style={{ color: "#B4B2A9" }}
                >
                  Address type
                </p>
                <p className="text-sm font-medium" style={{ color: "#14213D" }}>
                  {order.shippingAddress?.addressType}
                </p>
              </div>

              <div>
                <p
                  className="text-[11px] uppercase tracking-wider font-medium mb-1"
                  style={{ color: "#B4B2A9" }}
                >
                  Apartment
                </p>
                <p className="text-sm" style={{ color: "#3A3936" }}>
                  {order.shippingAddress?.apartment}
                </p>
              </div>

              <div>
                <p
                  className="text-[11px] uppercase tracking-wider font-medium mb-1"
                  style={{ color: "#B4B2A9" }}
                >
                  Locality
                </p>
                <p className="text-sm" style={{ color: "#3A3936" }}>
                  {order.shippingAddress?.locality}
                </p>
              </div>

              {order.shippingAddress?.coordinate?.lat && (
                <a
                  href={`https://www.google.com/maps?q=${order.shippingAddress.coordinate.lat},${order.shippingAddress.coordinate.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full mt-1 rounded-xl py-2.5 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-colors"
                  style={{ border: "1px solid #E4E1D6", color: "#5F5E5A" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FAF9F5")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
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
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid #E4E1D6" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid #E4E1D6" }}
            >
              <Truck size={16} style={{ color: "#C65D2E" }} />
              <h2
                className="font-semibold text-sm"
                style={{ color: "#14213D" }}
              >
                Delivery partner
              </h2>
            </div>

            <div className="p-5">
              {assignedDp ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center
                     font-semibold text-sm flex-shrink-0"
                    style={{
                      background: avatarStyle(
                        `${assignedDp.firstName || ""} ${assignedDp.lastName || ""}`,
                      ).bg,
                      color: avatarStyle(
                        `${assignedDp.firstName || ""} ${assignedDp.lastName || ""}`,
                      ).text,
                    }}
                  >
                    {initials(
                      `${assignedDp.firstName || ""} ${assignedDp.lastName || ""}`,
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-medium text-sm"
                      style={{ color: "#14213D" }}
                    >
                      {assignedDp.firstName} {assignedDp.lastName}
                    </h3>
                    {assignedDp.phoneNo && (
                      <p
                        className="mono text-xs flex items-center gap-1 mt-0.5"
                        style={{ color: "#8A8778" }}
                      >
                        <Phone size={11} />
                        {assignedDp.phoneNo}
                      </p>
                    )}

                    <AreaCoveredHover text={assignedDp.areaCovered} />
                  </div>
                  <button
                    onClick={() => setDpMenuOpen(!dpMenuOpen)}
                    className="text-xs font-medium cursor-pointer flex-shrink-0"
                    style={{ color: "#C65D2E" }}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDpMenuOpen(!dpMenuOpen)}
                  disabled={assigning}
                  className="w-full rounded-xl p-4 text-sm font-medium cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ border: "1.5px dashed #D3D1C7", color: "#8A8778" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#C65D2E";
                    e.currentTarget.style.color = "#C65D2E";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#D3D1C7";
                    e.currentTarget.style.color = "#8A8778";
                  }}
                >
                  {assigning ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Assigning…
                    </span>
                  ) : (
                    "Assign delivery partner"
                  )}
                </button>
              )}

              {dpMenuOpen && (
                <div
                  className="mt-4 rounded-xl overflow-visible relative"
                  style={{ border: "1px solid #E4E1D6" }}
                >
                  <div
                    className="relative p-2.5"
                    style={{ borderBottom: "1px solid #E4E1D6" }}
                  >
                    <Search
                      size={14}
                      className="absolute left-5 top-1/2 -translate-y-1/2"
                      style={{ color: "#B4B2A9" }}
                    />
                    <input
                      value={dpSearch}
                      onChange={(e) => setDpSearch(e.target.value)}
                      placeholder="Search partners…"
                      className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
                      style={{ border: "1px solid #E4E1D6", color: "#14213D" }}
                    />
                  </div>

                  <div className="max-h-56 overflow-y-auto">
                    {filteredPartners.map((dp) => (
                      <div
                        key={dp.deliveryPersonId}
                        className="group border-b border-gray-100 last:border-b-0"
                      >
                        <button
                          onClick={() => handleAssign(dp)}
                          disabled={
                            assigning ||
                            assignedDpId === (dp.deliveryPersonId || dp.id)
                          }
                          className="w-full p-3 flex items-center justify-between transition-colors hover:bg-[#FAF9F5] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold"
                              style={{
                                background: avatarStyle(
                                  `${dp.firstName} ${dp.lastName}`,
                                ).bg,
                                color: avatarStyle(
                                  `${dp.firstName} ${dp.lastName}`,
                                ).text,
                              }}
                            >
                              {initials(`${dp.firstName} ${dp.lastName}`)}
                            </div>

                            <div className="text-left">
                              <p
                                className="text-sm font-medium"
                                style={{ color: "#14213D" }}
                              >
                                {dp.firstName} {dp.lastName}
                              </p>

                              <p
                                className="text-xs whitespace-normal"
                                style={{ color: "#8A8778" }}
                              >
                                {dp.areaCovered || "Area not assigned"}
                              </p>
                            </div>
                          </div>

                          {assignedDpId === (dp.deliveryPersonId || dp.id) && (
                            <Check size={16} style={{ color: "#C65D2E" }} />
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
                          <div
                            className="mx-3 mb-3 rounded-lg p-3 text-xs"
                            style={{
                              background: "#FAF9F5",
                              border: "1px solid #E4E1D6",
                              color: "#14213D",
                            }}
                          >
                            <div className="grid grid-cols-2 gap-y-2">
                              <span style={{ color: "#8A8778" }}>Phone</span>
                              <span>{dp.phoneNo}</span>

                              <span style={{ color: "#8A8778" }}>Vehicle</span>
                              <span>{dp.vehicleNumber}</span>

                              <span style={{ color: "#8A8778" }}>Area</span>
                              <span className="whitespace-normal">
                                {dp.areaCovered || "-"}
                              </span>

                              <span style={{ color: "#8A8778" }}>Status</span>
                              <span
                                className={
                                  dp.active ? "text-green-600" : "text-red-500"
                                }
                              >
                                {dp.active ? "Active" : "Inactive"}
                              </span>

                              <span style={{ color: "#8A8778" }}>
                                Documents
                              </span>
                              <span
                                className={
                                  dp.documentsVerified
                                    ? "text-green-600"
                                    : "text-yellow-600"
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
                      <p
                        className="text-center text-xs py-6"
                        style={{ color: "#B4B2A9" }}
                      >
                        No partners match that search.
                      </p>
                    )}
                    {filteredPartners.length === 0 && (
                      <p
                        className="text-center text-xs py-6"
                        style={{ color: "#B4B2A9" }}
                      >
                        No partners match that search.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: "#FFFFFF", border: "1px solid #E4E1D6" }}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"
              style={{ borderBottom: "1px solid #E4E1D6" }}
            >
              <Receipt size={16} style={{ color: "#8A8778" }} />
              <h2
                className="font-semibold text-sm"
                style={{ color: "#14213D" }}
              >
                Order summary
              </h2>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8A8778" }}>Items</span>
                <span className="mono font-medium" style={{ color: "#14213D" }}>
                  {items.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#8A8778" }}>Subtotal</span>
                <span className="mono font-medium" style={{ color: "#14213D" }}>
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>

              <div
                className="pt-3 flex justify-between items-baseline"
                style={{ borderTop: "1px solid #E4E1D6" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#14213D" }}
                >
                  Total
                </span>
                <span
                  className="mono text-xl font-semibold"
                  style={{ color: "#14213D" }}
                >
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

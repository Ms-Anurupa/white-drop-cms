/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  UserRound,
  X,
  Phone,
  Clock3,
  Repeat // <-- Added for Subscription Icon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import deliveryJobStore from "../zustand/Store/deliveryJobStore";
import orderDataStore from "../zustand/Store/orderDataStore";
import { resolveFirebaseUrl } from "../utils/resolveUrl";

const STATUS_STYLES = {
  PLACED: "bg-blue-50 text-blue-700 border-blue-100",
  PROCESSING: "bg-amber-50 text-amber-700 border-amber-100",
  CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-100",
  SHIPPED: "bg-violet-50 text-violet-700 border-violet-100",
  INTRANSIT: "bg-purple-50 text-purple-700 border-purple-100",
  DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-100",
  FAILED: "bg-red-50 text-red-700 border-red-100",
};
const MAX_ORDERS = 20;

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || "bg-slate-50 text-slate-600 border-slate-200";

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getOrderId = (order) => order?.id;
const getOrderNumber = (order) => order?.orderId;
const getCustomerName = (order) => order?.user?.customer_name?.trim() || "Customer";

const getOrderAmount = (order) => {
  // Subscriptions don't show money here
  if (order?.type === "SUBSCRIPTION") return null;
  
  const amount = order?.orderTotal;
  if (amount === null || amount === undefined) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const getOrderQuantity = (order) => {
  if (!order) return "—";

  if (order.type === "SUBSCRIPTION") {
    const qty = order.orderTotal;
    if (qty === null || qty === undefined) return "—";
    return `${qty} Unit${qty !== 1 ? 's' : ''}`;
  }

  if (order.type === "ORDER") {
    if (!order.orderItems || order.orderItems.length === 0) return "0 Units";
    const totalQty = order.orderItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
    return `${totalQty} Unit${totalQty !== 1 ? 's' : ''}`;
  }

  return "—";
};
const getOrderAddress = (order) => {
  const address = order?.shippingAddress;
  if (!address) return "";
  return [address.apartment, address.locality].filter(Boolean).join(", ");
};

const isOrderAssociated = (order, deliveryJobId) =>
  Boolean(order?.deliveryJobId && order.deliveryJobId === deliveryJobId);

const AssignOrderToDeliveryJob = () => {
  const navigate = useNavigate();
  const { id: deliveryJobId } = useParams();
  const location = useLocation();
  const job = location.state?.job;

  const associateOrderToDeliveryJob = deliveryJobStore((state) => state.associateOrderToDeliveryJob);
  const getAssignableOrders = orderDataStore((state) => state.getAssignableOrders);
  const orders = orderDataStore((state) => state.orders);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [initialAssociatedOrders, setInitialAssociatedOrders] = useState([]);
  const [isAssociating, setIsAssociating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [associationFilter, setAssociationFilter] = useState("all");
  const hydratedOrders = Array.isArray(orders) ? orders : [];

  useEffect(() => {
    if (deliveryJobId) {
      getAssignableOrders({ deliJobId: deliveryJobId });
    }
  }, [getAssignableOrders, deliveryJobId]);

  useEffect(() => {
    if (!hydratedOrders.length) return;

    const associatedOrderIds = hydratedOrders
      .filter((order) => isOrderAssociated(order, deliveryJobId))
      .map((order) => getOrderId(order))
      .filter(Boolean);

    setInitialAssociatedOrders([...associatedOrderIds]);
    setSelectedOrders([...associatedOrderIds]);
  }, [hydratedOrders, deliveryJobId]);

  const baseFilteredOrders = useMemo(() => {
    let result = hydratedOrders;

    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(
        (order) =>
          order.orderId?.toLowerCase().includes(lowerSearch) ||
          order.user?.customer_name?.toLowerCase().includes(lowerSearch)
      );
    }
    if (status) {
      result = result.filter((order) => order.orderStatus === status);
    }
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      result = result.filter((order) => new Date(order.createdAt) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      result = result.filter((order) => new Date(order.createdAt) <= to);
    }
    if (associationFilter === "associated") {
      result = result.filter((order) => isOrderAssociated(order, deliveryJobId));
    } else if (associationFilter === "non-associated") {
      result = result.filter((order) => !isOrderAssociated(order, deliveryJobId));
    }

    return result;
  }, [hydratedOrders, search, status, fromDate, toDate, associationFilter, deliveryJobId]);

  const totalPages = Math.ceil(baseFilteredOrders.length / pageSize) || 1;
  const filteredOrders = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return baseFilteredOrders.slice(startIndex, startIndex + pageSize);
  }, [baseFilteredOrders, page, pageSize]);

  const associatedCount = hydratedOrders.filter((order) => isOrderAssociated(order, deliveryJobId)).length;
  const nonAssociatedCount = hydratedOrders.filter((order) => !isOrderAssociated(order, deliveryJobId)).length;

  const initialAssociatedSet = useMemo(() => new Set(initialAssociatedOrders), [initialAssociatedOrders]);
  const selectedSet = useMemo(() => new Set(selectedOrders), [selectedOrders]);

  const ordersToAssociate = useMemo(() => selectedOrders.filter((id) => !initialAssociatedSet.has(id)), [selectedOrders, initialAssociatedSet]);
  const ordersToRemove = useMemo(() => initialAssociatedOrders.filter((id) => !selectedSet.has(id)), [initialAssociatedOrders, selectedSet]);

  const hasAssociationChanges = ordersToAssociate.length > 0 || ordersToRemove.length > 0;

  const toggleOrder = (order) => {
    const orderId = getOrderId(order);
    if (!orderId) return;

    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) return prev.filter((id) => id !== orderId);
      if (prev.length >= MAX_ORDERS) {
        toast.warning(`You can assign a maximum of ${MAX_ORDERS} tasks.`);
        return prev;
      }
      return [...prev, orderId];
    });
  };

  const visibleSelectableOrderIds = filteredOrders.map((order) => getOrderId(order)).filter(Boolean);
  const allVisibleSelected = visibleSelectableOrderIds.length > 0 && visibleSelectableOrderIds.every((id) => selectedOrders.includes(id));

  const toggleSelectAll = () => {
    if (!visibleSelectableOrderIds.length) {
      toast.info("There are no tasks to select");
      return;
    }
    if (allVisibleSelected) {
      setSelectedOrders((prev) => prev.filter((id) => !visibleSelectableOrderIds.includes(id)));
      return;
    }
    if (visibleSelectableOrderIds.length > MAX_ORDERS) {
      toast.warning(`Select All is available only when there are ${MAX_ORDERS} or fewer tasks.`);
      return;
    }

    const availableSlots = MAX_ORDERS - selectedOrders.length;
    if (availableSlots <= 0 || visibleSelectableOrderIds.length > availableSlots) {
      toast.warning(`You can assign a maximum of ${MAX_ORDERS} tasks.`);
      return;
    }

    setSelectedOrders((prev) => [...new Set([...prev, ...visibleSelectableOrderIds])]);
  };

  const clearSelection = () => setSelectedOrders([...initialAssociatedOrders]);

  const handleAssociateOrder = async () => {
    if (!deliveryJobId || !hasAssociationChanges) return;

    try {
      setIsAssociating(true);

      // --- NEW: Map the string IDs back into { id, type } objects ---
      const payloadTasks = selectedOrders.map((id) => {
        const originalObj = hydratedOrders.find((o) => getOrderId(o) === id);
        return { 
          id: id, 
          type: originalObj.type 
        };
      });

      // Send the new payload shape to your Zustand store
      await associateOrderToDeliveryJob({
        deliveryJobId,
        tasks: payloadTasks, // Changed from orderIds to tasks
      });

      setInitialAssociatedOrders([...selectedOrders]);
      await getAssignableOrders({ deliJobId: deliveryJobId });

      if (ordersToAssociate.length > 0 && ordersToRemove.length > 0) {
        toast.success(`${ordersToAssociate.length} added · ${ordersToRemove.length} removed`);
      } else if (ordersToAssociate.length > 0) {
        toast.success(`${ordersToAssociate.length} task(s) added to route`);
      } else {
        toast.success(`${ordersToRemove.length} task(s) removed from route`);
      }
    } catch (error) {
      console.error("Failed to update route:", error);
      toast.error("Failed to update delivery route");
    } finally {
      setIsAssociating(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setAssociationFilter("all");
    setPage(1);
    setSelectedOrders([...initialAssociatedOrders]);
  };

  const hasFilters = Boolean(search) || Boolean(status) || Boolean(fromDate) || Boolean(toDate) || associationFilter !== "all";
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  return (
    <div className="w-full min-h-full bg-slate-50 p-4 sm:p-5">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP HEADER */}
        <div className="relative overflow-hidden rounded-2xl bg-[#3B5CCC] px-5 sm:px-7 py-5 mb-4">
          <svg className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 200">
            <path d="M -20 160 C 150 40, 300 220, 450 90 S 700 40, 860 100" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 8" />
          </svg>

          <div className="relative">
            <button onClick={() => navigate("/dashboard/delivery-job")} className="inline-flex items-center gap-2 text-xs font-medium text-blue-100 hover:text-white mb-4 transition-colors cursor-pointer">
              <ArrowLeft size={15} /> Delivery Jobs
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0 mt-1">
                  <Package size={22} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{job?.name || "Route Assignment"}</h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-blue-100">
                    {job?.area && (
                      <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-blue-200" />{job.area}</span>
                    )}
                    {job?.deliveryPartner && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-blue-300/40 hidden sm:block" />
                        <span className="inline-flex items-center gap-1.5"><UserRound size={14} className="text-blue-200" />{job.deliveryPartner.firstName} {job.deliveryPartner.lastName}</span>
                        {job.deliveryPartner.phoneNo && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-blue-300/40 hidden sm:block" />
                            <span className="inline-flex items-center gap-1.5"><Phone size={14} className="text-blue-200" />{job.deliveryPartner.phoneNo}</span>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTER CARD */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-4">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search order number, customer..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50" />
              </div>

              <div className="relative">
                <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="appearance-none w-full lg:w-44 px-4 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none cursor-pointer focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50">
                  <option value="">All Status</option>
                  <option value="PLACED">Placed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="INTRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => setAssociationFilter("all")} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${associationFilter === "all" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"}`}>All</button>
                <button type="button" onClick={() => setAssociationFilter("associated")} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${associationFilter === "associated" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-slate-600 border-slate-200"}`}>Associated <span className="bg-white/50 px-1 rounded-sm">{associatedCount}</span></button>
                <button type="button" onClick={() => setAssociationFilter("non-associated")} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${associationFilter === "non-associated" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-600 border-slate-200"}`}>Available <span className="bg-white/50 px-1 rounded-sm">{nonAssociatedCount}</span></button>
              </div>
            </div>
          </div>
        </div>

        {/* TASK LIST */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Available Tasks</h2>
            </div>
            {filteredOrders.length > 0 && visibleSelectableOrderIds.length <= MAX_ORDERS && (
              <button onClick={toggleSelectAll} className="text-xs font-semibold text-blue-600 hover:text-blue-800">
                {allVisibleSelected ? "Deselect All" : "Select All Visible"}
              </button>
            )}
          </div>

          {!filteredOrders.length ? (
            <div className="py-16 text-center text-slate-500 text-sm">No tasks found.</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order) => {
                const orderId = getOrderId(order);
                const isSelected = selectedOrders.includes(orderId);
                const isOriginallyAssociated = initialAssociatedSet.has(orderId);
                const isAssociated = isOrderAssociated(order, deliveryJobId);
                const isMarkedForRemoval = isOriginallyAssociated && !isSelected;
                const isMarkedForAssociation = !isOriginallyAssociated && isSelected;

                return (
                  <button
                    key={orderId}
                    onClick={() => toggleOrder(order)}
                    className={`w-full text-left px-5 sm:px-6 py-4 transition-all flex items-center gap-4 ${isSelected ? "bg-blue-50/60" : isMarkedForRemoval ? "bg-rose-50/40" : "hover:bg-slate-50/70"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300"}`}
                    >
                      {isSelected && <Check size={13} strokeWidth={3} />}
                    </div>

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${order.type === "SUBSCRIPTION" ? "bg-amber-100 text-amber-600" : isSelected ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}
                    >
                      {order.type === "SUBSCRIPTION" ? (
                        <Repeat size={18} />
                      ) : (
                        <ShoppingBag size={18} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900">
                          {getOrderNumber(order)}
                        </p>

                        {/* NEW: Subscription Visual Badge */}
                        {order.type === "SUBSCRIPTION" && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1">
                            SUBSCRIPTION
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${getStatusStyle(order.orderStatus)}`}
                        >
                          {order.orderStatus?.replaceAll("_", " ")}
                        </span>

                        {isAssociated && isSelected && !isMarkedForRemoval && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 size={10} /> Assigned
                          </span>
                        )}
                        {isMarkedForRemoval && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-semibold flex items-center gap-1">
                            <X size={10} /> Will remove
                          </span>
                        )}
                        {isMarkedForAssociation && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-semibold flex items-center gap-1">
                            <Check size={10} /> Will assign
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <UserRound size={12} /> {getCustomerName(order)}
                        </span>
                        {getOrderAddress(order) && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 truncate max-w-xs">
                            <MapPin size={12} /> {getOrderAddress(order)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount & Quantity */}

                    <div className="text-right shrink-0 flex flex-col items-end">
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-0.5">
                        {order.type === "SUBSCRIPTION" ? "Qty" : "Total / Qty"}
                      </p>

                      {order.type === "ORDER" && (
                        <p className="text-sm font-bold text-slate-800">
                          {getOrderAmount(order)}
                        </p>
                      )}
                      <p className={`
                          ${
                            order.type === "ORDER"
                              ? "text-xs font-semibold text-slate-500"
                              : "text-sm font-bold text-slate-800"
                          }
                        `}
                      >
                        {getOrderQuantity(order)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}
          <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={!hasPreviousPage} onClick={() => setPage(p => p - 1)} className="p-1 border rounded disabled:opacity-40"><ChevronLeft size={16}/></button>
              <button disabled={!hasNextPage} onClick={() => setPage(p => p + 1)} className="p-1 border rounded disabled:opacity-40"><ChevronRight size={16}/></button>
            </div>
          </div>
        </div>

        {/* STICKY CHANGE BAR */}
        {hasAssociationChanges && (
          <div className="sticky bottom-4 z-20 mt-4 bg-slate-900 rounded-2xl shadow-2xl px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-white">
                <p className="text-sm font-semibold">{ordersToAssociate.length} to add · {ordersToRemove.length} to remove</p>
              </div>
            </div>
            <button onClick={handleAssociateOrder} disabled={isAssociating} className="px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold disabled:opacity-60">
              {isAssociating ? "Saving..." : "Save Route Changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignOrderToDeliveryJob;
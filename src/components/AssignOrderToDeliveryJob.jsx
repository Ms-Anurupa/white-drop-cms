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
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import deliveryJobStore from "../zustand/Store/deliveryJobStore";
import orderDataStore from "../zustand/Store/orderDataStore";

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

const getCustomerName = (order) => {
  const name = order?.user?.customer_name;

  return name?.trim() || "Customer";
};

const getOrderAmount = (order) => {
  const amount = order?.orderTotal;

  if (amount === null || amount === undefined) {
    return "—";
  }

  return `₹${Number(amount).toLocaleString("en-IN")}`;
};

const getOrderStatus = (order) => order?.orderStatus;

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

  const associateOrderToDeliveryJob = deliveryJobStore(
    (state) => state.associateOrderToDeliveryJob,
  );

  const getOrderListing = orderDataStore((state) => state.getOrderListing);

  const orders = orderDataStore((state) => state.orders);

  const meta = orderDataStore((state) => state.meta);

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
    getOrderListing({
      status,
      search,
      page,
      pageSize,
      fromDate,
      toDate,
    });
  }, [getOrderListing, search, status, page, pageSize, toDate]);

  useEffect(() => {
    if (!hydratedOrders.length) {
      return;
    }

    const associatedOrderIds = hydratedOrders
      .filter((order) => isOrderAssociated(order, deliveryJobId))
      .map((order) => getOrderId(order))
      .filter(Boolean);

    setInitialAssociatedOrders((prev) => {
      const next = new Set(prev);

      associatedOrderIds.forEach((id) => {
        next.add(id);
      });

      return [...next];
    });

    setSelectedOrders((prev) => {
      const next = new Set(prev);

      associatedOrderIds.forEach((id) => {
        next.add(id);
      });

      return [...next];
    });
  }, [hydratedOrders, deliveryJobId]);

  const filteredOrders = useMemo(() => {
    if (associationFilter === "associated") {
      return hydratedOrders.filter((order) =>
        isOrderAssociated(order, deliveryJobId),
      );
    }

    if (associationFilter === "non-associated") {
      return hydratedOrders.filter(
        (order) => !isOrderAssociated(order, deliveryJobId),
      );
    }

    return hydratedOrders;
  }, [hydratedOrders, associationFilter, deliveryJobId]);

  const associatedCount = useMemo(
    () =>
      hydratedOrders.filter((order) => isOrderAssociated(order, deliveryJobId))
        .length,
    [hydratedOrders, deliveryJobId],
  );

  const nonAssociatedCount = useMemo(
    () =>
      hydratedOrders.filter((order) => !isOrderAssociated(order, deliveryJobId))
        .length,
    [hydratedOrders, deliveryJobId],
  );

  const initialAssociatedSet = useMemo(
    () => new Set(initialAssociatedOrders),
    [initialAssociatedOrders],
  );

  const selectedSet = useMemo(() => new Set(selectedOrders), [selectedOrders]);

  const ordersToAssociate = useMemo(
    () =>
      selectedOrders.filter((orderId) => !initialAssociatedSet.has(orderId)),
    [selectedOrders, initialAssociatedSet],
  );

  const ordersToRemove = useMemo(
    () =>
      initialAssociatedOrders.filter((orderId) => !selectedSet.has(orderId)),
    [initialAssociatedOrders, selectedSet],
  );

  const hasAssociationChanges =
    ordersToAssociate.length > 0 || ordersToRemove.length > 0;

  const toggleOrder = (order) => {
    const orderId = getOrderId(order);

    if (!orderId) return;

    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      }

      return [...prev, orderId];
    });
  };

  const visibleSelectableOrderIds = filteredOrders
    .map((order) => getOrderId(order))
    .filter(Boolean);

  const allVisibleSelected =
    visibleSelectableOrderIds.length > 0 &&
    visibleSelectableOrderIds.every((id) => selectedOrders.includes(id));

  const toggleSelectAll = () => {
    if (!visibleSelectableOrderIds.length) {
      toast.info("There are no orders to select");
      return;
    }

    if (allVisibleSelected) {
      setSelectedOrders((prev) =>
        prev.filter((id) => !visibleSelectableOrderIds.includes(id)),
      );

      return;
    }

    setSelectedOrders((prev) => [
      ...new Set([...prev, ...visibleSelectableOrderIds]),
    ]);
  };

  const clearSelection = () => {
    setSelectedOrders([...initialAssociatedOrders]);
  };

  const handleAssociateOrder = async () => {
    if (!deliveryJobId) {
      toast.error("Delivery job ID is missing");
      return;
    }

    if (!hasAssociationChanges) {
      toast.info("No association changes to save");
      return;
    }

    try {
      setIsAssociating(true);

      if (ordersToAssociate.length > 0) {
        await associateOrderToDeliveryJob({
          deliveryJobId,
          orderIds: ordersToAssociate,
        });
      }

      if (ordersToRemove.length > 0) {
        await associateOrderToDeliveryJob({
          deliveryJobId,
          orderIds: ordersToRemove,
        });
      }

      setInitialAssociatedOrders((prev) => {
        const next = new Set(prev);

        ordersToAssociate.forEach((id) => {
          next.add(id);
        });

        ordersToRemove.forEach((id) => {
          next.delete(id);
        });

        return [...next];
      });

      setSelectedOrders((prev) => {
        const next = new Set(prev);

        ordersToAssociate.forEach((id) => {
          next.add(id);
        });

        ordersToRemove.forEach((id) => {
          next.delete(id);
        });

        return [...next];
      });

      await getOrderListing({
        status,
        search,
        page,
        pageSize,
        fromDate,
        toDate,
      });

      if (ordersToAssociate.length > 0 && ordersToRemove.length > 0) {
        toast.success(
          `${ordersToAssociate.length} order${
            ordersToAssociate.length === 1 ? "" : "s"
          } added and ${ordersToRemove.length} order${
            ordersToRemove.length === 1 ? "" : "s"
          } removed`,
        );
      } else if (ordersToAssociate.length > 0) {
        toast.success(
          `${ordersToAssociate.length} order${
            ordersToAssociate.length === 1 ? "" : "s"
          } added to delivery job`,
        );
      } else {
        toast.success(
          `${ordersToRemove.length} order${
            ordersToRemove.length === 1 ? "" : "s"
          } removed from delivery job`,
        );
      }
    } catch (error) {
      console.error("Failed to update delivery job orders:", error);

      toast.error("Failed to update delivery job orders");
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

  const hasFilters =
    Boolean(search) ||
    Boolean(status) ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    associationFilter !== "all";

  const totalPages = meta?.totalPages ?? 1;

  const hasNextPage = page < totalPages;

  const hasPreviousPage = page > 1;

  return (
    <div className="w-full min-h-full bg-slate-50 p-4 sm:p-5">
      <div className="max-w-7xl mx-auto">
        {/* =====================================================
            TOP HEADER
        ====================================================== */}

        <div className="relative overflow-hidden rounded-2xl bg-[#3B5CCC] px-5 sm:px-7 py-5 mb-4">
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none"
            preserveAspectRatio="none"
            viewBox="0 0 800 200"
            aria-hidden="true"
          >
            <path
              d="M -20 160 C 150 40, 300 220, 450 90 S 700 40, 860 100"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="6 8"
            />
          </svg>

          <div className="relative">
            <button
              type="button"
              onClick={() => navigate("/dashboard/delivery-job")}
              className="inline-flex items-center gap-2 text-xs font-medium text-blue-100 hover:text-white mb-4 cursor-pointer transition-colors"
            >
              <ArrowLeft size={15} />
              Delivery Jobs
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shrink-0">
                  <Package size={22} />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      Add Orders
                    </h1>

                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-semibold text-blue-100">
                      <ShoppingBag size={11} />
                      Order Assignment
                    </span>
                  </div>

                  <p className="text-sm text-blue-100 mt-1">
                    Select orders to include in this delivery job
                  </p>
                </div>
              </div>

              {hasAssociationChanges && (
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-xl bg-white/10 border border-white/15">
                    <p className="text-[10px] uppercase tracking-wide text-blue-100">
                      Changes
                    </p>

                    <p className="text-sm font-bold text-white">
                      {ordersToAssociate.length > 0 && ordersToRemove.length > 0
                        ? `${ordersToAssociate.length} Add · ${ordersToRemove.length} Remove`
                        : ordersToAssociate.length > 0
                          ? `${ordersToAssociate.length} Add`
                          : `${ordersToRemove.length} Remove`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =====================================================
            FILTER / SEARCH CARD
        ====================================================== */}

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm mb-4">
          <div className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              {/* Search */}

              <div className="relative flex-1">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                    setSelectedOrders([...initialAssociatedOrders]);
                  }}
                  placeholder="Search order number, customer..."
                  className="
                    w-full
                    pl-10 pr-4 py-2.5
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    text-sm text-slate-800
                    placeholder:text-slate-400
                    outline-none
                    transition-all
                    focus:bg-white
                    focus:border-blue-400
                    focus:ring-4
                    focus:ring-blue-50
                  "
                />
              </div>

              {/* Status */}

              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                    setSelectedOrders([...initialAssociatedOrders]);
                  }}
                  className="
                    appearance-none
                    w-full lg:w-44
                    px-4 pr-9 py-2.5
                    rounded-xl
                    border border-slate-200
                    bg-slate-50
                    text-sm text-slate-700
                    outline-none
                    cursor-pointer
                    focus:bg-white
                    focus:border-blue-400
                    focus:ring-4
                    focus:ring-blue-50
                  "
                >
                  <option value="">All Status</option>
                  <option value="PLACED">Placed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="INTRANSIT">In Transit</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                  <option value="FAILED">Failed</option>
                </select>

                <ChevronRight
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none"
                />
              </div>

              {/* Filter */}

              <button
                type="button"
                onClick={() => setShowFilters((prev) => !prev)}
                className={`
                  inline-flex items-center justify-center gap-2
                  px-4 py-2.5
                  rounded-xl
                  border
                  text-sm font-semibold
                  cursor-pointer
                  transition-all
                  ${
                    showFilters || fromDate || toDate
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }
                `}
              >
                <Filter size={15} />
                Filters
              </button>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>

            {/* Date filters */}

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* From Date */}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    From Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => {
                        setFromDate(e.target.value);
                        setPage(1);
                        setSelectedOrders([...initialAssociatedOrders]);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* To Date */}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    To Date
                  </label>

                  <div className="relative">
                    <CalendarDays
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => {
                        setToDate(e.target.value);
                        setPage(1);
                        setSelectedOrders([...initialAssociatedOrders]);
                      }}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:bg-white focus:border-blue-400"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            ORDERS
        ====================================================== */}

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          {/* List Header */}

          <div className="px-5 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-slate-900">
                      Available Orders
                    </h2>

                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                      {filteredOrders.length}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose the orders you want to add or remove from this
                    delivery job
                  </p>
                </div>

                {filteredOrders.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    disabled={!visibleSelectableOrderIds.length}
                    className="
                      inline-flex items-center gap-2
                      text-xs font-semibold
                      text-blue-600 hover:text-blue-700
                      disabled:text-slate-400
                      disabled:cursor-not-allowed
                      cursor-pointer
                    "
                  >
                    <span
                      className={`
                        w-4 h-4 rounded border flex items-center justify-center
                        ${
                          allVisibleSelected
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }
                      `}
                    >
                      {allVisibleSelected && (
                        <Check size={11} strokeWidth={3} />
                      )}
                    </span>

                    {allVisibleSelected ? "Deselect All" : "Select All"}
                  </button>
                )}
              </div>

              {/* Association Filter */}

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1">
                  Show
                </span>

                {/* All */}

                <button
                  type="button"
                  onClick={() => {
                    setAssociationFilter("all");
                    setSelectedOrders([...initialAssociatedOrders]);
                  }}
                  className={`
                    inline-flex items-center gap-2
                    px-3 py-1.5
                    rounded-lg
                    border
                    text-xs font-semibold
                    transition-all
                    cursor-pointer
                    ${
                      associationFilter === "all"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }
                  `}
                >
                  All
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-full text-[10px]
                      ${
                        associationFilter === "all"
                          ? "bg-white/15 text-white"
                          : "bg-slate-100 text-slate-500"
                      }
                    `}
                  >
                    {hydratedOrders.length}
                  </span>
                </button>

                {/* Associated */}

                <button
                  type="button"
                  onClick={() => {
                    setAssociationFilter("associated");
                    setSelectedOrders([...initialAssociatedOrders]);
                  }}
                  className={`
                    inline-flex items-center gap-2
                    px-3 py-1.5
                    rounded-lg
                    border
                    text-xs font-semibold
                    transition-all
                    cursor-pointer
                    ${
                      associationFilter === "associated"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }
                  `}
                >
                  <CheckCircle2 size={13} />
                  Associated
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-full text-[10px]
                      ${
                        associationFilter === "associated"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }
                    `}
                  >
                    {associatedCount}
                  </span>
                </button>

                {/* Non-associated */}

                <button
                  type="button"
                  onClick={() => {
                    setAssociationFilter("non-associated");
                    setSelectedOrders([...initialAssociatedOrders]);
                  }}
                  className={`
                    inline-flex items-center gap-2
                    px-3 py-1.5
                    rounded-lg
                    border
                    text-xs font-semibold
                    transition-all
                    cursor-pointer
                    ${
                      associationFilter === "non-associated"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }
                  `}
                >
                  <Package size={13} />
                  Non-associated
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-full text-[10px]
                      ${
                        associationFilter === "non-associated"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-500"
                      }
                    `}
                  >
                    {nonAssociatedCount}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* EMPTY */}

          {!filteredOrders.length ? (
            <div className="py-16 px-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mb-4">
                <Package size={25} />
              </div>

              <h3 className="text-sm font-semibold text-slate-900">
                {associationFilter === "associated"
                  ? "No associated orders"
                  : associationFilter === "non-associated"
                    ? "No non-associated orders"
                    : "No orders found"}
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                {associationFilter === "associated"
                  ? "There are no orders already associated with a delivery job."
                  : associationFilter === "non-associated"
                    ? "All available orders are already associated."
                    : "Try changing your search or filter criteria."}
              </p>
            </div>
          ) : (
            <>
              {/* ORDER LIST */}

              <div className="divide-y divide-slate-100">
                {filteredOrders.map((order) => {
                  const orderId = getOrderId(order);

                  const isSelected = selectedOrders.includes(orderId);

                  /*
                   * Original backend state.
                   */
                  const isOriginallyAssociated =
                    initialAssociatedSet.has(orderId);

                  /*
                   * Current backend association.
                   */
                  const isAssociated = isOrderAssociated(order, deliveryJobId);

                  /*
                   * Existing associated order
                   * that user unchecked.
                   */
                  const isMarkedForRemoval =
                    isOriginallyAssociated && !isSelected;

                  /*
                   * New order user selected.
                   */
                  const isMarkedForAssociation =
                    !isOriginallyAssociated && isSelected;

                  const orderStatus = getOrderStatus(order);

                  return (
                    <button
                      key={orderId}
                      type="button"
                      onClick={() => toggleOrder(order)}
                      className={`
                        relative
                        w-full
                        text-left
                        px-5 sm:px-6
                        py-4
                        cursor-pointer
                        transition-all
                        ${
                          isSelected
                            ? "bg-blue-50/60"
                            : isMarkedForRemoval
                              ? "bg-rose-50/40"
                              : "hover:bg-slate-50/70"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        {/* Checkbox */}

                        <div
                          className={`
                            w-5 h-5 rounded-md border
                            flex items-center justify-center
                            shrink-0
                            transition-all
                            ${
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "bg-white border-slate-300"
                            }
                          `}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </div>

                        {/* Order Icon */}

                        <div
                          className={`
                            w-10 h-10 rounded-xl
                            flex items-center justify-center
                            shrink-0
                            ${
                              isSelected
                                ? "bg-blue-100 text-blue-600"
                                : "bg-slate-100 text-slate-500"
                            }
                          `}
                        >
                          <ShoppingBag size={18} />
                        </div>

                        {/* Main */}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-slate-900">
                              {getOrderNumber(order)}
                            </p>

                            {/* Status */}

                            <span
                              className={`
                                px-2 py-0.5
                                rounded-full
                                border
                                text-[10px]
                                font-semibold
                                ${getStatusStyle(orderStatus)}
                              `}
                            >
                              {orderStatus?.replaceAll("_", " ")}
                            </span>

                            {/* =================================
                                EXISTING ASSOCIATED
                            ================================= */}

                            {isAssociated &&
                              isSelected &&
                              !isMarkedForRemoval && (
                                <span
                                  className="
                                    inline-flex items-center gap-1
                                    px-2 py-0.5
                                    rounded-full
                                    border border-emerald-100
                                    bg-emerald-50
                                    text-emerald-700
                                    text-[10px]
                                    font-semibold
                                  "
                                >
                                  <CheckCircle2 size={10} />
                                  Assigned to this job
                                </span>
                              )}

                            {/* =================================
                                WILL BE REMOVED
                            ================================= */}

                            {isMarkedForRemoval && (
                              <span
                                className="
                                  inline-flex items-center gap-1
                                  px-2 py-0.5
                                  rounded-full
                                  border border-rose-100
                                  bg-rose-50
                                  text-rose-700
                                  text-[10px]
                                  font-semibold
                                "
                              >
                                <X size={10} />
                                Will be removed
                              </span>
                            )}

                            {/* =================================
                                WILL BE ASSIGNED
                            ================================= */}

                            {isMarkedForAssociation && (
                              <span
                                className="
                                  inline-flex items-center gap-1
                                  px-2 py-0.5
                                  rounded-full
                                  border border-blue-100
                                  bg-blue-50
                                  text-blue-700
                                  text-[10px]
                                  font-semibold
                                "
                              >
                                <Check size={10} />
                                Will be assigned
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                            {/* Customer */}

                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                              <UserRound size={12} />
                              {getCustomerName(order)}
                            </span>

                            {/* Date */}

                            {order?.createdAt && (
                              <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                                <CalendarDays size={12} />
                                {formatDate(order.createdAt)}
                              </span>
                            )}

                            {/* Address */}

                            {getOrderAddress(order) && (
                              <span
                                className="inline-flex items-center gap-1.5 text-xs text-slate-400 max-w-[420px]"
                                title={getOrderAddress(order)}
                              >
                                <MapPin size={12} className="shrink-0" />

                                <span className="truncate">
                                  {getOrderAddress(order)}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Amount */}

                        <div className="text-right shrink-0">
                          <p className="text-[10px] uppercase tracking-wide text-slate-400">
                            Total
                          </p>

                          <p className="text-sm font-bold text-slate-800 mt-0.5">
                            {getOrderAmount(order)}
                          </p>
                        </div>

                        {/* Selected indicator */}

                        {isSelected && (
                          <CheckCircle2
                            size={19}
                            className="text-blue-600 shrink-0"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* PAGINATION */}

              <div className="px-5 sm:px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rows per page</span>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                      setSelectedOrders([...initialAssociatedOrders]);
                    }}
                    className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white outline-none cursor-pointer"
                  >
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={24}>24</option>
                    <option value={32}>32</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!hasPreviousPage}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft size={15} />
                  </button>

                  <span className="text-xs font-semibold text-slate-600 px-2">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* =====================================================
            STICKY CHANGE BAR
        ====================================================== */}

        {hasAssociationChanges && (
          <div className="sticky bottom-4 z-20 mt-4">
            <div className="bg-slate-900 rounded-2xl shadow-2xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-300 flex items-center justify-center">
                  <Package size={17} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    {ordersToAssociate.length > 0 && ordersToRemove.length > 0
                      ? `${ordersToAssociate.length} to add · ${ordersToRemove.length} to remove`
                      : ordersToAssociate.length > 0
                        ? `${ordersToAssociate.length} ${
                            ordersToAssociate.length === 1 ? "order" : "orders"
                          } to add`
                        : `${ordersToRemove.length} ${
                            ordersToRemove.length === 1 ? "order" : "orders"
                          } to remove`}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    {ordersToAssociate.length > 0 && ordersToRemove.length > 0
                      ? "Changes ready to save"
                      : ordersToAssociate.length > 0
                        ? "Ready to assign to this delivery job"
                        : "Ready to remove from this delivery job"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="ml-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <button
                type="button"
                onClick={handleAssociateOrder}
                disabled={isAssociating || !hasAssociationChanges}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  bg-white
                  hover:bg-blue-50
                  text-slate-900
                  text-sm
                  font-semibold
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  transition-all
                  cursor-pointer
                "
              >
                {isAssociating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
                    Updating Orders...
                  </>
                ) : (
                  <>
                    <Check size={16} strokeWidth={2.5} />

                    {ordersToAssociate.length > 0 && ordersToRemove.length > 0
                      ? "Save Changes"
                      : ordersToAssociate.length > 0
                        ? `Associate ${ordersToAssociate.length} ${
                            ordersToAssociate.length === 1 ? "Order" : "Orders"
                          }`
                        : `Remove ${ordersToRemove.length} ${
                            ordersToRemove.length === 1 ? "Order" : "Orders"
                          }`}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignOrderToDeliveryJob;

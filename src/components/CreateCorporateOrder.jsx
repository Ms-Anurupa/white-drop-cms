/* eslint-disable no-unused-vars */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  Package,
  IndianRupee,
  StickyNote,
  ShoppingCart,
  AlertTriangle,
  Building2,
  Boxes,
  Plus,
  Trash2,
  ClipboardList,
  Truck,
  PackageCheck,
  Calculator,
  Minus,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import corporateDataStore from "../zustand/Store/corporateDataStore";
import { toast } from "react-toastify";
import { useConfirm } from "./ConfirmProvider";

const units = ["L", "ML", "KG", "G"];

const createEmptyItem = (unit = "L") => ({
  unit,
  qty: "",
  pricePerUnit: "",
  orderDate: new Date().toISOString().split("T")[0],
});

const CreateCorporateOrder = () => {
  const navigate = useNavigate();
  const { confirm } = useConfirm();
  const [loading, setLoading] = useState(false);

  const createCorporateOrderAdmin = corporateDataStore(
    (state) => state.createCorporateOrderAdmin,
  );

  const getCorporateAccounts = corporateDataStore(
    (state) => state.getCorporateAccounts,
  );

  const corporateOrderAcc = corporateDataStore(
    (state) => state.corporateOrderAcc,
  );

  const [corporateData, setCorporateData] = useState({
    corpoAccId: "",
    productName: "",
    notes: "",
    deliveryStatus: "PROCESSING",
    paymentStatus: "PENDING",
  });

  const [items, setItems] = useState([createEmptyItem("L")]);

  const [receivedData, setReceivedData] = useState({
    quantity: "",
    unit: "L",
    totalPrice: "",
  });

  const [discountReason, setDiscountReason] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const limit = 10;

  useEffect(() => {
    getCorporateAccounts({
      search,
      status,
      page,
      limit,
    });
  }, [getCorporateAccounts, search, status, page]);

  const handleCorporateChange = (e) => {
    const { name, value } = e.target;

    setCorporateData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // If delivery is changed back to PROCESSING, payment must be PENDING
      if (name === "deliveryStatus" && value === "PROCESSING") {
        newData.paymentStatus = "PENDING";
      }
      
      return newData;
    });
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;

    setItems((prev) => {
      if (index === 0 && name === "unit") {
        return prev.map((item) => ({
          ...item,
          unit: value,
        }));
      }

      return prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [name]: value,
            }
          : item,
      );
    });
  };

  const addItem = () => {
    const firstUnit = items[0]?.unit || "L";
    setItems((prev) => [...prev, createEmptyItem(firstUnit)]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      toast.info("At least one order item is required.");
      return;
    }
    setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  // Conditions for enabling fields
  const canEnterReceivedQty = corporateData.deliveryStatus === "DELIVERED";
  const canEnterReceivedPrice = 
    corporateData.deliveryStatus === "DELIVERED" && 
    corporateData.paymentStatus === "COMPLETE";

  const handleReceivedChange = (e) => {
    const { name, value } = e.target;
    
    // Safety guard
    if ((name === "quantity" || name === "unit") && !canEnterReceivedQty) return;
    if (name === "totalPrice" && !canEnterReceivedPrice) return;

    setReceivedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const totalSentQuantity = useMemo(() => {
    return items.reduce((total, item) => total + (Number(item.qty) || 0), 0);
  }, [items]);

  const totalSentPrice = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total + (Number(item.qty) || 0) * (Number(item.pricePerUnit) || 0),
      0,
    );
  }, [items]);

  const calculatedReceivedQuantity = canEnterReceivedQty
    ? Number(receivedData.quantity) || 0
    : 0;

  const calculatedReceivedUnit = canEnterReceivedQty
    ? receivedData.unit
    : items[0]?.unit || "L";

  const calculatedReceivedTotalPrice = canEnterReceivedPrice
    ? Number(receivedData.totalPrice) || 0
    : 0;

  const calculatedReceivedPricePerUnit =
    calculatedReceivedQuantity > 0 && calculatedReceivedTotalPrice > 0
      ? calculatedReceivedTotalPrice / calculatedReceivedQuantity
      : 0;

  const discount = canEnterReceivedPrice 
    ? Math.max(totalSentPrice - calculatedReceivedTotalPrice, 0)
    : 0;

  // GRAND TOTAL LOGIC UPDATE
  // If payment isn't complete, display the expected full sent price.
  const grandTotal = canEnterReceivedPrice
    ? calculatedReceivedTotalPrice
    : totalSentPrice;

  const validateItems = () => {
    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (!item.unit) {
        toast.error(`Unit is required for item ${index + 1}.`);
        return false;
      }
      if (!item.qty || Number(item.qty) <= 0) {
        toast.error(`Quantity must be greater than 0 for item ${index + 1}.`);
        return false;
      }
      if (!item.pricePerUnit || Number(item.pricePerUnit) <= 0) {
        toast.error(
          `Price per unit must be greater than 0 for item ${index + 1}.`,
        );
        return false;
      }
      if (!item.orderDate) {
        toast.error(`Order date is required for item ${index + 1}.`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!corporateData.corpoAccId) {
      toast.error("Please select a corporate account.");
      return;
    }

    if (!corporateData.productName.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!validateItems()) {
      return;
    }

    if (canEnterReceivedQty) {
      if (!receivedData.quantity || Number(receivedData.quantity) <= 0) {
        toast.error("Received quantity must be greater than 0.");
        return;
      }
      if (!receivedData.unit) {
        toast.error("Please select received unit.");
        return;
      }
    }

    if (canEnterReceivedPrice) {
      if (
        receivedData.totalPrice === "" ||
        Number(receivedData.totalPrice) < 0
      ) {
        toast.error("Received total is required.");
        return;
      }
    }

    if (canEnterReceivedPrice && discount > 0 && !discountReason.trim()) {
      toast.error("Discount reason is required.");
      return;
    }

    setLoading(true);

    try {
      const confirmMessage = await confirm({
        title: "Create Corporate Order",
        message: "Are you sure you want to create the order?",
      });

      if (!confirmMessage) {
        setLoading(false);
        return;
      }

      const payload = {
        corpoAccId: corporateData.corpoAccId,
        deliveryStatus: corporateData.deliveryStatus,
        paymentStatus: corporateData.paymentStatus,
        orderDetails: {
          productName: corporateData.productName.trim(),
          deliveryNote: corporateData.notes.trim(),
          sentTotalPrice: totalSentPrice,
          receivedQuantity: calculatedReceivedQuantity,
          receivedUnit: calculatedReceivedUnit,
          receivedTotalPrice: calculatedReceivedTotalPrice,
          receivedPricePerUnit: calculatedReceivedPricePerUnit,
          grandTotal: grandTotal,
          discountValue: discount,
          discountReason: discount > 0 ? discountReason.trim() : "",
          items: items.map((item) => ({
            qty: Number(item.qty),
            unit: item.unit,
            itemTotalPrice: Number(item.qty) * Number(item.pricePerUnit),
            orderDate: new Date(item.orderDate).toISOString(),
            pricePerUnit: Number(item.pricePerUnit),
          })),
        },
      };

      await createCorporateOrderAdmin(payload);
      toast.success("Corporate order created successfully.");
      navigate(-1);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create corporate order.");
    } finally {
      setLoading(false);
    }
  };

  const selectedAccount = corporateOrderAcc?.find(
    (acc) => acc.id === corporateData.corpoAccId,
  );

  return (
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="group mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to Corporate Orders
        </button>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-gray-100 px-5 py-5 sm:px-7 dark:border-slate-800">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/60">
                  <ShoppingCart size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                    Create Corporate Order
                  </h1>
                  <p className="mt-0.5 text-sm text-gray-500 dark:text-slate-400">
                    Create and manage corporate purchase items
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950/60">
              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-amber-500 dark:text-amber-400"
              />
              <div>
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Verify order information
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
                  Verify quantity, pricing, delivery status, payment status and
                  received information before creating the corporate order.
                </p>
              </div>
            </div>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <Building2 size={17} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                  Corporate Account
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                    Corporate Account <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                    />
                    <select
                      name="corpoAccId"
                      value={corporateData.corpoAccId}
                      onChange={handleCorporateChange}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
                    >
                      <option value="">Select Corporate Account</option>
                      {corporateOrderAcc?.filter((account) => account.status === "APPROVED").map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.businessName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    readOnly
                    value={selectedAccount?.address || ""}
                    placeholder="Select a corporate account to see the address"
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none bg-gray-50 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Package
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                    />
                    <input
                      required
                      name="productName"
                      value={corporateData.productName}
                      onChange={handleCorporateChange}
                      placeholder="Enter product name"
                      className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                    Delivery Notes
                  </label>
                  <div className="relative">
                    <StickyNote
                      size={16}
                      className="absolute left-3 top-3.5 text-gray-400 dark:text-slate-500"
                    />
                    <textarea
                      rows={3}
                      name="notes"
                      value={corporateData.notes}
                      onChange={handleCorporateChange}
                      placeholder="Example: Please ensure delivery is completed before 7:00 AM at the rear entrance."
                      className="w-full resize-none rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                    Delivery Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {corporateData.deliveryStatus === "DELIVERED" ? (
                      <CheckCircle2
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                      />
                    ) : (
                      <Clock3
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"
                      />
                    )}
                    <select
                      name="deliveryStatus"
                      value={corporateData.deliveryStatus}
                      onChange={handleCorporateChange}
                      className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
                    >
                      <option value="PROCESSING">Processing</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                    Payment Status <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    {corporateData.paymentStatus === "COMPLETE" ? (
                      <PackageCheck
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                      />
                    ) : (
                      <Clock3
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-500"
                      />
                    )}
                    <select
                      name="paymentStatus"
                      value={corporateData.paymentStatus}
                      onChange={handleCorporateChange}
                      disabled={corporateData.deliveryStatus === "PROCESSING"}
                      className={`w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:focus:border-blue-500 ${
                        corporateData.deliveryStatus === "PROCESSING"
                          ? "cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-slate-800/50 dark:text-slate-400"
                          : "cursor-pointer bg-white dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <option value="PENDING">Pending</option>
                      <option
                        value="COMPLETE"
                        disabled={corporateData.deliveryStatus === "PROCESSING"}
                      >
                        Complete
                      </option>
                    </select>
                  </div>
                  {corporateData.deliveryStatus === "PROCESSING" && (
                    <p className="mt-1 text-[10px] text-gray-400 dark:text-slate-500">
                      Must be delivered to complete payment
                    </p>
                  )}
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={17} className="text-blue-600 dark:text-blue-400" />
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Order Items <span className="text-red-500">*</span>
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      The first item's unit controls all order items
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800">
                <div className="hidden min-w-[900px] grid-cols-[120px_140px_160px_160px_160px_50px] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 md:grid dark:border-slate-800 dark:bg-slate-800/70">
                  <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">
                    Order Date
                  </span>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">
                    Unit
                  </span>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">
                    Quantity
                  </span>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">
                    Price / Unit
                  </span>
                  <span className="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">
                    Order Total
                  </span>
                  <span />
                </div>

                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                  {items.map((item, index) => {
                    const itemTotal =
                      (Number(item.qty) || 0) *
                      (Number(item.pricePerUnit) || 0);

                    return (
                      <div
                        key={index}
                        className="grid min-w-[900px] gap-3 bg-white p-4 md:grid-cols-[120px_140px_160px_160px_160px_50px] md:items-center dark:bg-slate-900"
                      >
                        <input
                          type="date"
                          name="orderDate"
                          value={item.orderDate}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-500"
                        />
                        <div className="relative">
                          <select
                            name="unit"
                            value={item.unit}
                            disabled={index !== 0}
                            onChange={(e) => handleItemChange(index, e)}
                            className={`w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm outline-none focus:border-blue-300 dark:border-slate-700 dark:focus:border-blue-500 ${
                              index !== 0
                                ? "cursor-not-allowed bg-gray-100 text-gray-500 dark:bg-slate-800/50 dark:text-slate-400"
                                : "cursor-pointer bg-white dark:bg-slate-800 dark:text-slate-100"
                            }`}
                          >
                            {units.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                          {index !== 0 && (
                            <p className="mt-1 text-[10px] text-gray-400 dark:text-slate-500">
                              Same as first item
                            </p>
                          )}
                        </div>

                        <div className="relative">
                          <Boxes
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name="qty"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="Qty"
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                          />
                        </div>

                        <div className="relative">
                          <IndianRupee
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                          />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name="pricePerUnit"
                            value={item.pricePerUnit}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="Price"
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 dark:border-blue-800 dark:bg-blue-950/60">
                          <IndianRupee size={14} className="text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                            {itemTotal.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-500 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-200 bg-gray-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/60">
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-400 dark:hover:bg-blue-950/60"
                  >
                    <Plus size={16} />
                    Add Another Item
                  </button>
                </div>
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-2">
                <Calculator size={17} className="text-blue-600 dark:text-blue-400" />
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    Order Summary
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Compare sent order with the quantity actually received
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/40 dark:border-blue-900/60 dark:bg-blue-950/30">
                  <div className="flex items-center justify-between border-b border-blue-100 px-4 py-3 dark:border-blue-900/60">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-blue-600 dark:text-blue-400" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                        Total Sent Order
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                      SENT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div className="rounded-xl border border-blue-100 bg-white p-3 dark:border-blue-900/50 dark:bg-slate-900">
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">Quantity</p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-slate-100">
                        {totalSentQuantity.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-white p-3 dark:border-blue-900/50 dark:bg-slate-900">
                      <p className="text-[11px] text-gray-500 dark:text-slate-400">Unit</p>
                      <p className="mt-1 text-lg font-bold text-gray-900 dark:text-slate-100">
                        {items[0]?.unit || "L"}
                      </p>
                    </div>

                    <div className="col-span-2 rounded-xl border border-blue-100 bg-white p-3 dark:border-blue-900/50 dark:bg-slate-900">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-slate-400">
                          Total Sent Price
                        </span>
                        <span className="flex items-center gap-1 text-base font-bold text-blue-700 dark:text-blue-300">
                          <IndianRupee size={15} />
                          {totalSentPrice.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3 dark:border-emerald-900/60">
                    <div className="flex items-center gap-2">
                      <PackageCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                          Total Received Order
                        </p>
                        <p className="text-[11px] text-gray-500 dark:text-slate-400">
                          {!canEnterReceivedQty
                            ? "Awaiting delivery status to enter quantity"
                            : "Admin enters actual received values"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        corporateData.deliveryStatus === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300"
                          : "bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300"
                      }`}
                    >
                      {corporateData.deliveryStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600 dark:text-slate-300">
                        Received Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="quantity"
                        value={
                          !canEnterReceivedQty
                            ? 0
                            : receivedData.quantity
                        }
                        onChange={handleReceivedChange}
                        disabled={!canEnterReceivedQty}
                        placeholder={!canEnterReceivedQty ? "0" : "17.14"}
                        className={`w-full rounded-xl border border-emerald-100 px-3 py-2.5 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/60 dark:focus:border-emerald-500 ${
                          !canEnterReceivedQty
                            ? "cursor-not-allowed bg-gray-100 text-gray-600 dark:bg-slate-800/60 dark:text-slate-400"
                            : "bg-white dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600 dark:text-slate-300">
                        Unit
                      </label>
                      <select
                        name="unit"
                        value={
                          !canEnterReceivedQty
                            ? calculatedReceivedUnit
                            : receivedData.unit
                        }
                        onChange={handleReceivedChange}
                        disabled={!canEnterReceivedQty}
                        className={`w-full rounded-xl border border-emerald-100 px-3 py-2.5 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/60 dark:focus:border-emerald-500 ${
                          !canEnterReceivedQty
                            ? "cursor-not-allowed bg-gray-100 text-gray-600 dark:bg-slate-800/60 dark:text-slate-400"
                            : "cursor-pointer bg-white dark:bg-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600 dark:text-slate-300">
                        Price / Unit
                        <span className="ml-1 text-emerald-600 dark:text-emerald-400">(Auto)</span>
                      </label>
                      <div className="flex items-center rounded-xl border border-emerald-100 bg-gray-100 px-3 py-2.5 dark:border-emerald-900/60 dark:bg-slate-800/60">
                        <IndianRupee size={14} className="mr-1 text-gray-400 dark:text-slate-500" />
                        <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                          {calculatedReceivedPricePerUnit.toLocaleString(
                            "en-IN",
                            { maximumFractionDigits: 2 }
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600 dark:text-slate-300">
                        Received Total
                      </label>
                      <div className="relative">
                        <IndianRupee
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                        />
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="totalPrice"
                          value={
                            !canEnterReceivedPrice
                              ? 0
                              : receivedData.totalPrice
                          }
                          onChange={handleReceivedChange}
                          disabled={!canEnterReceivedPrice}
                          placeholder={!canEnterReceivedPrice ? "0" : "1200"}
                          className={`w-full rounded-xl border border-emerald-100 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-900/60 dark:focus:border-emerald-500 ${
                            !canEnterReceivedPrice
                              ? "cursor-not-allowed bg-gray-100 text-gray-600 dark:bg-slate-800/60 dark:text-slate-400"
                              : "bg-white dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Conditionally render adjustments only if payment has been received */}
            {canEnterReceivedPrice && (
              <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="mb-3 flex items-center gap-2">
                  <Minus size={16} className="text-orange-500" />
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                      Discount / Adjustment
                    </h2>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      Automatically calculated from sent total and received total
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      Discount / Adjustment
                      <span className="ml-1 text-orange-500">(Auto)</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800/70">
                      <IndianRupee size={15} className="mr-1 text-gray-400 dark:text-slate-500" />
                      <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                        {discount.toLocaleString("en-IN", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-slate-300">
                      Adjustment Reason
                      {discount > 0 && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={discountReason}
                      onChange={(e) => setDiscountReason(e.target.value)}
                      placeholder="Less quantity received"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-orange-500"
                    />
                  </div>
                </div>
              </section>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800">
              <div className="bg-gray-900 px-5 py-4 dark:border-b dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400 dark:text-slate-400">
                      Final Amount
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-white">
                      Corporate Order Grand Total
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-2xl font-bold text-white">
                    <IndianRupee size={21} />
                    {grandTotal.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                <div className="p-4">
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Sent Total</p>
                  <p className="mt-1 text-sm font-semibold dark:text-slate-100">
                    ₹
                    {totalSentPrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Received Total</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹
                    {calculatedReceivedTotalPrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="p-4">
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Adjustment</p>
                  <p className="mt-1 text-sm font-semibold text-orange-600 dark:text-orange-400">
                    - ₹
                    {discount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end dark:border-slate-800">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Creating..." : "Create Corporate Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCorporateOrder;
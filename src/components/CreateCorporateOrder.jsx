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

    setCorporateData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const handleReceivedChange = (e) => {
    if (corporateData.deliveryStatus === "PROCESSING") {
      return;
    }

    const { name, value } = e.target;

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

  const isDeliveryPending = corporateData.deliveryStatus === "PROCESSING";

  const calculatedReceivedQuantity = isDeliveryPending
    ? totalSentQuantity
    : Number(receivedData.quantity) || 0;

  const calculatedReceivedUnit = isDeliveryPending
    ? items[0]?.unit || "L"
    : receivedData.unit;

  const calculatedReceivedTotalPrice = isDeliveryPending
    ? totalSentPrice
    : Number(receivedData.totalPrice) || 0;

  const calculatedReceivedPricePerUnit =
    calculatedReceivedQuantity > 0
      ? calculatedReceivedTotalPrice / calculatedReceivedQuantity
      : 0;

  const discount = Math.max(totalSentPrice - calculatedReceivedTotalPrice, 0);

  const grandTotal = calculatedReceivedTotalPrice;

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

    if (!isDeliveryPending) {
      if (!receivedData.quantity || Number(receivedData.quantity) <= 0) {
        toast.error("Received quantity must be greater than 0.");
        return;
      }

      if (!receivedData.unit) {
        toast.error("Please select received unit.");
        return;
      }

      if (
        receivedData.totalPrice === "" ||
        Number(receivedData.totalPrice) < 0
      ) {
        toast.error("Received total is required.");
        return;
      }
    }

    if (discount > 0 && !discountReason.trim()) {
      toast.error("Discount reason is required.");
      return;
    }

    setLoading(true);

    try {
      const confirmMessage = await confirm({
        title: "Create Corporate Order",
        message: "Are you want to create the order?",
      });

      if (!confirmMessage) return;

      const finalReceivedQuantity = calculatedReceivedQuantity;

      const finalReceivedUnit = calculatedReceivedUnit;

      const finalReceivedTotal = calculatedReceivedTotalPrice;

      const finalReceivedPricePerUnit =
        calculatedReceivedQuantity > 0
          ? calculatedReceivedTotalPrice / calculatedReceivedQuantity
          : 0;

      const finalDiscount = Math.max(totalSentPrice - finalReceivedTotal, 0);

      const finalGrandTotal = finalReceivedTotal;

      const payload = {
        corpoAccId: corporateData.corpoAccId,

        deliveryStatus: corporateData.deliveryStatus,

        paymentStatus: corporateData.paymentStatus,

        orderDetails: {
          productName: corporateData.productName.trim(),

          deliveryNote: corporateData.notes.trim(),

          sentTotalPrice: totalSentPrice,

          receivedQuantity: finalReceivedQuantity,

          receivedUnit: finalReceivedUnit,

          receivedTotalPrice: finalReceivedTotal,

          receivedPricePerUnit: finalReceivedPricePerUnit,

          grandTotal: finalGrandTotal,

          discountValue: finalDiscount,

          discountReason: finalDiscount > 0 ? discountReason.trim() : "",

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
    <div className="min-h-screen bg-gray-50/60 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="group mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-900"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-0.5"
          />
          Back to Corporate Orders
        </button>

        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* HEADER */}
          <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <ShoppingCart size={20} className="text-blue-600" />
                </div>

                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Create Corporate Order
                  </h1>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Create and manage corporate purchase items
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            {/* WARNING */}
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle
                size={17}
                className="mt-0.5 shrink-0 text-amber-500"
              />

              <div>
                <p className="text-xs font-semibold text-amber-900">
                  Verify order information
                </p>

                <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                  Verify quantity, pricing, delivery status, payment status and
                  received information before creating the corporate order.
                </p>
              </div>
            </div>

            {/* ACCOUNT */}
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Building2 size={17} className="text-blue-600" />

                <h2 className="text-sm font-semibold text-gray-900">
                  Corporate Account 
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* CORPORATE ACCOUNT */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Corporate Account <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Building2
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      name="corpoAccId"
                      value={corporateData.corpoAccId}
                      onChange={handleCorporateChange}
                      className="w-full cursor-pointer appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="">Select Corporate Account</option>

                      {corporateOrderAcc?.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.businessName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    rows={2}
                    readOnly
                    value={selectedAccount?.address || ""}
                    placeholder="Select a corporate account to see the address"
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>
            </section>

            {/* PRODUCT / NOTES / STATUS */}
            <section>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* PRODUCT */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Product Name <span className="text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <Package
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      required
                      name="productName"
                      value={corporateData.productName}
                      onChange={handleCorporateChange}
                      placeholder="Enter product name"
                      className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* NOTES */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Delivery Notes 
                  </label>

                  <div className="relative">
                    <StickyNote
                      size={16}
                      className="absolute left-3 top-3.5 text-gray-400"
                    />

                    <textarea
                      rows={3}
                      name="notes"
                      value={corporateData.notes}
                      onChange={handleCorporateChange}
                      placeholder="Example: Please ensure delivery is completed before 7:00 AM at the rear entrance."
                      className="w-full resize-none rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* DELIVERY STATUS */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
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
                      className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="PROCESSING">Processing</option>

                      <option value="DELIVERED">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* PAYMENT STATUS */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
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
                      className="w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="PENDING">Pending</option>

                      <option value="COMPLETE">Complete</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* ORDER ITEMS */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList size={17} className="text-blue-600" />

                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">
                      Order Items <span className="text-red-500">*</span>
                    </h2>

                    <p className="text-xs text-gray-500">
                      The first item's unit controls all order items
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                  {items.length} {items.length === 1 ? "Item" : "Items"}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-200">
                {/* TABLE HEADER */}
                <div className="hidden min-w-[900px] grid-cols-[120px_140px_160px_160px_160px_50px] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 md:grid">
                  <span className="text-[11px] font-semibold uppercase text-gray-500">
                    Order Date
                  </span>

                  <span className="text-[11px] font-semibold uppercase text-gray-500">
                    Unit
                  </span>

                  <span className="text-[11px] font-semibold uppercase text-gray-500">
                    Quantity
                  </span>

                  <span className="text-[11px] font-semibold uppercase text-gray-500">
                    Price / Unit
                  </span>

                  <span className="text-[11px] font-semibold uppercase text-gray-500">
                    Order Total
                  </span>

                  <span />
                </div>

                {/* ITEMS */}
                <div className="divide-y divide-gray-100">
                  {items.map((item, index) => {
                    const itemTotal =
                      (Number(item.qty) || 0) *
                      (Number(item.pricePerUnit) || 0);

                    return (
                      <div
                        key={index}
                        className="grid min-w-[900px] gap-3 bg-white p-4 md:grid-cols-[120px_140px_160px_160px_160px_50px] md:items-center"
                      >
                        {/* DATE */}
                        <input
                          type="date"
                          name="orderDate"
                          value={item.orderDate}
                          onChange={(e) => handleItemChange(index, e)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs outline-none focus:border-blue-300"
                        />

                        {/* UNIT */}
                        <div className="relative">
                          <select
                            name="unit"
                            value={item.unit}
                            disabled={index !== 0}
                            onChange={(e) => handleItemChange(index, e)}
                            className={`w-full rounded-xl border border-gray-200 py-2.5 px-3 text-sm outline-none focus:border-blue-300 ${
                              index !== 0
                                ? "cursor-not-allowed bg-gray-100 text-gray-500"
                                : "cursor-pointer bg-white"
                            }`}
                          >
                            {units.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>

                          {index !== 0 && (
                            <p className="mt-1 text-[10px] text-gray-400">
                              Same as first item
                            </p>
                          )}
                        </div>

                        {/* QUANTITY */}
                        <div className="relative">
                          <Boxes
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name="qty"
                            value={item.qty}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="Qty"
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300"
                          />
                        </div>

                        {/* PRICE */}
                        <div className="relative">
                          <IndianRupee
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            name="pricePerUnit"
                            value={item.pricePerUnit}
                            onChange={(e) => handleItemChange(index, e)}
                            placeholder="Price"
                            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-300"
                          />
                        </div>

                        {/* TOTAL */}
                        <div className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5">
                          <IndianRupee size={14} className="text-blue-600" />

                          <span className="text-sm font-semibold text-blue-700">
                            {itemTotal.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={items.length === 1}
                          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* ADD ITEM */}
                <div className="border-t border-gray-200 bg-gray-50/70 p-3">
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <Plus size={16} />
                    Add Another Item
                  </button>
                </div>
              </div>
            </section>

            {/* SUMMARY */}
            <section>
              <div className="mb-4 flex items-center gap-2">
                <Calculator size={17} className="text-blue-600" />

                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Order Summary
                  </h2>

                  <p className="text-xs text-gray-500">
                    Compare sent order with the quantity actually received
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* SENT */}
                <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/40">
                  <div className="flex items-center justify-between border-b border-blue-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-blue-600" />

                      <p className="text-sm font-semibold text-gray-900">
                        Total Sent Order
                      </p>
                    </div>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                      SENT
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4">
                    <div className="rounded-xl border border-blue-100 bg-white p-3">
                      <p className="text-[11px] text-gray-500">Quantity</p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {totalSentQuantity.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-white p-3">
                      <p className="text-[11px] text-gray-500">Unit</p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {items[0]?.unit || "L"}
                      </p>
                    </div>

                    <div className="col-span-2 rounded-xl border border-blue-100 bg-white p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Total Sent Price
                        </span>

                        <span className="flex items-center gap-1 text-base font-bold text-blue-700">
                          <IndianRupee size={15} />

                          {totalSentPrice.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RECEIVED */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/40">
                  <div className="flex items-center justify-between border-b border-emerald-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <PackageCheck size={16} className="text-emerald-600" />

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Total Received Order
                        </p>

                        <p className="text-[11px] text-gray-500">
                          {isDeliveryPending
                            ? "Automatically calculated from order items"
                            : "Admin enters actual received values"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        corporateData.deliveryStatus === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {corporateData.deliveryStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4">
                    {/* RECEIVED QUANTITY */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                        Received Quantity
                        {isDeliveryPending && (
                          <span className="ml-1 text-emerald-600">(Auto)</span>
                        )}
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="quantity"
                        value={
                          isDeliveryPending
                            ? calculatedReceivedQuantity
                            : receivedData.quantity
                        }
                        onChange={handleReceivedChange}
                        disabled={isDeliveryPending}
                        placeholder="17.14"
                        className={`w-full rounded-xl border border-emerald-100 px-3 py-2.5 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 ${
                          isDeliveryPending
                            ? "cursor-not-allowed bg-gray-100 text-gray-600"
                            : "bg-white"
                        }`}
                      />
                    </div>

                    {/* RECEIVED UNIT */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                        Unit
                        {isDeliveryPending && (
                          <span className="ml-1 text-emerald-600">(Auto)</span>
                        )}
                      </label>

                      <select
                        name="unit"
                        value={
                          isDeliveryPending
                            ? calculatedReceivedUnit
                            : receivedData.unit
                        }
                        onChange={handleReceivedChange}
                        disabled={isDeliveryPending}
                        className={`w-full rounded-xl border border-emerald-100 px-3 py-2.5 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 ${
                          isDeliveryPending
                            ? "cursor-not-allowed bg-gray-100 text-gray-600"
                            : "cursor-pointer bg-white"
                        }`}
                      >
                        {units.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* PRICE PER UNIT */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                        Price / Unit
                        <span className="ml-1 text-emerald-600">(Auto)</span>
                      </label>

                      <div className="flex items-center rounded-xl border border-emerald-100 bg-gray-100 px-3 py-2.5">
                        <IndianRupee size={14} className="mr-1 text-gray-400" />

                        <span className="text-sm font-semibold text-gray-700">
                          {calculatedReceivedPricePerUnit.toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 2,
                            },
                          )}
                        </span>
                      </div>
                    </div>

                    {/* RECEIVED TOTAL */}
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-gray-600">
                        Received Total
                        {isDeliveryPending ? (
                          <span className="ml-1 text-emerald-600">(Auto)</span>
                        ) : (
                          <span className="ml-1 text-emerald-600">(Input)</span>
                        )}
                      </label>

                      <div className="relative">
                        <IndianRupee
                          size={15}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          name="totalPrice"
                          value={
                            isDeliveryPending
                              ? calculatedReceivedTotalPrice
                              : receivedData.totalPrice
                          }
                          onChange={handleReceivedChange}
                          disabled={isDeliveryPending}
                          placeholder="1200"
                          className={`w-full rounded-xl border border-emerald-100 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 ${
                            isDeliveryPending
                              ? "cursor-not-allowed bg-gray-100 text-gray-600"
                              : "bg-white"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ADJUSTMENT */}
            <section className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Minus size={16} className="text-orange-500" />

                <div>
                  <h2 className="text-sm font-semibold text-gray-900">
                    Discount / Adjustment
                  </h2>

                  <p className="text-[11px] text-gray-500">
                    Automatically calculated from sent total and received total
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* DISCOUNT */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
                    Discount / Adjustment
                    <span className="ml-1 text-orange-500">(Auto)</span>
                  </label>

                  <div className="flex items-center rounded-xl border border-gray-200 bg-gray-100 px-3 py-2.5">
                    <IndianRupee size={15} className="mr-1 text-gray-400" />

                    <span className="text-sm font-semibold text-gray-700">
                      {discount.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* REASON */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-700">
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
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            </section>

            {/* GRAND TOTAL */}
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="bg-gray-900 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-400">
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

              <div className="grid grid-cols-3 divide-x divide-gray-200 bg-white">
                <div className="p-4">
                  <p className="text-[11px] text-gray-500">Sent Total</p>

                  <p className="mt-1 text-sm font-semibold">
                    ₹
                    {totalSentPrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="p-4">
                  <p className="text-[11px] text-gray-500">Received Total</p>

                  <p className="mt-1 text-sm font-semibold text-emerald-600">
                    ₹
                    {calculatedReceivedTotalPrice.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="p-4">
                  <p className="text-[11px] text-gray-500">Adjustment</p>

                  <p className="mt-1 text-sm font-semibold text-orange-600">
                    - ₹
                    {discount.toLocaleString("en-IN", {
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
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

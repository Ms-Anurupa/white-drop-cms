/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo } from "react";
import {
  X,
  IndianRupee,
  Receipt,
  CreditCard,
  FileText,
  AlertCircle,
  Lock,
} from "lucide-react";
import orderDataStore from "@/zustand/Store/orderDataStore";

const AddOfflinePaymentModal = ({
  isOpen,
  onClose,
  contextType, // "SUBSCRIPTION" | "BULK_ORDER"
  contextData, // The actual object passed from the row/navigation
  onSuccess, 
}) => {
  const addOfflinePayment = orderDataStore((state) => state.addOfflinePayment);
  const [paymentRec, setPaymentRec] = useState("");
  const [payMode, setPayMode] = useState("COD");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Auto-calculate dueBefore based on previous logs or total amount
  const dueBefore = useMemo(() => {
    if (!contextData) return 0;

    const logs = contextData.offlinePaymentLogs;

    // If we have previous logs, get the dueAfter from the most recent one
    if (logs && logs.length > 0) {
      const sortedLogs = [...logs].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return Number(sortedLogs[0].dueAfter);
    }

    // Fallback: If no logs exist, the due amount is the total amount
    return Number(contextData.totalAmount || contextData.amount || 0);
  }, [contextData]);

  // 2. Auto-calculate dueAfter based on what they are paying right now
  const dueAfter = Math.max(0, dueBefore - (Number(paymentRec) || 0));

  useEffect(() => {
    if (isOpen) {
      setPaymentRec("");
      setPayMode("COD");
      setError(null);
    }
  }, [isOpen, contextData]);

  if (!isOpen || !contextData) return null;

  const isSubscription = contextType === "SUBSCRIPTION";
  const referenceId = isSubscription
    ? contextData.id || contextData.subId
    : contextData.id || contextData.bulkOrderId;

  const displayId = isSubscription
    ? contextData.subId || contextData.id
    : contextData.orderId || contextData.id;

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 1. Validate Input
    if (!paymentRec || Number(paymentRec) <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (Number(paymentRec) > dueBefore) {
       setError(`Payment cannot exceed the due amount of ₹${dueBefore}`);
       return;
    }

    // 2. Submit Data
    try {
      setIsLoading(true);

      const payload = {
        subId: isSubscription ? referenceId : null,
        bulkOrderId: !isSubscription ? referenceId : null,
        dueBefore,
        paymentRec: Number(paymentRec),
        dueAfter,
        payMode,
      };

      // Call the Zustand store method
      await addOfflinePayment(payload);

      // Trigger the callback to refresh the parent component's data
      if (onSuccess) onSuccess();
      
      // Close the modal
      onClose();
    } catch (err) {
      console.error("Payment submission failed:", err);
      // Fallback to err.message if err.response.data.message isn't available
      setError(
        err?.response?.data?.message || 
        err?.message || 
        "Failed to log payment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <Receipt size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Log Offline Payment
              </h2>
              <p className="text-[11px] text-gray-500">
                Record a manual payment transaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-2.5 text-xs text-red-600">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* LOCKED CONTEXT INFO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                Payment For
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700">
                <FileText size={15} className="text-gray-400" />
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {isSubscription ? "Subscription" : "Corporate / Bulk Order"}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    ID: {displayId}
                  </span>
                </div>
              </div>
            </div>

            {/* AMOUNTS ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center justify-between text-[11px] font-semibold text-gray-600">
                  <span>Due Before</span>
                  <Lock size={10} className="text-gray-400" />
                </label>
                <div className="relative">
                  <IndianRupee
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    value={dueBefore.toFixed(2)}
                    disabled
                    className="h-9 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm font-medium text-gray-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-600">
                  Payment Received <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500"
                  />
                  <input
                    type="number"
                    min="1"
                    max={dueBefore > 0 ? dueBefore : undefined}
                    step="0.01"
                    value={paymentRec}
                    onChange={(e) => setPaymentRec(e.target.value)}
                    placeholder="0.00"
                    required
                    disabled={dueBefore <= 0}
                    className="h-9 w-full rounded-lg border border-gray-200 pl-8 pr-3 text-sm font-semibold text-emerald-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* CALCULATED DUE AFTER */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-blue-100 bg-blue-50/50 p-3">
              <label className="flex items-center justify-between text-[11px] font-semibold text-blue-600">
                <span>Calculated Due After</span>
                <span className="text-[10px] font-normal text-blue-400/80">
                  (Auto-calculated)
                </span>
              </label>
              <div className="text-lg font-bold text-blue-900">
                ₹{dueAfter.toFixed(2)}
              </div>
            </div>

            {/* PAYMENT MODE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-600">
                Payment Mode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  disabled={dueBefore <= 0}
                  className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white pl-8 pr-8 text-sm text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="COD">COD (Cash on Delivery)</option>
                  <option value="UPI">UPI Transfer</option>
                  <option value="CASH">Direct Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l border-gray-200 pl-2">
                  <span className="text-[10px] text-gray-400">▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            {dueBefore <= 0 ? (
              <span className="text-xs font-medium text-emerald-600">
                Fully Paid
              </span>
            ) : (
              <span />
            )}
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || dueBefore <= 0}
                className="flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving...
                  </span>
                ) : (
                  "Save Payment Log"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOfflinePaymentModal;
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
  const [transactionId, setTransactionId] = useState("");
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
      setTransactionId("");
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

    if (payMode !== "COD" && !transactionId.trim()) {
       setError(`Please enter the ${payMode === "CHECK" ? "Check no" : "Transaction Id"}.`);
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
        refId: payMode !== "COD" ? transactionId : null,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 dark:bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white dark:bg-slate-900 dark:border dark:border-slate-800 shadow-2xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
              <Receipt size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-slate-100">
                Log Offline Payment
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                Record a manual payment transaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 dark:text-slate-400 transition hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-200 disabled:opacity-50 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-100 dark:border-red-800 bg-red-50 dark:bg-red-950/60 p-2.5 text-xs text-red-600 dark:text-red-300">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* LOCKED CONTEXT INFO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Payment For
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/70 px-3 py-2.5 text-sm text-gray-700 dark:text-slate-200">
                <FileText size={15} className="text-gray-400 dark:text-slate-500" />
                <div className="flex flex-col">
                  <span className="font-semibold">
                    {isSubscription ? "Subscription" : "Corporate / Bulk Order"}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-slate-400">
                    ID: {displayId}
                  </span>
                </div>
              </div>
            </div>

            {/* AMOUNTS ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="flex items-center justify-between text-[11px] font-semibold text-gray-600 dark:text-slate-300">
                  <span>Due Before</span>
                  <Lock size={10} className="text-gray-400 dark:text-slate-500" />
                </label>
                <div className="relative">
                  <IndianRupee
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                  />
                  <input
                    type="number"
                    value={dueBefore.toFixed(2)}
                    disabled
                    className="h-9 w-full cursor-not-allowed rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 pl-8 pr-3 text-sm font-medium text-gray-500 dark:text-slate-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-slate-300">
                  Payment Received <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 dark:text-emerald-400"
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
                    className="h-9 w-full rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 pl-8 pr-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* CALCULATED DUE AFTER */}
            <div className="flex flex-col gap-1.5 rounded-lg border border-blue-100 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50 p-3">
              <label className="flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                <span>Calculated Due After</span>
                <span className="text-[10px] font-normal text-blue-400/80 dark:text-blue-400/70">
                  (Auto-calculated)
                </span>
              </label>
              <div className="text-lg font-bold text-blue-900 dark:text-blue-200">
                ₹{dueAfter.toFixed(2)}
              </div>
            </div>

            {/* PAYMENT MODE */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-gray-600 dark:text-slate-300">
                Payment Mode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                />
                <select
                  value={payMode}
                  onChange={(e) => {
                    setPayMode(e.target.value);
                    setTransactionId(""); // Clear the transaction ID field when switching modes
                  }}
                  disabled={dueBefore <= 0}
                  className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-8 pr-8 text-sm text-gray-700 dark:text-slate-100 outline-none transition focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="COD">Cash</option>
                  <option value="PG">UPI</option>
                  <option value="CHECK">Check</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 border-l border-gray-200 dark:border-slate-700 pl-2">
                  <span className="text-[10px] text-gray-400 dark:text-slate-500">▼</span>
                </div>
              </div>
            </div>

            {/* CONDITIONAL TRANSACTION ID / CHECK NUMBER FIELD */}
            {payMode !== "COD" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-600 dark:text-slate-300">
                  {payMode === "CHECK" ? "Check no" : "Transaction Id"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
                  />
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder={payMode === "CHECK" ? "Enter check number" : "Enter transaction ID"}
                    required
                    disabled={dueBefore <= 0}
                    className="h-9 w-full rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-800 pl-8 pr-3 text-sm font-medium text-gray-700 dark:text-slate-100 dark:placeholder:text-slate-500 outline-none transition focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}

          </div>

          {/* FOOTER ACTIONS */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-4">
            {dueBefore <= 0 ? (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
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
                className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-medium text-gray-600 dark:text-slate-300 transition hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || dueBefore <= 0}
                className="flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:text-gray-500 dark:disabled:text-slate-400 cursor-pointer"
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